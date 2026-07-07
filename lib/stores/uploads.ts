import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import { CREATE_UPDATE_HOSTING_ROOM_IMAGE } from '@/lib/services/graphql/requests/mutations/hostings';
import { generateRNFile } from '@/lib/utils/file';
import type {
  CreateHostingRoomImageMutation,
  CreateHostingRoomImageMutationVariables,
} from '@/lib/services/graphql/generated';
import { useHostingRoomsStore } from './hostings';

const MAX_CONCURRENT = 3;
const MAX_ATTEMPTS = 4;
// Backoff (ms) before retrying attempt 2, 3, 4 — long enough to span real
// cell-handoff dead zones; ±30% jitter is applied so a whole batch doesn't
// retry in lockstep against a recovering radio.
const BACKOFF_MS = [5000, 15000, 45000];
const UPLOAD_DIR = (FileSystem.documentDirectory ?? '') + 'hosting-uploads/';
// An in-flight upload older than this is force-aborted by the watchdog (belt &
// suspenders on top of the per-request timeout in formMutation).
const STUCK_MS = 120_000;
// Persisted tasks older than this are reaped on resume (treated as unrecoverable).
const MAX_TASK_AGE_MS = 24 * 60 * 60 * 1000;
const WATCHDOG_MS = 30_000;

// "error" = failed but user-retryable; "dead" = unrecoverable (file gone / too
// old / cancelled) and never auto-resurrected.
export type ImageUploadStatus = 'queued' | 'uploading' | 'error' | 'dead';

export type UploadTask = {
  /** Persistent local copy uri — also the url shown in the room until it uploads. */
  uri: string;
  roomId: string;
  status: ImageUploadStatus;
  attempts: number;
  /** When the task was first enqueued (for reaping stale persisted tasks). */
  createdAt: number;
  /** When the current upload attempt started (for the stuck-watchdog). */
  startedAt?: number;
  /** When set, replace this existing server image in place (edited photo) rather
   *  than creating a new one. */
  replaceImageId?: string;
  /** Why the last attempt failed — shown on the failed row so retries that keep
   *  failing are diagnosable instead of looking like a dead button. */
  lastError?: string;
  /** Earliest time the next attempt may start (real backoff — pump() skips the
   *  task until then). Additive + persist-compatible: absent = immediately
   *  eligible. */
  nextAttemptAt?: number;
};

/** A photo to upload. `replaceImageId` updates an existing server image in place. */
export type UploadItem = { uri: string; replaceImageId?: string };

// Just-uploaded publicUrl → asset registry (module-scope, NOT persisted). Lets
// resolveThumb proxy fresh uploads through the resize CDN immediately: without
// it, each completed photo decoded its full-resolution original into an 88px
// thumbnail (the batch-completion memory/GC freeze), then reloaded again after
// the drain refetch. The id + lastUpdated here produce the exact same proxy URL
// the post-refetch imageAssets map yields, so the thumbnail loads once.
const uploadedAssets = new Map<string, { id: string; version?: string | null }>();
export const getUploadedAsset = (url: string) => uploadedAssets.get(url);

interface UploadState {
  /** Active room-image uploads, keyed by uri. Successful ones are removed. */
  tasks: Record<string, UploadTask>;
  /** Completed / total for the current run (drives the progress toast). */
  done: number;
  total: number;
  enqueue: (roomId: string, items: UploadItem[]) => Promise<void>;
  retry: (uri: string) => void;
  retryAll: () => void;
  /** Re-queue interrupted uploads (called once after rehydration). */
  resume: () => void;
  /** Cancel + forget a single task (aborts in-flight, deletes its file copy). */
  removeTask: (uri: string) => void;
  /** Cancel + forget the whole queue — the in-app escape from a wedged batch. */
  clearAll: () => void;
}

// AbortControllers for in-flight requests — NOT persisted (can't serialize), kept
// at module scope so clear/remove/watchdog can cancel running uploads.
const controllers = new Map<string, AbortController>();
let watchdog: ReturnType<typeof setInterval> | null = null;

/**
 * Background room-image upload queue. Decoupled from any screen, it:
 *  - copies each picked photo into a persistent folder so an app kill can't lose it,
 *  - uploads with bounded concurrency + automatic retry/backoff,
 *  - bounds every request (timeout) so it can never hang the queue,
 *  - is cancellable (per-task and whole-queue) and self-heals stuck/dead tasks,
 *  - swaps the thumbnail's local uri → uploaded url on success and deletes the copy,
 *  - persists itself and resumes on next launch (without resurrecting dead work),
 *  - exposes progress for the app-wide toast and the publish-time gate.
 */
export const useUploadStore = create<UploadState>()(
  persist(
    (set, get) => {
      const ensureDir = async () => {
        try {
          const info = await FileSystem.getInfoAsync(UPLOAD_DIR);
          if (!info.exists) {
            await FileSystem.makeDirectoryAsync(UPLOAD_DIR, { intermediates: true });
          }
        } catch {
          // best-effort; copy below will fall back to the original uri
        }
      };

      // Only delete files WE copied into UPLOAD_DIR — never the user's originals.
      const deleteCopy = (uri: string) => {
        if (uri.startsWith(UPLOAD_DIR)) {
          FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
        }
      };

      const setStatus = (uri: string, patch: Partial<UploadTask>) =>
        set((s) => {
          const task = s.tasks[uri];
          if (!task) return s;
          return { tasks: { ...s.tasks, [uri]: { ...task, ...patch } } };
        });

      const activeCount = (tasks: Record<string, UploadTask>) =>
        Object.values(tasks).filter((t) => t.status === 'queued' || t.status === 'uploading')
          .length;

      const stopWatchdogIfIdle = () => {
        if (watchdog && activeCount(get().tasks) === 0) {
          clearInterval(watchdog);
          watchdog = null;
        }
      };

      const ensureWatchdog = () => {
        if (watchdog) return;
        watchdog = setInterval(() => {
          const now = Date.now();
          // Abort any upload that's been in-flight too long → its catch retries/fails.
          Object.values(get().tasks).forEach((t) => {
            if (t.status === 'uploading' && t.startedAt && now - t.startedAt > STUCK_MS) {
              controllers.get(t.uri)?.abort();
            }
          });
          pump();
          stopWatchdogIfIdle();
        }, WATCHDOG_MS);
      };

      // Connectivity state for the queue (kept fresh by the listener registered
      // below, after runOne). Nigerian networks drop and stall constantly — the
      // queue pauses while offline and auto-resumes on reconnect.
      let online = true;
      let cellular = false;
      const NETWORK_ERROR_RE = /network request failed|failed to fetch|timed out|abort/i;

      const pump = () => {
        const list = Object.values(get().tasks);
        if (activeCount(get().tasks) > 0) ensureWatchdog();
        // Offline: pause instead of burning attempts. The connectivity listener
        // (and the watchdog tick) pumps again when the radio returns.
        if (!online) return;
        const inFlight = list.filter((t) => t.status === 'uploading').length;
        // On cellular, 3 parallel multi-MB POSTs split a slow uplink three ways
        // and push ALL of them past the request timeout — sequential uploads on
        // the same link actually complete.
        const limit = cellular ? 1 : MAX_CONCURRENT;
        const slots = limit - inFlight;
        if (slots <= 0) return;
        const now = Date.now();
        list
          .filter(
            (t) => t.status === 'queued' && (!t.nextAttemptAt || t.nextAttemptAt <= now),
          )
          .slice(0, slots)
          .forEach((t) => void runOne(t.uri));
      };

      const runOne = async (uri: string) => {
        const task = get().tasks[uri];
        if (!task || task.status === 'uploading') return;

        const controller = new AbortController();
        controllers.set(uri, controller);
        setStatus(uri, { status: 'uploading', startedAt: Date.now() });

        try {
          const res = await formMutation<
            CreateHostingRoomImageMutation,
            CreateHostingRoomImageMutationVariables
          >(
            CREATE_UPDATE_HOSTING_ROOM_IMAGE,
            {
              input: {
                // With an id, the server replaces that image's asset in place
                // (preserving its order/cover); without, it creates a new image.
                ...(task.replaceImageId ? { id: task.replaceImageId } : {}),
                roomId: task.roomId,
                asset: generateRNFile(uri),
              },
            },
            { signal: controller.signal },
          );

          const asset = res.data?.createHostingRoomImage.data?.asset;
          const url = asset?.publicUrl;
          if (res.error || !url) throw res.error ?? new Error('Upload failed');

          // Register BEFORE the thumbnail swap so the very render it triggers
          // can already resolve the resize-proxy URL (no full-res decode).
          if (asset.id) {
            uploadedAssets.set(url, { id: asset.id, version: asset.lastUpdated });
          }
          useHostingRoomsStore.getState().replaceRoomImageUrl(task.roomId, uri, url);
          deleteCopy(uri);
          controllers.delete(uri);

          set((s) => {
            const next = { ...s.tasks };
            delete next[uri];
            const done = s.done + 1;
            // Reset run counters once NOTHING is queued/uploading (errors/dead
            // tasks may linger) — so the toast can never freeze at "15 of 15".
            return activeCount(next) === 0
              ? { tasks: next, done: 0, total: 0 }
              : { tasks: next, done };
          });
          pump();
          stopWatchdogIfIdle();
        } catch (e) {
          controllers.delete(uri);
          const message =
            e instanceof Error ? e.message : typeof e === 'string' ? e : 'Upload failed';
          console.warn(`[uploads] attempt failed for ${uri}:`, message);
          if (!online) {
            // Offline: park the task WITHOUT consuming an attempt — pump() is
            // gated on connectivity, and the reconnect listener resumes the
            // queue. Burning attempts while the radio is down permanently
            // errored whole batches after ~15s of outage.
            setStatus(uri, { status: 'queued', startedAt: undefined, lastError: message });
          } else {
            const attempts = (get().tasks[uri]?.attempts ?? 0) + 1;
            if (attempts < MAX_ATTEMPTS) {
              const base = BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)];
              // ±30% jitter so a batch doesn't retry in lockstep.
              const delay = Math.round(base * (0.7 + Math.random() * 0.6));
              setStatus(uri, {
                status: 'queued',
                attempts,
                startedAt: undefined,
                lastError: message,
                // Real backoff: pump() skips the task until this time, so the
                // synchronous pump() below can no longer defeat the delay by
                // re-running it instantly.
                nextAttemptAt: Date.now() + delay,
              });
              setTimeout(pump, delay + 50);
            } else {
              setStatus(uri, {
                status: 'error',
                attempts,
                startedAt: undefined,
                lastError: message,
              });
            }
          }
          // Reset counters if this failure leaves nothing active.
          set((s) => (activeCount(s.tasks) === 0 ? { done: 0, total: 0 } : s));
          pump();
          stopWatchdogIfIdle();
        }
      };

      // Module-lifetime connectivity tracking (same API the tanstack provider
      // uses). On (re)connect, requeue network-failed tasks and restart the
      // pump — previously an outage longer than the ~15s retry budget
      // permanently errored the batch with no auto-resume until next launch.
      const applyNetworkState = (state: {
        isConnected?: boolean | null;
        type?: Network.NetworkStateType | null;
      }) => {
        online = state.isConnected !== false;
        cellular = state.type === Network.NetworkStateType.CELLULAR;
      };
      const requeueNetworkFailures = () => {
        if (!online) return;
        Object.values(get().tasks)
          .filter(
            (t) => t.status === 'error' && (!t.lastError || NETWORK_ERROR_RE.test(t.lastError)),
          )
          .forEach((t) =>
            setStatus(t.uri, {
              status: 'queued',
              attempts: 0,
              startedAt: undefined,
              nextAttemptAt: undefined,
            }),
          );
        pump();
      };
      // Seed the flags immediately: Android emits NO initial listener event, so
      // an app opened offline would otherwise keep the optimistic online=true,
      // burn every attempt, and never observe an offline→online transition.
      Network.getNetworkStateAsync()
        .then((state) => {
          applyNetworkState(state);
          if (online) pump();
        })
        .catch(() => {});
      // Requeue on ANY event that reports us online (not just an observed
      // offline→online flip) — network events are rare, and the filter keeps
      // this bounded to genuinely network-failed tasks.
      Network.addNetworkStateListener((state) => {
        applyNetworkState(state);
        requeueNetworkFailures();
      });

      return {
        tasks: {},
        done: 0,
        total: 0,

        enqueue: async (roomId, items) => {
          if (items.length === 0) return;
          await ensureDir();
          // Accumulate all new tasks into ONE store write: per-item set()s meant
          // a 20-photo pick did 20 persisted writes + 20 subscriber passes.
          const newTasks: Record<string, UploadTask> = {};
          for (const item of items) {
            const localUri = item.uri;
            const ext = (localUri.split('.').pop() || 'jpg').split('?')[0].slice(0, 5);
            const dest = `${UPLOAD_DIR}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            let uri = localUri;
            try {
              await FileSystem.copyAsync({ from: localUri, to: dest });
              uri = dest;
              // Show the persistent copy in the room so the thumbnail survives a kill too.
              useHostingRoomsStore.getState().replaceRoomImageUrl(roomId, localUri, dest);
            } catch {
              // Copy failed — upload the original uri (won't survive a kill, but works now).
            }
            newTasks[uri] = {
              uri,
              roomId,
              status: 'queued',
              attempts: 0,
              createdAt: Date.now(),
              replaceImageId: item.replaceImageId,
            };
          }
          set((s) => ({
            tasks: { ...s.tasks, ...newTasks },
            total: s.total + Object.keys(newTasks).length,
          }));
          pump();
        },

        retry: (uri) => {
          if (!get().tasks[uri]) return;
          void (async () => {
            // If the source file has been purged (common for picker-cache uris
            // when the copy step failed), retrying can never succeed — surface
            // that instead of silently error-cycling forever.
            const info = await FileSystem.getInfoAsync(uri).catch(() => ({ exists: false }));
            if (!info.exists) {
              setStatus(uri, { status: 'dead', startedAt: undefined });
              return;
            }
            setStatus(uri, { status: 'queued', attempts: 0, startedAt: undefined, nextAttemptAt: undefined });
            pump();
          })();
        },

        retryAll: () => {
          // Only "error" is retryable; "dead" tasks (file gone) can't be recovered.
          void (async () => {
            const failed = Object.values(get().tasks).filter((t) => t.status === 'error');
            for (const t of failed) {
              const info = await FileSystem.getInfoAsync(t.uri).catch(() => ({ exists: false }));
              if (!info.exists) {
                setStatus(t.uri, { status: 'dead', startedAt: undefined });
              } else {
                setStatus(t.uri, { status: 'queued', attempts: 0, startedAt: undefined, nextAttemptAt: undefined });
              }
            }
            pump();
          })();
        },

        removeTask: (uri) => {
          controllers.get(uri)?.abort();
          controllers.delete(uri);
          deleteCopy(uri);
          set((s) => {
            if (!s.tasks[uri]) return s;
            const next = { ...s.tasks };
            delete next[uri];
            return activeCount(next) === 0 ? { tasks: next, done: 0, total: 0 } : { tasks: next };
          });
          pump();
          stopWatchdogIfIdle();
        },

        clearAll: () => {
          controllers.forEach((c) => c.abort());
          controllers.clear();
          uploadedAssets.clear();
          Object.values(get().tasks).forEach((t) => deleteCopy(t.uri));
          if (watchdog) {
            clearInterval(watchdog);
            watchdog = null;
          }
          set({ tasks: {}, done: 0, total: 0 });
        },

        resume: () => {
          // Async work in a fire-and-forget IIFE so the signature stays () => void.
          void (async () => {
            const now = Date.now();
            const current = get().tasks;
            const next: Record<string, UploadTask> = {};
            for (const t of Object.values(current)) {
              const createdAt = t.createdAt ?? now;
              // Reap tasks too old to trust.
              if (now - createdAt > MAX_TASK_AGE_MS) {
                next[t.uri] = { ...t, createdAt, status: 'dead', startedAt: undefined };
                continue;
              }
              // Verify the local copy still exists; if not, it's unrecoverable.
              let exists = true;
              try {
                exists = (await FileSystem.getInfoAsync(t.uri)).exists;
              } catch {
                exists = true; // can't tell → don't kill it
              }
              if (!exists) {
                next[t.uri] = { ...t, createdAt, status: 'dead', startedAt: undefined };
                continue;
              }
              // Re-queue only interrupted in-flight uploads; keep attempts so a
              // permanently-failing upload can't loop forever across sessions.
              // Leave "error"/"dead" alone (user retries/clears them).
              next[t.uri] =
                t.status === 'uploading'
                  ? {
                      ...t,
                      createdAt,
                      status: 'queued',
                      startedAt: undefined,
                      nextAttemptAt: undefined,
                    }
                  : { ...t, createdAt };
            }
            set({ tasks: next });
            pump();

            // Sweep orphaned upload copies (files with no matching task) left by
            // past sessions, so the persistent folder can't grow unbounded.
            try {
              const entries = await FileSystem.readDirectoryAsync(UPLOAD_DIR);
              const referenced = new Set(Object.keys(next));
              await Promise.all(
                entries.map((name) =>
                  referenced.has(UPLOAD_DIR + name)
                    ? Promise.resolve()
                    : FileSystem.deleteAsync(UPLOAD_DIR + name, { idempotent: true }).catch(
                        () => {},
                      ),
                ),
              );
            } catch {
              // dir missing or unreadable — nothing to sweep
            }
          })();
        },
      };
    },
    {
      name: 'hosting-uploads-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ tasks: s.tasks, done: s.done, total: s.total }),
      onRehydrateStorage: () => (state) => {
        if (!state || Object.keys(state.tasks ?? {}).length === 0) return;
        // Resume any unfinished uploads from a previous app session.
        setTimeout(() => useUploadStore.getState().resume(), 0);
      },
    },
  ),
);

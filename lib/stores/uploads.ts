import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { CREATE_UPDATE_HOSTING_ROOM_IMAGE } from "@/lib/services/graphql/requests/mutations/hostings";
import { generateRNFile } from "@/lib/utils/file";
import type {
  CreateHostingRoomImageMutation,
  CreateHostingRoomImageMutationVariables,
} from "@/lib/services/graphql/generated";
import { useHostingRoomsStore } from "./hostings";

const MAX_CONCURRENT = 3;
const MAX_ATTEMPTS = 4;
// Backoff (ms) before retrying attempt 2, 3, 4.
const BACKOFF_MS = [1500, 4000, 9000];
const UPLOAD_DIR = (FileSystem.documentDirectory ?? "") + "hosting-uploads/";

export type ImageUploadStatus = "queued" | "uploading" | "error";

export type UploadTask = {
  /** Persistent local copy uri — also the url shown in the room until it uploads. */
  uri: string;
  roomId: string;
  status: ImageUploadStatus;
  attempts: number;
  /** When set, replace this existing server image in place (edited photo) rather
   *  than creating a new one. */
  replaceImageId?: string;
};

/** A photo to upload. `replaceImageId` updates an existing server image in place. */
export type UploadItem = { uri: string; replaceImageId?: string };

interface UploadState {
  /** Active room-image uploads, keyed by uri. Successful ones are removed. */
  tasks: Record<string, UploadTask>;
  /** Completed / total for the current run (drives the progress toast). */
  done: number;
  total: number;
  enqueue: (roomId: string, items: UploadItem[]) => Promise<void>;
  retry: (uri: string) => void;
  retryAll: () => void;
  /** Re-queue interrupted/failed uploads (called once after rehydration). */
  resume: () => void;
}

/**
 * Background room-image upload queue (Phase 2). Decoupled from any screen, it:
 *  - copies each picked photo into a persistent folder so an app kill can't lose it,
 *  - uploads with bounded concurrency + automatic retry/backoff,
 *  - swaps the thumbnail's local uri → uploaded url on success and deletes the copy,
 *  - persists itself and resumes on next launch,
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

      const setStatus = (uri: string, patch: Partial<UploadTask>) =>
        set((s) => {
          const task = s.tasks[uri];
          if (!task) return s;
          return { tasks: { ...s.tasks, [uri]: { ...task, ...patch } } };
        });

      const pump = () => {
        const list = Object.values(get().tasks);
        const inFlight = list.filter((t) => t.status === "uploading").length;
        const slots = MAX_CONCURRENT - inFlight;
        if (slots <= 0) return;
        list
          .filter((t) => t.status === "queued")
          .slice(0, slots)
          .forEach((t) => void runOne(t.uri));
      };

      const runOne = async (uri: string) => {
        const task = get().tasks[uri];
        if (!task || task.status === "uploading") return;
        setStatus(uri, { status: "uploading" });

        try {
          const res = await formMutation<
            CreateHostingRoomImageMutation,
            CreateHostingRoomImageMutationVariables
          >(CREATE_UPDATE_HOSTING_ROOM_IMAGE, {
            input: {
              // With an id, the server replaces that image's asset in place
              // (preserving its order/cover); without, it creates a new image.
              ...(task.replaceImageId ? { id: task.replaceImageId } : {}),
              roomId: task.roomId,
              asset: generateRNFile(uri),
            },
          });

          const url = res.data?.createHostingRoomImage.data?.asset.publicUrl;
          if (res.error || !url) throw res.error ?? new Error("Upload failed");

          useHostingRoomsStore.getState().replaceRoomImageUrl(task.roomId, uri, url);
          FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});

          set((s) => {
            const next = { ...s.tasks };
            delete next[uri];
            const done = s.done + 1;
            // Reset the run counters once the queue is fully drained.
            return Object.keys(next).length === 0
              ? { tasks: next, done: 0, total: 0 }
              : { tasks: next, done };
          });
          pump();
        } catch {
          const attempts = (get().tasks[uri]?.attempts ?? 0) + 1;
          if (attempts < MAX_ATTEMPTS) {
            setStatus(uri, { status: "queued", attempts });
            const delay = BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)];
            setTimeout(pump, delay);
          } else {
            setStatus(uri, { status: "error", attempts });
          }
          pump();
        }
      };

      return {
        tasks: {},
        done: 0,
        total: 0,

        enqueue: async (roomId, items) => {
          if (items.length === 0) return;
          await ensureDir();
          for (const item of items) {
            const localUri = item.uri;
            const ext = (localUri.split(".").pop() || "jpg").split("?")[0].slice(0, 5);
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
            set((s) => ({
              tasks: {
                ...s.tasks,
                [uri]: {
                  uri,
                  roomId,
                  status: "queued",
                  attempts: 0,
                  replaceImageId: item.replaceImageId,
                },
              },
              total: s.total + 1,
            }));
          }
          pump();
        },

        retry: (uri) => {
          if (!get().tasks[uri]) return;
          setStatus(uri, { status: "queued", attempts: 0 });
          pump();
        },

        retryAll: () => {
          Object.values(get().tasks)
            .filter((t) => t.status === "error")
            .forEach((t) => setStatus(t.uri, { status: "queued", attempts: 0 }));
          pump();
        },

        resume: () => {
          set((s) => {
            const tasks = { ...s.tasks };
            // Anything not already queued was interrupted or failed — give it a fresh shot.
            Object.values(tasks).forEach((t) => {
              if (t.status !== "queued") {
                tasks[t.uri] = { ...t, status: "queued", attempts: 0 };
              }
            });
            return { tasks };
          });
          pump();
        },
      };
    },
    {
      name: "hosting-uploads-store",
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

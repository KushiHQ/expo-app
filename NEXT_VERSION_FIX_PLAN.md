# Next App Version — Fix Plan

_Investigation of the tester's notes + founder observations. Each item: root cause (file:line), the fix, the layer, and risk. ⚠️ = touches the **server** (announce before editing). Investigated 2026-06-15._

---

## Consolidations (fewer fixes than it looks)
- **Android blank screen on a protected route** and **Explore account can start KYC** are the **same root cause**: protected route *groups* have no `AuthGuard`. One systemic fix covers both.
- **"Yellow notification card not clickable"** is resolved by **removing the spammy hosting notification** you flagged — same change.
- **"Can't delete listings", "KYC not syncing", folder staleness** are all the **same urql document-cache gap** — the app invalidates lists by manually calling `refetch(network-only)` after mutations, and breaks wherever a dev forgot to wire that callback.

---

## P0 — Correctness / security (do first)

### 1. ⚠️+app — Protected routes unguarded → Android blank screen **and** Explore can start KYC
**Root cause:** There's an `AuthGuard` component (`components/guards/auth-guard.tsx:16` — renders children if `user?.user?.id`, else `<Redirect href="/auth" />`) used on *some* screens, but **not** on the protected route-group layouts. `app/guest/_layout.tsx`, `app/host/_layout.tsx`, and `app/kyc/_layout.tsx` render their `Tabs`/`Stack` with no guard. The only redirect is an imperative `router.replace()` in `app/index.tsx:42-44`, which never runs when you land directly on a protected route (deep link, notification tap, session expiry). On 401, `graphql-client.tsx:71-74,86-90` resets the store but does **not** navigate → the screen stays mounted with empty data on the near-black theme = the blank screen. iOS hydrates fast enough to mask it; Android (slower AsyncStorage + New Arch timing) paints the empty screen first. Explore = the default user store with no `user.id` (`lib/stores/users.ts:6-9`); `app/onboarding/index.tsx:41` pushes Explore straight to `/guest/home`.

**Fix:**
1. Make `AuthGuard` hydration-aware: while `useUserStore.persist.hasHydrated()` is false, render a loading screen (never bare `null`); then declarative `<Redirect href="/auth">` if no `user.user?.id`. Declarative redirect is reliable cross-platform (the imperative effect is the Android divergence).
2. Wrap the protected group layouts in `AuthGuard`: `app/guest/_layout.tsx`, `app/host/_layout.tsx`, `app/kyc/_layout.tsx` (KYC fix = consistent with already-guarded `users/_layout.tsx`, `reservation/_layout.tsx`).
3. In `graphql-client.tsx` `refreshAuth` failure path, navigate to `/auth` after `reset()` so a mid-session expiry kicks out instead of leaving a blank screen.
**Server:** none — KYC mutations already require `ensure_user` (`server/src/users/mutations/users.rs:126`), so Explore (no token) is already rejected server-side; this is purely a client guard gap (Explore can *walk the UI* and fail confusingly at the network call). **Risk:** low; biggest care is not flashing logged-in users to `/auth` before hydration (hence step 1).

### 2. app — Can't delete listings (delete succeeds, list doesn't refresh)
**Root cause:** `DELETE_HOSTING` succeeds server-side but `m-listing-options.tsx:27-41` only closes the sheet; `ListingOptions` is rendered with no `onDelete` callback (`o-listing-card.tsx:134`, `o-listing-list-item.tsx:138`), and `DELETE_HOSTING` returns `{ message }` only (`mutations/hostings.ts:314`) so the document cache can't invalidate `HOST_LISTINGS_QUERY`. The row stays until pull-to-refresh/restart → looks broken.
**Fix:** add `onDelete?: () => void` to `ListingOptions`, call it on success, thread it through the two card components to `app/host/listings.tsx` which already has `refresh` from `useInfiniteQuery` (`:33`). **Risk:** low.

### 3. app — KYC state not syncing on hosting page until restart
**Root cause:** The hosting-form gate reads `useKycStatusQuery()` (`app/hostings/form/index.tsx:27`), default `cache-first`. The `KycStatus` type has **no `id`** and a unique `__typename` (`generated:1475`); the completion mutations `verifyKyc`/`uploadKycImage` return `Kyc`/`User` (`mutations/users.ts:72-96`) — different typename — so the document cache never invalidates the cached "incomplete" value.
**Fix (quick):** add `requestPolicy: 'cache-and-network'` to `useKycStatusQuery()` at `app/hostings/form/index.tsx:27` (re-validates on mount). (Superseded by the graphcache option in §7.) **Risk:** very low.

---

## P1 — Visible UX / spam

### 4. ⚠️ — Remove hosting created/updated notifications (spam) → also fixes "yellow card not clickable"
**Root cause:** `server/src/housing/db_queries/hostings.rs:453-474` fires a notification on **every** `create_or_update` — and since listing creation is a multi-step wizard that saves on each step, it spams. It also sets `intent: NewMessage` (the *chat* intent) + `subject: Hosting`; the mobile **push-tap** handlers (`components/contexts/notifications.tsx`) only route when `intent === 'notification'`, so tapping that push does nothing = "not clickable". (The in-app card *does* route `Hosting → /hostings/{id}`; coloring is just unread=orange/read=grey, not per-type.)
**Fix:** delete the notification block at `hostings.rs:453-474` and prune now-unused imports (`NotificationIntent`/`NotificationSubject`/`NotificationType` at `:28`). Removes the spam and the dead-tap card in one go. Result is discarded (`let _ = ...`) so nothing depends on it. **Server change — confirm.** **Risk:** low.

### 5. app — Saved listings: folders can't be selected to delete/organize
**Root cause:** Not a cache bug. Folder delete exists but only via an **undiscoverable long-press** (`m-saved-hosting-folder-card.tsx:57`); the "Select" mode (`app/guest/saved.tsx:75-101`) operates only on the *Unsorted* grid, never on the Collections/folders grid (no `selectMode` props passed to the folder cards at `:213-244`).
**Fix:** add a visible kebab/trash affordance to `SavedHostingFolderCard` (the per-card `handleDelete` already exists at `:28-40`) — smallest change. (Optional: extend select-mode to the folders grid.) **Risk:** low.

### 6. app + ⚠️ — Saved-folder card: overlapping text + "few" + differs before/after refresh
**Root cause:** (a) **Layout:** the text container `View` (`m-saved-hosting-folder-card.tsx:94`) has no `flex:1`/`minWidth:0`, and the count/date row (`:102-123`) texts lack `numberOfLines`/`flexShrink`, so long content overflows the icon. (b) **"few":** the string is **not in the client** (exhaustive grep) — it comes from the **server**; the create mutation returns only `{ message, data { id } }` (`mutations/hostings.ts:3`), so the freshly-created card shows the server's first value (with "few"), and after `refetchFolders(network-only)` (`saved.tsx:103-106`) it shows the normalized name (no "few").
**Fix:** (a) client: constrain + truncate the folder-card text (`flex:1, minWidth:0` + `numberOfLines={1}` on count/date). (b) ⚠️ **server:** in the saved-hosting-folder resolver (`server/src/housing/`), remove "few" from the default/computed folder label, and have `createUpdateSavedHostingFolder` return the full `{ folderName, itemCount }` so the new card matches the refreshed one. **Confirm server scope.** **Risk:** low.

---

## P2 — Native (Android splash)

### 7. native — Android splash wordmark clipped at the sides
**Root cause:** Android 12+ renders the splash icon (`windowSplashScreenAnimatedIcon`, `styles.xml:13-18`) inside a **fixed circular mask** and **ignores `imageWidth`** + `resizeMode` (those only affect the legacy splash). A wide wordmark cannot fit the circle — prior attempts (`app.config.js:186-194`, commit `ad4992d`) couldn't win against the OS mask. Stale local drawables (May 23) also mislead local testing; CI/EAS regenerates them.
**Fix:** use a **square logo *mark*** (no horizontal text) for `android.image` in `app.config.js`, sized so content ≤ ~66% of the canvas (A12 safe zone); keep the wordmark for iOS and the in-app screen. Drop the ignored `imageWidth: 320`. Then `expo prebuild --clean -p android` so stale drawables regenerate. (Needs a new square asset.) **Risk:** low, but requires a design asset + a native rebuild to verify.

---

## Systemic — urql cache invalidation (the founder's hunch, confirmed)
The app uses urql's **document `cacheExchange`** (`graphql-client.tsx:48`), no graphcache, no `additionalTypenames`. Message-only mutations (`deleteHosting`, `deleteSavedHosting*`, `createUpdateSavedHosting*`) can't invalidate their list queries, so the team hand-wires `refetch(network-only)` callbacks per screen — and bugs appear wherever one was forgotten (that's exactly #2, #3).

**Two paths:**
- **A (short-term, matches current style):** finish the manual callback pattern for the missing pairs (#2 deleteHosting→HostListings; #3 verifyKyc→KycStatus). Ships the P0/P1 fixes now.
- **B (long-term, recommended):** adopt `@urql/exchange-graphcache` with `keys` (`KycStatus: () => null`) + `updates.Mutation` invalidations for the message-only mutations. Removes the scattered manual refetches and prevents the *next* "forgot the callback" bug. Bigger change; do as a follow-up after this release.

Suggested: ship **A** for this release (fast, low-risk), schedule **B** as a dedicated follow-up.

---

## Suggested order for this release
1. §1 AuthGuard on route groups (fixes Android blank + Explore KYC) — **P0**
2. §2 listing-delete refresh — **P0**
3. §3 KYC `cache-and-network` — **P0**
4. §4 remove hosting notification (server) — **P1** ⚠️
5. §5 folder delete affordance — **P1**
6. §6 folder text truncation (client) + copy/return-data (server) — **P1** ⚠️
7. §7 Android splash mark (needs asset) — **P2**
8. §“B” graphcache adoption — **follow-up release**

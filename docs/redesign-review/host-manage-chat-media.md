# Review: host management, saved collections, chat and media

Scope: what a host does after a listing is live (applications, the accepted
tenant, payout, caution deposit, agreement), saved collections, one-to-one chat
with calls, and photo viewing. Branch `feat/redesign-manage`, based on
`feat/redesign-2`.

## 1. Flow map

### Applications (host)

Current:

```
Host tabs ─ Applications (/host/applications, new kit) ─ row ─▶ /applications/[id] (new kit)
Listing hub (/hostings/form/onboarding) ─ "Booking applications" ─▶ /hostings/[id]/booking-applications (old kit)
      └─ card ─▶ /hostings/[id]/booking-applications/[applicationId] (old kit, second review screen)
Notification (bookingapplication, host) ─▶ /users/booking-applications/[id] ─ replace ─▶ old review screen
Push (host) ─▶ /applications/[id]
```

Two review screens for the same record, built differently: the old one shows
email, phone, lease end and "View booking"; the new one shows verification,
guarantor, caution and agreement. A host lands on either depending on the door
they came in through.

Proposed:

```
/host/applications            board: To review · Accepted · Closed, filter by listing
   phone: row ─▶ /applications/[id]
   tablet: list | detail side by side (same ApplicationReview component)
/hostings/[id]/booking-applications   same board, pre-filtered to that listing
/hostings/[id]/booking-applications/[applicationId]   <Redirect> ─▶ /applications/[applicationId]
/applications/[id]            the single review screen:
   who (name, photo, applied when) → verification ladder (NIN, BVN, phone, signature)
   → the stay (move in, end date, length, rent, deposit) → about them → guarantor
   → documents (signed agreement) → decision (accept with code / decline with a reason)
   after accepting: tenancy status (awaiting payment / paid into escrow / released),
   payout, caution deposit (HostCaution), agreement
```

### Saved

Current: the Saved tab (new kit) lists every saved home, no collections.
Collections exist on the server (`savedHostingFolders`, `folderId`) and the old
folder screen `/hostings/folders/[id]` is unreachable from the new app (only an
old, unused folder card links there).

Proposed: Saved tab = collections strip (open, create) above the saved grid,
filterable by collection; each saved home can be moved to a collection.
`/hostings/folders/[id]` is rebuilt as the collection screen (rename, delete,
add saved homes, move/remove) in the new kit, same grid as the Saved tab.

### Chat and calls

Current: Inbox (new kit) ─▶ `/chats/[id]` (old DetailsLayout header, old input
and bubbles, new footer card) ─▶ `/chats/[id]/call/voice|video` (old call
screens). Push / CallKeep deep links land on the same routes.

Proposed: same routes (deep links in `lib/utils/call.ts`,
`lib/notifications/background-handler.ts`, `components/contexts/notifications.tsx`
are unchanged) rebuilt with `components/k/chat.tsx` and `components/k/call.tsx`.

### Photos

Current: two full-screen viewers. `/hostings/[id]/gallery` (new kit, listing
photos by room) and `/photo-gallery` (old kit, a URL list from the gallery
store, used for chat images, posters and the camera review with Edit / Use
photos).

Proposed: one viewer component (`components/k/gallery.tsx`: pager, counter,
room chips, captions, thumbnail grid). Both routes stay because they take
different inputs (listing id vs a local list of picked or chat images), but
render the same viewer. The listing gallery adds a grid overview (2 columns on
phones, 3–4 on tablets) and the camera review keeps Edit / Use photos.

## 2. Problems per screen

### `/hostings/[id]/booking-applications` (old)
- Old kit (DetailsLayout, ThemedText, NativeWind), light-theme colours.
- Loading bug: `fetching || (hostingFetching && skeletons)` renders `true`/nothing
  and never shows skeletons while applications load; empty state shows during
  load when the hosting query has finished first (`!fetching || !hostingFetching`).
- Runs `useHostingQuery` without pagination just to get nothing on screen.
- Lists drafts (`IN_PROGRESS`) a host can't act on; no grouping by status.
- Errors only as a toast; no retry.

### `/hostings/[id]/booking-applications/[applicationId]` (old)
- Duplicate of `/applications/[id]`; decisions only allowed for
  `SUBMITED`/`SYSTEM_VERIFIED` while the new screen also allows
  `ADMIN_VERIFIED`/`HOST_VERIFIED` (inconsistent).
- After accept/decline it `replace`s to `/host/listings`, losing context.
- Raw enum labels ("Submited", "Corp_member"), "Ref #" from the id.

### `/applications/[id]` (new, incomplete)
- Missing what the old screen had: email, phone, tenancy end date, a link to the
  booking after acceptance.
- Verification shows only NIN/BVN; phone verification and the signed agreement
  aren't surfaced; no "how sure are we" summary.
- Decline has no reason and tells the renter nothing; "This can't be undone"
  with no alternative.
- After acceptance the host sees nothing about the tenancy: no payment state
  (awaiting payment / in escrow / released), no payout, no auto-release date.
- Accept/decline buttons sit at the end of a long scroll instead of a pinned
  footer; no error state with retry (a failed fetch reads as "not found").
- Tablet: one reading column only; no list + detail.

### `/host/applications` (new)
- No per-listing filter, so the listing hub has to send hosts to the old screen.
- Fetch errors render as "No applications waiting".
- Tablet: one column.

### Saved tab / `/hostings/folders/[id]`
- Collections invisible in the new app (see flow map).
- Folder screen: "Remove from folder" actually calls `deleteSavedHosting`, so it
  un-saves the home everywhere (mislabelled destructive action).
- Old grid (`react-native-super-grid`), long-press select mode with no hint,
  no rename/delete for the collection, no empty-state action.

### `/chats/[id]`
- Header is the old DetailsLayout with the new avatar; the listing the chat is
  about only appears at the very top of history (scroll to the beginning to find
  it). No way to reach it from the header.
- Message states: optimistic message shows a clock; on failure it is silently
  removed, losing the text. No "failed, tap to retry".
- Attachments: the composer only sends when there is text, so photo/document
  only messages are impossible (send button turns into the mic). Optimistic
  messages show no attachments.
- Replacement of the optimistic bubble matches by text, so sending the same
  text twice quickly can swap the wrong bubble.
- Image-only messages render an empty coloured bubble under the image.
- No day separators; timestamp only on group end.
- Errors: a failed history load toasts and leaves "Start the conversation".
- Accessibility: composer icons have no labels; bubbles have no readable label.
- Tablet: full-width bubbles across 1000+ dp; the old layout caps at 720 but
  the composer isn't centred with it.
- Performance: `renderItem` recreated each render, no `removeClippedSubviews`
  /`windowSize` tuning; every message re-renders on each new message.

### Calls
- Old kit; the speaker toggle only flips a state and never changes the audio
  route (bug). No listing context; no initials when the person has no photo
  (uses a generated avatar URL).

### Galleries
- `/photo-gallery`: old kit, light theme switches; `keyExtractor={item}` breaks
  when the same image appears twice; no counter; no accessibility labels.
- `/hostings/[id]/gallery`: no grid overview, no index-safe scroll failure
  handling, tablet only scales image size.

## 3. Decisions
- Keep every route that notifications, push, CallKeep or the listing hub use.
  Only `/hostings/[id]/booking-applications/[applicationId]` becomes a
  `<Redirect>`; the per-listing board route stays (listing hub links to it).
- No server changes. New operations live in
  `lib/services/graphql/requests/queries/k-manage.ts`; existing ones untouched.
- Declining with a reason: the server takes no reason, so the reason is sent to
  the renter as a chat message (only if the host leaves "Send this to them"
  on). The decline itself is unchanged.
- Tenancy status for hosts reads `bookingApplication.booking` fields in a
  separate query, so a permission error on a nested field can't blank the
  review screen.
- Saved collections use the existing `createUpdateSavedHosting` (with
  `folderId`) to move a home; "Remove from saved" is labelled as such.
- Old components (`components/molecules/m-booking-application-card`,
  `o-chat-input`, `m-chat-message-bubble`, `components/screens/call*`, …) are
  left in place for a later cleanup.

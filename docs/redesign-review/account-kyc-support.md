# Redesign review — identity verification, account & settings, money history, notifications, support & feedback

Branch: `feat/redesign-account` (from `feat/redesign-2`). Scope: `app/kyc/*`, `app/verify.tsx`,
`components/k/verify/*`, `app/users/[id]/*` (profile, security, password, PIN, notification
settings, transactions), `app/users/notifications.tsx`, `app/users/feedback.tsx`, `app/support/[id].tsx`,
`app/logout.tsx`, and the You tab (`components/k/you.tsx`).

## 1. Flow map

### Current (before this branch)

```
You tab ─┬─ Verify card ───────────────► /verify  (new design: selfie → NIN, phone, BVN on one long page)
         ├─ Personal details ──────────► /users/[id]/profile/edit  (new design)
         ├─ Verification ──────────────► /verify
         ├─ Payments ──────────────────► /users/[id]/transactions (new design) ─► /users/[id]/transactions/[ref] (OLD design)
         ├─ Notifications ─────────────► /users/[id]/notification-settings (OLD)
         ├─ Kushi Support ─────────────► /support (new) ─► /support/[id] (OLD)
         ├─ Share feedback ────────────► /users/feedback (OLD)
         ├─ Legal ─────────────────────► housing.kushi.ng/legal/* (not kushi.ng/privacy, /terms)
         ├─ Sign out ──────────────────► /logout (no confirmation)
         └─ Delete account ────────────► sheet → deleteAccount

Not reachable from the You tab at all:
  /users/[id]/security  (biometric toggles + "KYC Application" toggle + Change PIN + Change Password)
  /users/[id]/update-password, /users/[id]/change-pin
Second verification path (OLD design), still linked from hosting form + reservation step 1:
  /kyc ─► /kyc/phone ─► /kyc/image ─► /kyc/nin ─► /kyc/bvn ─► dumps you on the dashboard
Second notifications screen (OLD): /users/notifications (linked from components/layouts/profile.tsx)
```

### Proposed (built on this branch)

```
You tab (phone: one column; tablet ≥900dp: profile+status column | settings column)
 ├─ Profile header ─► Personal details  /users/[id]/profile/edit (unchanged)
 │                 └► Public profile    /users/[id]   (rebuilt)
 ├─ Verification status card ─► /verify  (hub)
 │      /verify            what it unlocks, progress, the 4 steps, privacy note
 │      /verify/selfie     camera guidance → capture → upload → next
 │      /verify/nin        NIN entry, failure reasons, retry/retake
 │      /verify/phone      pick or add a verified number (SMS code)
 │      /verify/bvn        hosts: BVN entry (needed to list and get paid)
 ├─ Account
 │   ├─ Security                 /account/security  (password, this device / sign out, biometrics honesty)
 │   │    └─ Change password     /account/password  (emailed code + new password, no sign-out)
 │   ├─ Notification preferences /account/notifications
 │   └─ Payments & receipts      /account/payments ─► /account/payments/[ref]
 ├─ Help
 │   ├─ Kushi Support            /support ─► /support/[id] (rebuilt)
 │   └─ Share feedback           /account/feedback
 ├─ Legal  kushi.ng/privacy · kushi.ng/terms · cancellation & caution policies
 ├─ Sign out  (confirm sheet → /logout)
 └─ Delete account  /account/delete (explains what happens; server deleteAccount)

Redirects (old URL → new):
  /kyc → /verify, /kyc/phone → /verify/phone, /kyc/image → /verify/selfie,
  /kyc/nin → /verify/nin, /kyc/bvn → /verify/bvn
  /users/notifications → /notifications
  /users/feedback → /account/feedback
  /users/[id]/security → /account/security
  /users/[id]/update-password → /account/password
  /users/[id]/change-pin → /account/security   (there is no PIN on the server)
  /users/[id]/notification-settings → /account/notifications
  /users/[id]/transactions → /account/payments
  /users/[id]/transactions/[transactionId] → /account/payments/[ref]
```

## 2. Per-screen problems found

### Verification (`/kyc/*` and `/verify`)
- **Two verification journeys.** `/kyc/*` (old design, 5 screens, order phone → selfie → NIN → BVN) and
  `/verify` (new design, one long page) both exist. The hosting form and reservation step 1 still send
  people to `/kyc`; the You tab and host dashboard send them to `/verify`.
- `/kyc` ends by `router.dismissAll()` + replacing to the dashboard — whatever the person was doing is lost.
- `/kyc/nin` and `/kyc/bvn` show a "Continue"/"Finish" that pretends success: on a server error it
  shows a toast *and* still runs the success branch if `res.data` happens to be present.
- `/kyc/nin` shows "Secure 256-bit Encryption" and `/kyc` "Encrypted & Secure" — marketing badges, no
  actual statement of what is stored, who sees it or for how long.
- `/kyc/image` sizes the camera off `Dimensions.get('window')` at import time — wrong after rotation and on iPad.
- `/verify` stacks three cards with three different primary actions on one scroll; on a phone the camera
  card pushes the rest off-screen. No overall progress, no "what this unlocks", no failure reasons beyond
  the raw server string, no way to retake the selfie once uploaded (NIN failures caused by a bad selfie
  were a dead end), and BVN is labelled "Optional" for renters with no explanation.
- The selfie step never says what happens with the photo; the server (Dojah) compares it with the NIN/BVN
  photo record. Copy said "YouVerify" in places — the provider is Dojah.
- Server failure messages ("selfie did not match NIN record", "couldn't find a NIN matching that number",
  "Image not found, please upload image") were not mapped to next steps (retake vs. re-type).

### Account & settings
- **Security screen unreachable** from the redesigned You tab.
- **Change password screen is fake**: three inputs with no state and an "Update" button with no handler.
- **Change PIN screen is fake**, and there is no PIN anywhere on the server (no mutation). Removed.
- **Biometric toggles do nothing**: `settings.biometrics` and `payWithBiometrics` are written but never read
  by any sign-in or payment flow. "KYC Application" toggle is a no-op switch. Removed rather than kept as
  placebo; noted for the owner.
- **Notification settings fire a save on every open** (the debounced effect runs on mount) and show a
  "Success" toast each time; a failed save leaves the switch in the wrong position.
- No in-app notice when the phone has blocked notifications at OS level, so "Push notifications: on" lies.
- Legal rows pointed at `housing.kushi.ng/legal/...` instead of `kushi.ng/privacy` / `kushi.ng/terms`.
- Sign out has no confirmation; a mis-tap signs you out.
- `/logout` cleared the tokens **before** calling the `logout` mutation, so the server never received an
  authenticated logout and the session token stayed valid server-side. Fixed (call first, then clear).
- Delete account: the sheet claimed "permanently removes"; the server actually **archives and disables**
  the user, archives listings and chats, and refuses while a paid booking is active. Copy now says what
  really happens, and checks `deleteAccount.data`.
- Settings use `/users/[id]/…` URLs where `[id]` is ignored — confusing deep links. Moved to `/account/*`.

### Public profile (`/users/[id]`)
- Old design (NativeWind + DetailsLayout). Report-review flag had no confirmation and no label.
  Review sheet allowed submitting without explaining the rating. "Loading…" as a name while fetching.
  No error state (bad id → empty "User" page).

### Money history
- List (`/account/payments`, formerly `/users/[id]/transactions`) was redesigned but: no error state,
  refreshing indicator never shows, all outgoing payments labelled "Rent paid into escrow" even after
  release/refund, months not grouped.
- **Receipt** was old design and unclear about money state: showed only the raw transaction status
  ("success"), so a renter whose rent is still held in escrow and one whose rent was released to the host
  saw the same screen. Dates used device locale/time zone (`toLocaleString`). Reference truncated to 18
  chars with "..." even when it fit. "Contact Support" button did nothing. Barcode on a dark screen was the
  only visual. Fee breakdown missing.

### Notifications
- Two screens (`/notifications` new, `/users/notifications` old).
- New screen: only the first 60 items, no load-more, pull-to-refresh never shows a spinner, no error
  state, no link to notification preferences, "Mark all read" ignored failures.

### Support & feedback
- Support conversation was old design (old bubbles, white-on-light avatar header, Modal rating prompt).
  Failed sends silently vanished from the thread. No "closed" state on the composer.
- Feedback was old design, the title field had no label, success screen used an emoji.

### Cross-cutting
- Old screens used NativeWind + `useThemeColors()` (light-mode leftovers) — inconsistent with the night theme.
- Money formatted three ways (`toLocaleString`, `formatNaira`, ₦ + number). Now always `lib/k/format.naira`.
- No tablet handling on any of the old screens; forms now cap at 560dp, lists/receipts at 720dp.
- Accessibility: icon-only buttons without labels (flag review, copy reference), switches without
  labels, OTP fields without hints.

## 3. Decisions
- One verification journey: `/verify` hub + one screen per step, reusing `components/k/verify/*`
  (also used inline by the apply flow, so their APIs are unchanged).
- Steps order: selfie → NIN → phone → BVN (BVN required for hosts, optional for renters). Phone is
  separate from identity because applications need it, not identity.
- Settings live under `/account/*`; old `/users/[id]/*` settings URLs redirect.
- Typed operations for new fields are hand-written in `lib/k/account.ts` (like `lib/k/caution.ts`) so the
  shared generated file is untouched and parallel branches don't conflict.
- Biometrics and PIN removed from the UI until they are wired to something real.
- Account deletion: the API has `deleteAccount` (soft delete). We use it, with an honest explanation and
  an email fallback to support@kushi.ng.

## 4. Open questions for the owner
- Biometric sign-in / pay-with-biometrics: build it properly or drop the setting for good?
- There's no "signed-in devices / sessions" query; only "sign out of this device" is possible.
  `logout` with no token clears all sessions server-side — worth exposing as "Sign out everywhere"?
- Account deletion is an archive/disable, not erasure. Does kushi.ng/privacy promise erasure on request?
- Change password requires an emailed code (no "current password" mutation). OK, or add one?
- Push token is not cleared on sign-out (device may still receive the previous user's pushes).

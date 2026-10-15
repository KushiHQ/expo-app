# Guest booking journey — review and restructure

Scope: everything a renter does from "found a home" to "living there": apply → host decides → pay into escrow → handover (finalise) or cancel → caution deposit, agreement, review. Branch `feat/redesign-guest` (from `feat/redesign-2`).

Server facts used for copy and rules come from `server_v2` (`housing/db_queries/bookings.rs`, `booking_application.rs`, `includes/jobs/*`) and are summarised at the top of `lib/k/booking.ts`.

## 1. Flow map

### Before (two apps living side by side)

```
Listing ──► /hostings/:id/apply            (new, one guided flow)          ──► /trips (tab)
        └─► /hostings/:id/reservation/      (old, 4 screens, zustand store)
              checkout-summary → step-1 → step-2 → step-3 ──► /bookings?tab=applications

/trips (tab "Homes")                 new: applications + bookings merged
/trips/:applicationId                new: one home, end to end
/trips/booking/:bookingId            new: notification resolver → /trips/:appId
/bookings                            old: two swipe tabs, Bookings | Applications, raw enum filter pills
/bookings/:bookingId                 old: 790-line booking page (pay, finalise, cancel, PDF, review, receipt)
/users/booking-applications/:id      old: application page (withdraw, message, "View booking")
/hostings/:id/reservation/checkout   old: Flutterwave checkout
/pay                                 new: Flutterwave checkout
```

Who still linked to the old screens: `m-notification-card` (`/bookings/:id`, `/users/booking-applications/:id`), transaction detail (`/bookings/:id`), support chat context card (`/bookings/:id`), the old host application screen (`/bookings/:id`), profile menu (`/bookings`), `/bookings/:id` itself (`/hostings/:id/reservation/checkout`), and the web share hand-off in `app/_layout.tsx` (`/reservation/` deep links). Push taps for bookings/applications went nowhere (the FCM handler only routed chats).

### After (one journey, one screen per job)

| Job | Canonical route | Notes |
| --- | --- | --- |
| Apply | `/hostings/:id/apply` | verify identity → details → about you → read & sign → submit (emailed code) |
| All my homes | `/trips` (Homes tab) | applications and bookings merged, grouped In progress / Your homes / Past |
| One home | `/trips/:applicationId` | status, journey, the one next action, money, documents, caution, review, help |
| Pay | `/pay?bkId=&ref=` | escrow payment; `ref` optional (a fresh one is minted) |

Old routes kept as thin redirects so links, receipts, emails and pushes keep working:

| Old route | Redirects to |
| --- | --- |
| `/bookings` | `/trips` |
| `/bookings/:bookingId` | guest → `/trips/:applicationId`; host → `/applications/:applicationId` |
| `/trips/booking/:bookingId` | same resolver as above (was guest-only) |
| `/users/booking-applications/:id` | guest → `/trips/:id`; host → `/applications/:id` |
| `/hostings/:id/reservation` and `/step-1`, `/step-2`, `/step-3`, `/checkout-summary` | `/hostings/:id/apply` |
| `/hostings/:id/reservation/checkout?bkId&ref` | `/pay?bkId&ref` |

Push taps: booking and application pushes (`data.subject` = `booking` / `booking_application`) now open the resolvers above.

## 2. Screen-by-screen problems found

### Old reservation flow (`reservation/checkout-summary`, `step-1..3`)
- Old design system throughout (ThemedText, FloatingLabelInput, NativeWind, LoadingModal, PINModal, SuccessModal).
- **Bug: interval label switch had no `break`s** — every listing showed "Years" (and the typo "Nigths").
- Stepper allowed unlimited periods; no max per interval.
- Every step re-ran `initiateBookingApplication` on mount and on pull-to-refresh, overwriting the in-memory store with server state (lost edits when going back).
- Success toast "Success" after every step; error handling via generic modals.
- Signature pad in the old palette; no plain-English consent; agreement shown as nested accordions with no summary on step 3 when the summary query failed.
- Dead end: on success it sent you to `/bookings?tab=applications`, a different app section from the new Homes tab.
- No tablet layout, no keyboard avoidance on the address field.

### New apply flow (`/hostings/:id/apply`) — kept, fixed
- **Students, corps members and people between jobs without a guarantor are auto-declined by the server's risk check** (critical risk → REJECTED). The form let them submit without one. Now a guarantor is required for those statuses with a clear explanation.
- **Commercial listings**: the form required "Who'll live here?", which the server and the old flow skip for commercial tenants. Hidden and not required for commercial use-classes now.
- Guarantor address (sent by the old flow, accepted by the server) was missing. Added (optional).
- Used the old `m-signature-pad`. Replaced by `components/k/signature.tsx` (same stroke engine, Kushi styling, tablet-aware).
- Footer was absolutely positioned over the content with a hard-coded 140px bottom padding; the keyboard covered fields on iOS. Now a real footer inside a KeyboardAvoidingView.
- Tablet: content stretched edge to edge. Now centred at the form width (560) including the progress bar, footer and the "sent" screen.
- testIDs for the CI tour.

### Old bookings list (`/bookings`)
- Hand-rolled swipe pager with two tabs; filter pills showed raw enum values (`SUBMITED`, `HOST_VERIFIED`, `PAID`, `FAILED`).
- Duplicated the Homes tab. Now a redirect.

### Old booking page (`/bookings/:id`, 790 lines)
- **Money bug: the total showed `amount + guestServiceCharge`**, but `amount` already includes the platform fee — guests saw a total higher than what they paid.
- Dates via `toLocaleDateString('en-GB')`, money via `₦{n.toLocaleString()}` (inconsistent on Hermes).
- Tenancy agreement PDF was downloaded on every open of a completed booking, rendered with a 640px fixed height.
- "Cancel" had no explanation of what you lose; the platform fee being non-refundable and the 10% cancellation fee were invisible until after the fact.
- "Finalize" jargon. Land listings handled, other copy not.
- Opened the old checkout route; "View E-Recipet" typo on the success modal.
- No tablet layout. Now a redirect to the trip screen, which absorbs every feature it had (pay, confirm handover, cancel, agreement PDF, receipt, review, message host, support).

### Old application page (`/users/booking-applications/:id`)
- Raw status enums; "Ref #" = last 6 chars of the id; withdraw allowed in statuses the server rejects.
- Host redirect logic lived here. Now a redirect resolver (guest/host aware).

### Trip screen (`/trips/:id`) — rebuilt
Bugs fixed:
- **Pay button hidden until a transaction reference existed** ("Your payment link is being prepared" dead end). `/pay` mints a reference itself; the button now only needs the booking.
- **Failed payment attempts** looked like a fresh "pay now" with no explanation. Now says the last attempt didn't go through.
- **Withdraw shown for HOST_VERIFIED / ADMIN_VERIFIED**, which the server refuses ("You cannot cancel an application that has been accepted or verified"). Now only for IN_PROGRESS, SUBMITED, SYSTEM_VERIFIED.
- Tenancy agreement PDF opened in a WebView — **Android WebView can't render PDFs** (blank sheet). Now `react-native-pdf` inline plus "Save or share PDF".
- Not-found and network error were the same message with no retry. Now: skeleton → error with retry / offline wording → not-found with a way back.
- A host opening a guest link landed on the guest view. Now redirected to the host review screen.
- No receipt, no booking reference, no grace-period countdown, no cancellation preview — added.

New structure (phone: one column; expanded tablet: two columns, journey + actions left, money + documents + details right):
1. Hero photo, status pill, place, dates.
2. Journey track (Applied → Host accepted → Paid into escrow → Keys received / Handover done) with dates.
3. The one next action, per stage:
   - draft — continue / discard;
   - review — what's happening now (Kushi check vs host), message host, withdraw when allowed;
   - accepted — pay into escrow, failed-attempt notice;
   - paid — escrow explanation, countdown pill ("9 days left"), auto-complete date, address, **I have my keys** (confirm sheet → emailed code), message host, cancel (refund preview → emailed code);
   - completed — welcome home, agreement, message host;
   - ended — reason (declined / withdrawn / cancelled with refund timing) and explore.
4. Caution deposit (existing `GuestCaution`) and review, once paid.
5. Money: itemised `feeLineItems` (they add up to the total) or, before acceptance, the live quote "Due after the host accepts".
6. Documents & help: agreement (preview → signed PDF), receipt, message host, Kushi support.
7. Your application: everything you submitted, booking reference.

### Homes tab (`/trips`)
- Pay button also gated on the transaction reference — fixed the same way.
- No error state (a failed load showed the empty "Your next home starts here"). Added error + retry.
- Tablet: two-column grid on expanded windows.
- testIDs/accessibility labels on cards.

### Pay (`/pay`)
- Skeleton forever when the booking failed to load or `bkId` was missing — now error + retry / empty state.
- Opening a cancelled or completed booking offered to pay again — now "Nothing to pay".
- The amount breakdown lumped the platform fee into "Rent & charges"; now shown separately.
- After paying, the 14-day grace period, auto-completion and the cancellation cost weren't explained (the old success modal did). Added.

## 3. Product rules preserved (from the server)
- `booking.amount` is the whole payment, platform fee included; `feeLineItems` sum to it.
- Escrow: the host is paid when the guest confirms the handover (emailed code) or automatically 14 days after payment (`autoFinalizeAt`). Finalising generates and emails the signed tenancy agreement PDF.
- Cancellation: guest only, only while paid and not finalised (effectively within the 14-day grace period). Refund = 90% of rent + service charge + legal fee + stamp duty + caution deposit − custody fee; the platform fee and 10% of rent are kept (5% of rent goes to the host). Refund to the original card in 5–7 business days.
- Caution deposit: unchanged (`GuestCaution`): accept/dispute host claims within 7 days, request refund after the tenancy.
- Tenancy agreement signed during the application (signature on file + two consents), effective once accepted and paid.

## 4. Needs the owner's decision
- **Payment window**: `calculateHostingFees.paymentWindowDays` (default 3) is only enforced for Booking Assist acceptances; normal host acceptances never expire. The app no longer promises a deadline. Decide whether host acceptances should expire too, then the trip screen can show "Pay by …".
- **Cancelled applications come back**: `initiateBookingApplication` returns the guest's existing application even if it was CANCELLED, so re-applying after withdrawing reuses the withdrawn record. Server-side decision.
- **Feedback prompt** after a booking completes (old `m-feedback-prompt-modal`) isn't carried over; the review card is shown instead. Re-add a Kushi-styled app-feedback prompt if still wanted.
- `app/notifications.tsx` sends hosts' booking notifications to `/host`; it could use `/trips/booking/:id`, which now routes hosts to the application. Left for the inbox/notifications owner.

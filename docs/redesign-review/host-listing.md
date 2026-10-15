# Review: becoming a host and listing a property

Scope: `app/hostings/form/*` (start, hub, the old 8-step wizard, verification), `app/camera.tsx`, `app/hostings/[id]/boost.tsx`, `app/hostings/[id]/insights.tsx`, and the host-side ways into them.

## How the server actually behaves

This shapes everything below. Checked in `server_v2/src`:

- **Publishing is instant.** `createOrUpdateHosting` stores whatever `publishStatus` the client sends. LIVE goes live at once. Nothing moves a listing from INREVIEW to LIVE, and nothing tells the host it was approved or rejected. There is no rejection-reason field.
- **The server checks almost nothing at publish.** The only check: land needs at least one on-site room photo, of its own or its parent's. Photo count, location, price, payout account, mandate, signature, title and description are all unchecked. So the app is the only place these rules live.
- **Every save must send `publishStatus`.** Each column is overwritten from the input, and a missing status becomes NULL. The old Done button and the room screens relied on the store happening to carry it.
- **Media integrity is client-side only.** The camera writes GPS into EXIF. The server's EXIF and geofence checker exists but is never called. Video `geofenceStatus` is a free string the client chooses.
- **Verification** (`requestHostingVerificationTier`) needs the owner mandate to exist first (`initiateHostingVerification`, which also needs KYC). Without it, the request fails with "HostingVerification not found". What each level needs:

  | Level | Needs | Fee |
  |---|---|---|
  | ID | Photo of government ID (no PDFs) | free |
  | Address | Utility bill | free |
  | Title checked | Title document and survey plan | ₦5,000 |
  | Kushi vetted | Building plan approval and inspection report | ₦15,000 |

  Tiers only go up when staff approve a request. The email promises review "within 3–5 business days". Each status change sends a push with `{intent: "verification", hostingId, requestId}`.

## The flow before

`/hostings/form` (KYC switch and step list) → `step-1` Property details → `step-2` Spaces & photos → `step-2-video` Video → `step-3` Location → `step-4` Amenities → `step-5` Pricing & payout → `step-6` Landlord mandate → `step-7` Tenancy terms & signature → `step-8` Review & publish → `verification/overview` + `request`.

`onboarding` was the hub: a list of the same steps, each locked until the one before it was "filled".

## The flow now

| # | Route | Was | Shown when |
|---|---|---|---|
| — | `/hostings/form` Start | index | always |
| — | `/hostings/form/onboarding` Hub | onboarding | always |
| 1 | `basics` | step-1 (+ unit structure) | always |
| 2 | `photos` | step-2 + step-2-video (merged) | always |
| 3 | `location` | step-3 | always |
| 4 | `features` | step-4 (+ max occupants) | not land |
| 5 | `price` | step-5 | always |
| 6 | `agreement` | step-6 + step-7 (merged) | rent, Kushi-managed, not land |
| 7 | `publish` | step-8 | always |
| — | `verification/overview`, `request` | same routes | Kushi-managed |

- One model, `lib/k/listing-steps.ts`, drives the hub checklist, every step's progress strip, "what's left" and the publish gate.
- **Steps are no longer locked in order.** Any step can be opened from the hub. Publishing is blocked until every step that applies is done, and the publish screen lists what's missing, each item linking to its step.
- **Resuming:** the Start screen lists unfinished drafts. The hub's "Next up" card opens the first unfinished step. Continue replaces the current step with the next one, so Back always returns to the hub, not through every earlier step.
- **Saving:** each step saves on Continue. If you leave a step with unsaved changes, it saves on the way out, or asks whether to leave without saving. A new listing is created at the end of step 1 (as a DRAFT with a placeholder title), then the hub opens with step 2 on top.
- Old `step-*` routes are now `<Redirect>`s to the new ones. Notifications and deep links use `onboarding` and `verification/overview`, which keep their names.

## Problems found, per screen

**Start (`index`)**
- KYC was shown as a toggle switch you couldn't really toggle. Hosts weren't told they need to be at the property, have the owner's details, or have a bank account.
- No way to resume a draft from here.
- No "what happens after publish".

**Hub (`onboarding`)**
- Steps locked behind each other, so one optional gap greyed out the rest.
- Mixed in the legacy listing card.
- Boost and Insights were only reachable from the old ⋯ menu, which the redesigned listings tab no longer shows. **Hosts couldn't reach Boost or Insights at all in the redesign.**
- Parent properties had no "Add a unit" action. The copy said to "use the + button and choose this property", buried in step 1.

**Step 1 (basics)**
- Three generic dropdowns with jargon ("Parent (a multi-unit property)", "Offer Type").
- A parent's `unitStructure` (sold one by one or as a whole) couldn't be set anywhere on mobile.

**Step 2 (photos)**
- A 538-line screen of nested modals. Selecting, moving and deleting photos was hidden behind small text links.
- Upload failures only showed as a tiny overlay. No retry-all, and "lost" uploads (file gone) were never surfaced.
- The minimum photo count wasn't explained against the land rule.
- On iOS, closing one modal and opening another could deadlock (worked around with timeouts).

**Step 2b (video)**
- Uploaded with `uploadAsync`, which gives no progress and can't be cancelled, behind a full-screen "Uploading video…" modal.
- The upload only started when you pressed Continue. A failure dropped you back with nothing but a toast.

**Camera**
- Location was requested through `getLocationAsync`, which shows raw Alerts.
- The host was never told whether photos were being location-stamped.
- Closing the camera silently discarded new shots.
- Permission screen used the legacy layout.

**Step 3 (location)**
- Requested location permission on every render cycle until granted.
- Coordinates couldn't be corrected (no draggable pin), and street, town and state couldn't be edited.
- Pull to refresh was used for "retry GPS".
- Phone-number picker was a legacy select with a third-party phone input.

**Step 4 (amenities)**
- `maxOccupants` was never collected anywhere (a `maxOccupantsRef` existed but had no field), yet the tenancy agreement prints MAXIMUM_OCCUPANTS. It is now in step 4.

**Step 5 (price)**
- Money typed into `Number(...).toLocaleString()` showed "NaN" or "0" while editing.
- The bank account was saved automatically as soon as it was looked up, so the host never confirmed the account name.
- Interval labels were raw enum text ("ANUALLY").

**Step 6 (mandate)**
- A separate screen with its own save, for six fields that belong with the agreement.
- The placeholder "Thomas Shelby" and an address in Cheshire.

**Step 7 (terms)**
- **Bug:** variable inputs passed the index from the *filtered* clause list to `handleUpdateVariable`, which indexes the *unfiltered* list. When a hidden clause came before a visible one, the value was written to the wrong clause. Fixed: the real index is passed.
- Validation was a toast naming the raw variable key.

**Step 8 (review & publish)**
- Toggled straight between LIVE and DRAFT. A listing could be published with no price, no location or no payout account, because the attestations and uploads were the only checks.
- After publishing, it sent hosts to "the Get Verified card on the onboarding hub" without saying what verification is or how long it takes.

**Verification**
- **Bug:** the request form's "all documents picked" memo depended only on `picked`, so it went stale when the tier's requirements loaded after the picks.
- The submit button said "Pick 2 more" using the total count, not the number remaining.
- Listings without a mandate (sales, land, agent-managed) could open the request form, but the server always failed with "HostingVerification not found". The overview now asks for the owner details first.
- ID verification accepted PDFs, which the server rejects.

**Boost and Insights**
- Legacy layout.
- Boost offered payment on draft listings.
- Insights ignored `contactReveals`.

**Everywhere**
- NativeWind and the old atoms.
- "Success" toasts after every step.
- No tablet layout.
- Few accessibility labels.
- Money formatted with `toLocaleString`.

## Decisions

- **Publish gate in the app** (see the server notes above). The rules live in `lib/k/listing-steps.ts`:
  - Photos: at least 3, and land needs one on-site photo.
  - Location: a pin, a town or state, and a contact number.
  - Price, plus a payout account for Kushi-managed listings.
  - Agreement listings: mandate, terms and signature.
  - Title: not "Untitled listing".
  - Description: 40 or more characters.
- **No INREVIEW step in the copy.** The server makes a listing live straight away, so the app says so. Verification is a separate, optional trust ladder with a 3–5 business day review (the server's own wording).
- **Room photos stay camera-only.** They're location-stamped. Posters (land) and the video tour can come from the library, as before.
- The legacy `SignaturePad` is kept inside the agreement step. It is the one old widget left, and the redesigned apply screen uses it too.
- Shared hooks (`useHostingForm`, `useHostingFormRoomUtils`, `useTenancyTermsForm`, the upload queue) and every GraphQL operation are unchanged.

## Open questions for the owner

1. Should publishing go to INREVIEW (staff approval) rather than LIVE? The enum and the old copy suggest that was the plan. If so, the server needs a gate and an approve/reject notification with a reason.
2. Should the publish rules above also be enforced on the server, so the web app and old app versions can't publish incomplete listings?
3. The server's EXIF and geofence check (`media_verification.rs`) is never called. Should it run on room-photo upload?
4. Title-checked and Kushi-vetted levels have fees (₦5,000 and ₦15,000), but there is no payment step in the app. How are they collected?

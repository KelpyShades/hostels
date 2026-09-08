# Hostel — Product Specification

Status: Draft v1.0 for build
Date: 2026-09-06
Owner: Kelvin Appiah / 404notnull
Project folder: `~/Projects/hostel`

---

## 1. What this is

A **reusable hostel microsite product** for Ghanaian university hostels. One codebase, one backend, one storage bucket — reskinned and re-contented per client. Sold to hostel owners/managers as:

> "Every hostel looks the same on these apps — a card with a price. This is a space that's actually yours, and one link you can send instead of typing the same thing out forty times a week."

**The honest positioning (do not drift from this):**
- We do **not** promise more customers. We promise (a) easier outreach — one link with everything, ready to paste — and (b) a distinct, personal presentation that listing apps (Abode, GetRooms) structurally cannot give.
- The site is an **outreach asset**, not a lead funnel. The owner's existing channels (Facebook groups, WhatsApp status, flyers, noticeboards) are the distribution. The site makes every one of those touches one paste instead of a rewritten message.

### What this is not
- Not a booking engine with payments. Not property-management software. Not a tenant portal. Those are explicitly deferred (§12).
- Not a per-client admin CMS. Differentiation-sensitive content (photos, copy, testimonials, layout) is curated by us, deliberately.

---

## 2. Business model

- **One-time build fee** — template is reused; presentation is customized per client.
- **Annual refresh + hosting + domain, billed together** — one combined yearly invoice. Domain renewal timing lines up with the admissions cycle.
- **Domain ownership:** the client owns and renews their domain (or we buy on their behalf, invoiced to them). We never hold a client's domain hostage.
- Renewal is justified with **proof of value**: inquiry counts, page views, room-type interest, and contacted/booked conversion from the logged data.
- A client pushing for more control than the spec allows is a signal to **price a higher tier**, not to build free features.

---

## 3. Actors

| Actor | Access | What they do |
|---|---|---|
| **Student (visitor)** | Public site | Looks at rooms, photos, prices; submits an inquiry that opens a pre-filled WhatsApp chat |
| **Hostel owner / on-site staff** | Their hostel dashboard domain (no login in v1) | Views inquiries; marks them contacted/booked; edits room price + availability only |
| **Hostel manager** (multi-branch hostels) | Their hostel dashboard domain (no login in v1) | Same inbox view across all branches of their hostel — with a branch switcher to focus on one |
| **Branch caretaker** (multi-branch hostels, e.g. Franco) | Their own branch-locked dashboard deployment (`NEXT_PUBLIC_BRANCH_ID`) | Sees only their branch: its enquiries, its rooms, its share link (FR-B6a) |
| **Us (404notnull / Kelvin)** | Separate internal tool (token-gated, later) | Onboards clients, swaps photos/copy, flips statuses, sees activity across all clients, manually redirects leads between sister branches |

**No manager authentication in v1.** Each hostel gets its own separately deployed manager dashboard, selected by `HOSTEL_ID` (the Convex hostels row `_id`), and its normal dashboard domain opens the manager experience directly at `/`. The dashboard contains the manager's Inbox and Rooms views; they are nested inside the base app rather than separate products. A simple login can be added later; when it is, `/` becomes the login gate and `/app` becomes the authenticated dashboard. The internal operator tool is a separate product and is deferred.

---

## 4. Architecture — one of everything

The core principle, extended to infrastructure: **N clients is N database rows, not N systems.**

```
┌──────────────────────────────────────────────────────┐
│  ONE codebase → N Vercel projects (one per hostel)   │
│                                                       │
│  asedaheights.com ─────────────┐                     │
│  aseda-heights.vercel.app ─────┤→ the hostel's       │
│                                 │  Vercel project    │
│  sisterhostel.com ─────────────┤                    │
│  sister-hostel.vercel.app ─────┘→ its own project    │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
     ONE Convex deployment
     (hostel→branch→room/
      inquiry rows)
```

**Deployment model: separate public and manager projects per hostel.** `landing_page` is the public hostel site. `dashboard` is the owner/manager app. Both are deployed per hostel and point at the same Convex deployment; `HOSTEL_ID` (the hostels row `_id`) selects the hostel for the dashboard deployment. The dashboard domain is the manager's normal hosting domain for v1. Authentication can be added later without changing the manager's internal routes: `/` becomes the gate and `/app` becomes the dashboard.

> **Cost note:** Vercel's free Hobby tier prohibits commercial projects — client hostel sites require the Pro plan (or the risk is accepted knowingly). Convex stays on its generous free tier.

**The hostel is the client unit — never the branch.** A hostel is a single place by default; some hostels have branches. Both kinds are one hostel record with a `mode` field (`'unit' | 'multi'`). Implementation detail: a unit hostel is stored with exactly one implicit branch so rooms always belong to exactly one location and there's a single query shape — but the *product* language and UI only ever say "hostel," and the mode only decides whether a branch picker appears.

**Surface placement:** `landing_page` carries the public site. `dashboard` is a separate per-hostel deployment for the owner/manager and opens directly at its base route. The internal tool (ours) is a separate small project against the same Convex — built later, when there's real client data.

- **Separate public and dashboard projects per hostel.** The public deployment serves the student-facing site. The dashboard deployment serves the owner/manager app and uses `HOSTEL_ID` to bind itself to one hostel.
- **One Convex project.** Multi-branch orgs are a foreign key, not a fork.
- **No photo storage pipeline (2026-09-08).** ALL imagery — hero, branch photos, room-category stock images — is bundled static assets (`landing_page/assets/images.ts`, imported by the per-client shells): content-hashed, immutable-cache, next/image-optimized, same-origin, near-zero egress. Photos are curated by us at the annual refresh; the manager never uploads photos. The earlier R2 bucket + upload flow was removed with it (rooms first, then branches).

### Directory layout

```
hostel/                        ← one repo; one build deployed per hostel
├── SPEC.md                    ← this file
├── landing_page/              # public student-facing hostel site
├── dashboard/                 # owner/manager dashboard, root route is the app
├── convex/                    # shared schema, queries, mutations
```

(The internal tool is a separate deployment — its own small app against the same Convex.)

---

## 5. Data model (Convex schema)

```
hostels                        ← the client unit: one hostel (single or multi-branch)
  name                         ← required — draft a row with just name + mode + status
  mode                         ← 'unit' | 'multi' (required)
  status                       ← draft | live | paused (required)
  renewalDate?                 ← ours; business data for the internal tool
  codePrefix?                  ← room-code prefix, seeded per client (e.g. "FRANCO") — codes read FRANCO-2026-001
  replyToEmail?                ← where student email replies land (the manager's address) — PER HOSTEL: all clients
                                 share one Convex deployment, so this is hostel data, never a deployment env var
  bookingSeq?                  ← monotonic booking count driving the code sequence (serialized on this row)

  Everything the public site renders as static content — tagline, about
  copy, photos, testimonials, theme, MoMo details, SEO, directions — is
  hardcoded per client in the site's strings file, not stored here. The
  database holds only what must be live (rooms, prices, availability) or
  manager-run (branches, enquiries), plus the small fields we oversee.

  Binding: each deployment selects its hostel by the row's `_id` via the
  HOSTEL_ID env var — no slug field, no lookup by name.

branches                       ← multi-branch hostels (unit hostels have one implicit record, auto-created by the dashboard)
  hostelId                     ← FK (required)
  name                         ← SEEDED ONCE by us (convex/seed.ts), stable — it is the key the public site's curated
                                 shell matches on. NEVER manager-editable: no branch create/delete exists.
  directionsNote?              ← "8 min walk from the main gate" style; the one structural thing managers edit
  whatsappNumber?              ← per-branch caretaker's line (E.164), curated in the static shell; the branch's
                                 line wins for chats/inquiries on its pages, the org's is the fallback
  sortOrder                    ← seeded; the branch registry is infrastructure (like codePrefix), not live data

rooms
  branchId                     ← FK; always a branch (unit hostels: their one implicit branch)
  hostelId                     ← denormalized for convenience
  name                         ← e.g. "2 in a room — New block (With TV)"
  occupancy                    ← 1 | 2 | 3 | 4
  bathType                     ← ensuite | shared
  pricePerYear                 ← GHS per academic year, integer
  availableCount               ← integer, owner-editable
  accepting                    ← boolean (the in/out toggle), owner-editable
  amenities?                   ← optional; subset of amenity taxonomy
  blurb?                       ← one-line description, curated by us, seeded with the room;
                                 deliberately NOT manager-editable (presentation copy)
  sortOrder

  The room catalog is DATABASE data, not static-shell data: names, prices,
  variants and blurbs are seeded once (convex/seed.ts per client) and owned
  by the manager from the dashboard. The static shell carries only org-level
  presentation (about, ledger, guide, FAQs, photos).

inquiries
  branchId, hostelId           ← branch (implicit for unit hostels)
  name, phone, email?          ← email optional — receipts + booking confirmation go there
  inquiryRef?                  ← FRANCO-2026-E001, issued at submission; matches chats to rows
  roomName, moveInDate, message
  status                       ← new | contacted | booked
  source                       ← wa | form (see §7.3)
  refCode?                     ← FRANCO-2026-001, issued once on first "booked"; never reused
  createdAt

roomChangeLog                  ← ours, not exposed to owners
  branchId, roomId, field, oldValue, newValue,
  changedBy                    ← owner | internal
  createdAt
```

**Validation invariants** (enforced in Convex mutations, not just the UI):
- `pricePerYear` must be a positive integer; cannot be set to 0 or blanked.
- `name` and `occupancy` cannot be blanked by an owner edit.
- Every manager mutation takes the deployment's `HOSTEL_ID` and verifies the room/inquiry belongs to that hostel before writing — the deployment binding is the capability check in v1.

---

## 6. Routing, domains, hosting

The public site and manager dashboard are separate deployments for each hostel. Their current v1 routes are:

**Public site (`landing_page`):**
```
/                 → public hostel site
/b/[branch]       → branch site for multi-branch hostels
/qr              → flyer QR route
```

**Manager dashboard (`dashboard`):**
```
/                 → manager dashboard for the `HOSTEL_ID` deployment
                  ├── Inbox view
                  └── Rooms & availability view
```

Inbox and Rooms are nested views inside the base dashboard page, not separate public products or access links. Authentication is deliberately deferred. When added later, `/` can become the login gate and `/app` can become the authenticated dashboard.

**Unit hostel (the default — a hostel is just that hostel):**
```
asedaheights.com/            (or aseda-heights.vercel.app)
   └→ the hostel site itself: hero, about, rooms & prices, inquiry
       next action: check rooms and prices
```

**Multi-branch hostel:**
```
examplehostel.com/           (or example-hostel.vercel.app)
   └→ the hostel as a whole: brand, about, gallery
       └→ branch picker ("which location?")
           └→ examplehostel.com/b/branch-slug
               └→ that branch's rooms & prices, inquiry
```

- **Mode is data, not a code fork.** For the demo it's a manual value in the mock file (`mode: 'unit' | 'multi'` — the bool Kelvin flips in code). In production it's a field on the hostel record. The page tree is shared; the mode only decides whether the branch picker renders.
- **Which hostel this project serves:** the `HOSTEL_ID` env var (the hostels row `_id`; dev default: the demo hostel). Custom domain and the free vercel.app URL both point at the same project.
- **`/b/` namespace for branches** keeps branch slugs clear of the app's own routes (`/qr`, `robots.txt`).

### 6.2 404 behavior (wrong ones)

| Situation | Behavior |
|---|---|
| Unknown branch slug (`/b/nonexistent`) | Branded 404 — still on the product's design language, with a link back to the branch picker |
| A branch path on a **unit** hostel (`/b/anything`) | **Redirect** to the hostel home — structural mismatch, not an error worth a 404 |
| Branch picker visited on a unit hostel | Never linked; direct URL renders the hostel home |

### 6.3 Hosting & rendering

- **Hosting:** Vercel — one project per hostel, same codebase, `HOSTEL_ID` env var selects the hostel. Free `*.vercel.app` URL until the client's custom domain attaches. **Cloudflare stays in the stack only for storage:** the shared R2 bucket (namespaced per hostel) and, if needed, one shared image-processing worker that all deployments point at. Convex remains the single backend for every deployment.
- **Dev/demo:** `pnpm dev` — `localhost:3000` is the hostel (demo default: Aseda Heights).
- **Rendering:** page shells (copy, photos, testimonials, about) are statically generated — content changes only at annual refresh, so build-time rendering gives fast pages, good SEO, near-zero cost. Room price + availability are the exception: they go stale fast, so they render client-side via Convex reactive queries (§7.5).

---

## 7. Functional requirements by surface

### 7.1 Surface A — Public hostel site

**FR-A0 · Mode-aware entry.** Unit hostel: the entry page is the whole site. Multi-branch hostel: entry presents the hostel as a whole — brand, about, gallery — then a **branch picker** ("Which location are you joining?"): photo cards per branch with location note and live availability, leading into that branch's rooms and prices. The picker is the only structural difference between the modes.

**FR-A1 · Hero.** Hostel name, tagline, location (university/area), "rooms available" badge driven by live `accepting` state. Full-bleed photo of the actual building.

**FR-A2 · "About this place" — owner's voice.** 2–3 paragraphs in the owner's own words, curated by us. This is the section listing apps cannot have. It must not read like marketing copy; it reads like a person.

**FR-A3 · Rooms.** One card per room type: photos, occupancy ("4-in-1"), bath type, price per academic year (GHS), availability count, amenities. Live data. Room CTA pre-selects that room in the inquiry form. **Rooms group by occupancy category** ("Two in a room") when a hostel carries several price variants under one category (TV, key, tier — see §8.5): one editorial row per category with the variants as expandable rows beneath it, so a 7-option branch stays scannable.

**FR-A4 · REMOVED (2026-09-08).** The gallery section is gone — the hostel page is rooms → practical → guide → good-to-know → location. `Hostel.gallery` survives ONLY as the photo fallback for rooms without their own photos (lib/live.ts).

**FR-A5 · Testimonials.** Resident quotes with name + program/year, faces where available.

**FR-A6 · Amenities block.** From the local amenity taxonomy: 24/7 electricity backup, water storage (polytank/borehole), Wi-Fi, on-site security, CCTV, shared kitchen, study room, distance-to-campus phrasing ("5 minutes' walk to campus").

**FR-A7 · Location & directions.** Landmark-based directions (this is how directions work locally — "behind the XYZ mosque, off the main road"), plus a map embed/link.

**FR-A8 · Inquiry form → WhatsApp.** The form lives on a **dedicated, shareable page** (2026-09-08): `/inquire` for unit hostels, `/b/[branch]/inquire` for a branch of a multi-branch org, and `/inquire` (with a location picker — FR-A0's pattern) at org level, so one link serves a whole multi-branch org while each inquiry still lands with the right caretaker. Room CTAs deep-link with `?room=…` pre-selected. Fields: name, phone, email (optional), room type (select), move-in date (semester select), optional message. On submit:
**FR-A8 · Inquiry form → WhatsApp.** A dedicated, shareable inquiry page (2026-09-08): `/inquire` (unit hostels, with a location picker for multi-branch orgs) and `/b/[slug]/inquire` (branch-scoped). Fields: name, phone, **email (required — confirmations go there)**, **guardian name + phone**, **course/programme**, **level (100–400 / postgraduate)**, room type (select), **academic year — auto-set to the next one** (Jan–May → the running `(year-1)/year`; from June → `year/(year+1)`, e.g. June 2026 → `2026/2027`), optional message. On submit:
1. The inquiry is logged to Convex and issued a **reference** — `{PREFIX}-{YEAR}-E{SEQ}` (e.g. `FRANCO-2026-E001`), sequential like the booking code but E-marked so the two never read alike.
2. A pre-filled WhatsApp message to the branch caretaker's number opens with the reference, guardian and programme details in it. (The form holds a blank tab open during the user gesture, awaits the mutation for the reference, then navigates the tab — mobile Safari keeps popups synchronous-only.)
3. A receipt email — with the reference — via Sequenzy. Email is the receipt, never the operating channel.

**Channel decision (2026-09-07):** WhatsApp stays the operating channel — it is what the manager already uses and the product's promise is easier outreach, not a new workflow. The dashboard Inbox is the *record*: every form inquiry lands there with phone + email + reference, and marking one "booked" issues the student's room code and emails it. Email = receipts and confirmations only.

**FR-A9 · Spam protection.** Honeypot field only. Turnstile deliberately dropped (friction vs. spam tradeoff accepted). Honeypot-filled submissions are discarded server-side.

**FR-A10 · Payment info.** Display-only MoMo name + number, and either a booking fee amount (when the hostel uses one) or a per-hostel payment note explaining their real flow (e.g. Franco: pay, send the receipt, get your code). No payment processing.

**FR-A11 · Sticky WhatsApp button.** The whole site's job is to start a conversation; a persistent "Chat on WhatsApp" button is on every screen.

**FR-A12 · QR code.** `/qr/[slug]` returns a scannable QR of the site URL — the flyer/noticeboard version of the one-link pitch. Generated with the `qrcode` package.

**FR-A13 · Per-branch theming.** Each branch carries palette tokens (accent color, heading font pairing, hero treatment). Two of our builds side by side must not look like the same template with a name swapped — this is the differentiation claim, so it's a requirement, not a nicety.

### 7.2 Surface B — Owner private link

**FR-B1 · The dashboard.** The owner's normal dashboard domain opens directly at `/`. In v1 there is no login or password; the dashboard deployment is selected for that hostel with `HOSTEL_ID` (the hostels row `_id`). The base app contains the Inbox and Rooms views. If authentication is added later, `/` becomes the gate and `/app` becomes the authenticated dashboard.

**FR-B2 · Security hygiene.** The dashboard is `noindex`, `nofollow`, excluded from any sitemap, and disallowed in `robots.txt` while authentication is deferred. It exposes real lead data. The dashboard hostname is the access boundary in v1; when authentication is added, access control must be enforced before rendering the dashboard.

**FR-B3 · Inbox tab.** The branch's enquiry list: who, reference (`FRANCO-2026-E001`), phone, email (when left), room wanted, when, message. **Status filter pills default to New — the working queue — with All last**; a search box covers reference, name, phone, room, code and email. Per-card actions: WhatsApp, Call, **Share code** (booked only — opens WhatsApp to the student with their room code already typed), and delete (two-tap confirm). At the list's foot: **Clear all enquiries** (two-tap confirm) — the end-of-campaign action for a new academic year; it clears the branch's inbox (or the whole hostel on unit hostels). Issued codes and references are never reused — the counters only move forward, so a cleared history can't collide with new codes. Toggling to "booked" issues the student's room code and emails it. **Code format (deterministic, never random):** `{PREFIX}-{YEAR}-{SEQ}` — the hostel's seeded prefix (e.g. `FRANCO`), the academic year the student paid for (from the move-in semester), and a monotonic per-hostel booking count (`FRANCO-2026-001`). A booking keeps its code forever; concurrent bookings serialize safely on the hostel row's counter. **Walk-ins:** the manager sends the student the site link (Share tab / WhatsApp) — the student books through the form, so the code system covers them too; no manual booking entry exists.

**FR-B4 · Rooms tab.** *Full self-service room management — no photos.* Unit hostels: create, edit, and delete rooms with every detail — name, occupancy, bath type, price per academic year, rooms available, amenities, the accepting toggle. Multi-branch hostels: the same inside each branch. **NO photo uploads anywhere (2026-09-08):** all imagery — hero, branch photos, room-category stock images — is bundled static assets curated by us; the manager never uploads photos, and the public site shows one curated image per room category. One-tap availability steppers and the accepting switch save instantly; everything else opens a form validated with zod + react-hook-form and sanitized server-side. All edits write to `roomChangeLog` and appear on the public site immediately.

**FR-B5 · Everything else is ours.** Photos, testimonials, copy, theming, MoMo details: hardcoded per client in the strings file, refreshed by us annually. The pitch line this enables: *"You run the rooms day to day; I keep the site looking sharp once a year."*

**FR-B6 · Hostel scope.** Each dashboard deployment is bound to one hostel by `HOSTEL_ID`. A multi-branch manager sees all branches' inquiries and rooms; a unit hostel has one implicit branch.

**FR-B6a · Hub-first branch navigation.** Multi-branch hostels with different people on site (like Franco: one caretaker per branch) open their dashboard **at the Branches hub** — the branch cards are the navigation, one tap enters that branch's workspace (Enquiries / Rooms / Share, all scoped). There is **no aggregated "all branches" inbox or rooms view** — each branch's work happens inside it. **Back is always one tap away:** on mobile the bottom bar leads with "Branches"; on desktop the sidebar nests — "← All branches" + the branch's name above its items. **Branch structure is ours, not the manager's:** branches are seeded once (like `codePrefix`) and cannot be created, renamed, or deleted from the dashboard — the name is the stable key the public site's curated shell matches on (a rename would orphan its WhatsApp line, photos and slug). The manager's branch edit is deliberately narrow: photos + the directions note. Adding/renaming a branch is an annual-refresh action by us. Each caretaker gets a **branch-locked deployment**: `NEXT_PUBLIC_BRANCH_ID` (a branch `_id`) pins the dashboard to their branch — no hub, no back, only their enquiries, rooms and share link (`/b/[slug]`). Unit hostels never see the branches level. **Honesty note:** branch scoping is view-level isolation only — v1 has no auth, and mutations are not branch-enforced server-side; real enforcement ships with the login tier.

**FR-B7 · Share tab.** The manager's outreach asset, self-serve: the site URL (`NEXT_PUBLIC_SITE_URL`), a copy button, a "visit" link, and a downloadable QR code generated in the browser — the flyer/noticeboard/WhatsApp-status version of the one-link pitch. No more waiting on us to send a QR.

### 7.3 Surface C — Internal tool (ours)

Token-gated (single operator secret in env — not an auth system, a gate). Small, boring, compounding:

**FR-C1 · Client list.** All branches, status (draft/live/paused), domain, renewal date, quick stats.

**FR-C2 · Content editor.** Swap photos, edit copy/testimonials, adjust theme — for every client from one screen. This is what makes "one person supports N clients" real.

**FR-C3 · Activity view.** Inquiries and page stats across every client — the proof-of-value data for renewal conversations ("your 4-in-1 got triple the inquiries; want better photos of those next cycle?").

**FR-C4 · Availability flip.** Fast status change on any client's behalf (the "text me" flow for clients who don't self-serve).

**FR-C5 · Change log viewer.** Who changed what, when — across multi-branch clients where several staff share one link.

**FR-C6 · Lead redirect (manual).** When a branch is full, we re-point the inquiry to a sister branch by changing its `branchId`. Deliberately manual — whether branch B wants overflow is a human decision, not code.

**FR-C7 · Token regeneration** for any owner link.

---

## 8. The Ghanaian hostel domain — simulated content model

This is the content simulation for the first demo build. It mirrors how the local system actually works. All of it is swappable per client; the *taxonomy* is the reusable part.

### 8.1 Room taxonomy

| Type | Occupancy | Notes |
|---|---|---|
| **4-in-1** | 4 students/room | The budget workhorse; most common in private hostels |
| **3-in-1** | 3 | Less common |
| **2-in-1** | 2 | The volume seller in private hostels |
| **1-in-1** | 1 | Premium; usually ensuite, sometimes A/C |

Each type exists in **ensuite** or **shared bath** variants. Pricing is quoted **per academic year**. Prices move during the admissions rush — hence live price editing being the one thing owners self-serve.

### 8.2 Amenity taxonomy (the ones that actually sell locally)

24/7 electricity backup (generator/"plant" — load-shedding makes this the #1 question) · reliable water (polytank/borehole) · Wi-Fi · on-site security guard · CCTV · shared kitchen · study/common room · proximity phrased as walk-time to campus.

### 8.3 How a booking actually happens here

Inquiry (WhatsApp) → chat / phone call → visit ("come and see the room") → **booking fee** to reserve (few hundred GHS, via MoMo) → room held, balance paid at move-in/registration. The site's job is to make step 1 structured and step 4's info visible (booking fee amount + MoMo details), nothing more.

### 8.4 The demo hostel (fictional, realistic)

- **Name:** Aseda Heights Hostel
- **Mode:** `unit` — the entry page is the whole site (the manual mode value lives in the mock file). A second fictional multi-branch hostel can be added later to demo the picker flow.
- **Location:** Kumasi — KNUST area ("8 minutes' walk to the main campus gate")
- **Rooms:** 4-in-1 shared bath — GHS 1,900/yr; 2-in-1 shared — GHS 3,400/yr; 1-in-1 ensuite — GHS 5,200/yr (all per academic year)
- **Booking fee:** GHS 300 via MoMo
- **About-copy voice:** proud, plain-spoken owner — "we've run this house for eleven years," plant and water reliability front and center
- **Testimonials:** 3 residents with program/year
- **Images:** placeholder photography that reads like a real Ghanaian private hostel (building exterior, corridor, room, common room) — replaced by the client's real photos on sign-off

### 8.5 The first client — Franco Hostel (real, in preview)

**Who:** Franco Hostel, Fiapre, Sunyani — serving University of Energy and Natural Resources students, ~20 minutes from campus. Four branches: **Main, Annex 1, Annex 2, Annex 3** (mode: `multi`).

**Confirmed facts (Kelvin, 2026-09-07):**
- Wi-Fi on for everyone. Security man awake all night. **No plant** (no generator), **no study room** — the site never claims them.
- Every room has its own bathroom, shared inside the room for 4-in-1 and 2-in-1; private for 1-in-1. Kitchen is shared.
- Campus is a **20-minute walk** from Fiapre. Prices are **per academic year**.
- Room categories carry **price variants** (same occupancy, different features/price) — hence the grouped-rooms UI (FR-A3). Main's confirmed prices (GHS/year): 4-in-1 5,000; 2-in-1 old block 6,000 (no TV) / 6,200 (TV) and new block 7,000 (no TV) / 7,200 (TV); 1-in-1 old block 9,200 / new block 10,500. All branches mirror Main (confirmed).
- All branches (Annex 1–3) mirror Main's prices (confirmed).
- Their real booking flow (what the site mirrors): student visits and checks rooms → pays by MoMo → sends the receipt to the manager on WhatsApp → manager confirms → student gets a room code. Our step-up: the code is issued by the dashboard when the manager marks "booked," and confirmed by email (FR-B3) — plus the receipt email on inquiry (FR-A8).

**Preview wiring:** `HOSTEL_SLUG=franco-hostel` (static shell: `landing_page/lib/franco-hostel.ts`) + the seeded Convex hostel row (`npx convex dev --once` to push code, then `npx convex run seed:seedFrancoHostel`). Open questions for the client: real photos, the manager's WhatsApp + MoMo details, and real resident testimonials (current ones are placeholders).

---

## 9. Tech stack (verified current, Sept 2026)

| Tool | Version | Notes |
|---|---|---|
| pnpm | 11.3.0 local (12 latest) | Package manager; local version is fine |
| Node | ≥ 20.9 (26.7 local) | Next 16 floor |
| Next.js | 16.3.x | Turbopack default; `proxy.ts` not `middleware.ts`; `next build` no longer lints |
| TypeScript | 7.x | Strict |
| Tailwind CSS | 4.3.x | **CSS-first config** — `@import "tailwindcss"` + `@theme` tokens in `globals.css`; no `tailwind.config.js` |
| Convex | 1.45.x | Client hooks + `convex/nextjs` (`preloadQuery`, `fetchQuery`, `fetchMutation`) for Server Components/Actions |
| React Hook Form | 7.87.x | Inquiry form |
| Zod | 4.5.x | Shared client/server validation schema |
| @hookform/resolvers | 5.9.x | RHF ↔ Zod bridge |
| qrcode | 1.5.x | Flyer QR generation |
| ESLint | 10.x flat config | Via `eslint-config-next@16`; `pnpm lint` script |
| Hosting | Vercel | One project per hostel, `HOSTEL_ID` env; Pro tier required for commercial client sites |
| Email receipts | Sequenzy SDK | Transactional emails sent from Convex (`"use node"` actions, `convex/emails.ts`); `SEQUENZY_API_KEY` lives on the Convex deployment env — the Next apps never send email and carry no key. Sender domain: `mail.hostels.kelpyshades.com` |
| Analytics | Cloudflare Web Analytics | Free, privacy-friendly, dropped in per page; do not build analytics |
| Images | Bundled static assets | **5 images per client** (2026-09-08 discipline): exterior + annex (the hero crossfade, one photo per branch) and room-4in1/2in1/1in1 (one stock image per room category). All live in `landing_page/assets/`, imported by the per-client shells — content-hashed URLs, immutable caching, next/image optimization. No R2, no uploads; swapping a client's photos = replacing files at the annual refresh |

**Scaffolding command (per current Next.js docs):**
```bash
pnpm create next-app@latest hostel --yes   # TS + Tailwind + ESLint + App Router + Turbopack + AGENTS.md
```

**Stack decisions already ruled out (do not reintroduce):**
- No Zustand (Convex reactive queries + `useState` cover everything; it earns a place or it doesn't ship)
- No auth library of any kind
- No Turnstile (honeypot only)
- No per-client Convex deployments, buckets, or codebases

---

## 10. Non-functional requirements

- **NFR-1 · Mobile-first.** The overwhelming majority of students arrive on a phone, often mid-range Android, on data. Every design decision is made at 360px width first.
- **NFR-2 · Performance.** Statically generated shells; sized images; Lighthouse mobile targets: LCP < 2.5s on Fast 3G-ish, CLS ~0.
- **NFR-3 · SEO.** Per-branch metadata, sitemap, semantic HTML. This is a stated reason for choosing Next.js — keep it true.
- **NFR-4 · Data cost.** No autoplaying video, no full-resolution originals, no heavy web fonts. A student on a limited bundle should be able to browse the whole site cheaply.
- **NFR-5 · Privacy of lead data.** Owner inbox noindexed and sitemap-excluded (FR-B2). Inquiry data never leaves our Convex + the owner's WhatsApp.
- **NFR-6 · Accessibility.** Contrast, focus states, labels on all form fields, tap targets ≥ 44px.
- **NFR-7 · Durability.** Zero-maintenance posture: no schedulers, no queues, no servers we babysit. Convex and Vercel are managed.
- **NFR-8 · Differentiation audit.** Before signing client #2, view clients #1 and #2 side by side — if they read as the same template, the theming requirement (FR-A13) has failed.

---

## 11. v1 build order (what we're doing now)

Build order decision: **public page first, then the manager-facing site, then ours last** — so Kelvin can show the manager (a) what the public page looks like and (b) how they manage it. The internal tool is for us and comes later.

1. **Spec approval** — this document. ✅ (2026-09-06, with hostel-not-branch model correction)
2. **Scaffold** — pnpm + Next 16 + TS + Tailwind 4 + ESLint, per §9.
3. **Public site, demo hostel** — the full Aseda Heights page (FR-A0→A13) with hardcoded mock content in a typed `lib/mock-hostel.ts` (same shape as the Convex schema, so swapping to live data later is a data-source change, not a rewrite). Working WhatsApp flow with a test number. Working QR route.
   - **All public-page UI is decided under the huashu-design skill** (`.agents/skills/huashu-design`): 3 differentiated design directions offered before building → junior pass with placeholders → full pass with real photography (never SVG-drawn imagery or CSS silhouettes) → anti-slop checklist applied.
4. **Owner/manager dashboard** — full manager surface (Surface B) in the separate `dashboard` app, scoped to the deployment's `HOSTEL_ID`: inbox, room CRUD for unit hostels, branch + room CRUD for multi-branch.
5. **Client demo** — Kelvin shows the public page + the manager dashboard to the first hostel.
6. On acceptance: **Convex wiring** (schema, real hostel, real content), Sequenzy receipt email.
7. **Internal tool (Surface C)** — ours, built later when there is real client data to manage.

The mockup must be a real running build — the demo has to *feel* like their future website, which a static image can't do.

---

## 12. Explicitly deferred (build only on real demand)

| Deferred thing | Trigger to revisit |
|---|---|
| Tenant/tenant portal | A specific paying owner with 2–3 properties asks for something bigger *after* v1 works for them. Name it honestly: that's property-management software, a different product. |
| Automated WhatsApp push (server sends to owner via API) | A few clients live + basic version proven; premium tier. |
| Automated cross-branch lead redirect | Volume makes manual redirects painful. |
| Org rollup link | First multi-branch hostel client signs. |
| MoMo/payments integration | A client demands it and we price it as a tier. |
---

## 13. Verification (how we know each piece works)

- **Spec:** Kelvin reads and approves this file before scaffolding.
- **Public site:** `pnpm dev` → `localhost:3000` — walkthrough of every FR-A item on a phone-sized viewport; WhatsApp button opens a correctly pre-filled chat (test number); QR scans to the page; Lighthouse mobile pass.
- **Mode routing:** unit hostel entry shows the full site directly; a branch path on a unit hostel redirects to the hostel home; unknown hostel or branch slug shows the branded 404 (not the default Next 404).
- **Form:** honeypot submission discarded; valid submission logged + WhatsApp opens with structured message.
- **Inbox/Rooms:** the manager dashboard opens at `/`; `HOSTEL_ID` selects exactly one hostel; unit hostels auto-create their implicit branch; room forms reject empty names, non-numeric and non-positive prices (zod, client and server); branches with rooms can't be deleted; every manager edit lands in `roomChangeLog`; dashboard is `noindex` + robots-disallowed.
- **Photos:** NONE — all imagery is bundled static assets (`landing_page/assets/images.ts`): content-hashed, immutable-cache, next/image-optimized, same-origin. Swapping a client's photos = replacing files and redeploying.
- **Internal tool (when built):** token gate blocks anonymous access; content swap reflects on the public site within a rebuild.
- **Deploy:** each hostel's Vercel project answers at both its `*.vercel.app` URL and the client's custom domain; SSL auto-issued; `HOSTEL_ID` env selects the hostel.

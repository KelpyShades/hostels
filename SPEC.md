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
| **Hostel manager** (multi-branch hostels) | Their hostel dashboard domain (no login in v1) | Same inbox view across all branches of their hostel |
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
└──────────────┬───────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
 ONE Convex deployment   ONE Cloudflare R2 bucket
 (hostel→branch→room/    hostels/{hostelId}/…
  inquiry rows)          + one shared image-processing
                          worker (if needed)
```

**Deployment model: separate public and manager projects per hostel.** `landing_page` is the public hostel site. `dashboard` is the owner/manager app. Both are deployed per hostel and point at the same Convex deployment; `HOSTEL_ID` (the hostels row `_id`) selects the hostel for the dashboard deployment. The dashboard domain is the manager's normal hosting domain for v1. Authentication can be added later without changing the manager's internal routes: `/` becomes the gate and `/app` becomes the dashboard.

> **Cost note:** Vercel's free Hobby tier prohibits commercial projects — client hostel sites require the Pro plan (or the risk is accepted knowingly). Convex and R2 stay on their generous free tiers.

**The hostel is the client unit — never the branch.** A hostel is a single place by default; some hostels have branches. Both kinds are one hostel record with a `mode` field (`'unit' | 'multi'`). Implementation detail: a unit hostel is stored with exactly one implicit branch so rooms always belong to exactly one location and there's a single query shape — but the *product* language and UI only ever say "hostel," and the mode only decides whether a branch picker appears.

**Surface placement:** `landing_page` carries the public site. `dashboard` is a separate per-hostel deployment for the owner/manager and opens directly at its base route. The internal tool (ours) is a separate small project against the same Convex — built later, when there's real client data.

- **Separate public and dashboard projects per hostel.** The public deployment serves the student-facing site. The dashboard deployment serves the owner/manager app and uses `HOSTEL_ID` to bind itself to one hostel.
- **One Convex project.** Multi-branch orgs are a foreign key, not a fork.
- **One R2 bucket.** Keys namespaced `hostels/{branchId}/room-1.jpg`. Never a bucket per client.

### Directory layout

```
hostel/                        ← one repo; one build deployed per hostel
├── SPEC.md                    ← this file
├── landing_page/              # public student-facing hostel site
├── dashboard/                 # owner/manager dashboard, root route is the app
├── convex/                    # shared schema, queries, mutations, R2 component
```

(The internal tool is a separate deployment — its own small app against the same Convex.)

---

## 5. Data model (Convex schema)

```
hostels                        ← the client unit: one hostel (single or multi-branch)
  name                         ← required — draft a row with just name + mode + status
  mode                         ← 'unit' | 'multi' (required)
  status                       ← draft | live | paused (required)
  customDomain?                ← everything below is optional; fill in before going live
  whatsappNumber?              ← E.164, e.g. +233…
  momoName?, momoNumber?, bookingFee?
  tagline?, aboutCopy?         ← owner's own voice, curated by us
  directions?, mapQuery?
  heroImages[], gallery[]      ← R2 keys (asset rows, not inline)
  testimonials[]               ← { name, program/year, quote, photoKey? }
  theme?                       ← palette tokens (see §7.4)
  renewalDate?
  seo: { title, description }?

  Binding: each deployment selects its hostel by the row's `_id` via the
  HOSTEL_ID env var — no slug field, no lookup by name.

branches                       ← multi-branch hostels (unit hostels have one implicit record)
  hostelId                     ← FK (required)
  name                         ← required
  slug?                        ← optional; only for /b/[branch] public routing
  whatsappNumber?, directions? ← branch-level overrides where they differ
  directionsNote?              ← "8 min walk to the main gate" style, per branch
  sortOrder

rooms
  branchId                     ← FK; always a branch (unit hostels: their one implicit branch)
  hostelId                     ← denormalized for convenience
  name                         ← e.g. "4-in-1 (Shared bath)"
  occupancy                    ← 1 | 2 | 3 | 4
  bathType                     ← ensuite | shared
  pricePerSemester             ← GHS, integer
  availableCount               ← integer, owner-editable
  accepting                    ← boolean (the in/out toggle), owner-editable
  amenities?                   ← optional; subset of amenity taxonomy
  photoKey?                    ← R2 key
  sortOrder

inquiries
  branchId, hostelId           ← branch (implicit for unit hostels)
  name, phone, roomName
  moveInDate, message
  status                       ← new | contacted | booked
  source                       ← wa | form (see §7.3)
  createdAt

roomChangeLog                  ← ours, not exposed to owners
  branchId, roomId, field, oldValue, newValue,
  changedBy                    ← owner | internal
  createdAt
```

**Validation invariants** (enforced in Convex mutations, not just the UI):
- `pricePerSemester` must be a positive integer; cannot be set to 0 or blanked.
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

**FR-A3 · Rooms.** One card per room type: photos, occupancy ("4-in-1"), bath type, price per semester (GHS), availability count, amenities. Live data. Room CTA pre-selects that room in the inquiry form.

**FR-A4 · Gallery.** Real character photos — corridors, common room, the view, the kitchen — not just bed-and-price specs. Responsive, sized-down images (mobile data cost is a real constraint here; see NFR-4).

**FR-A5 · Testimonials.** Resident quotes with name + program/year, faces where available.

**FR-A6 · Amenities block.** From the local amenity taxonomy: 24/7 electricity backup, water storage (polytank/borehole), Wi-Fi, on-site security, CCTV, shared kitchen, study room, distance-to-campus phrasing ("5 minutes' walk to campus").

**FR-A7 · Location & directions.** Landmark-based directions (this is how directions work locally — "behind the XYZ mosque, off the main road"), plus a map embed/link.

**FR-A8 · Inquiry form → WhatsApp.** Fields: name, phone, room type (select), move-in date (semester select), optional message. On submit:
1. A pre-filled WhatsApp message to the owner's number opens via `wa.me/<number>?text=…` — the student just taps send. The message is *structured*: name, room type wanted, move-in semester, phone — so the owner can answer immediately instead of "hi is there a room."
2. The inquiry is logged to Convex (server action) before the redirect fires.
3. (Production) A confirmation email receipt — "we got your inquiry, [hostel] will reach out on WhatsApp shortly" — via Pingram. Email is the receipt, never the operating channel.

**FR-A9 · Spam protection.** Honeypot field only. Turnstile deliberately dropped (friction vs. spam tradeoff accepted). Honeypot-filled submissions are discarded server-side.

**FR-A10 · Payment info.** Display-only MoMo name + number (and booking fee amount if set). No payment processing.

**FR-A11 · Sticky WhatsApp button.** The whole site's job is to start a conversation; a persistent "Chat on WhatsApp" button is on every screen.

**FR-A12 · QR code.** `/qr/[slug]` returns a scannable QR of the site URL — the flyer/noticeboard version of the one-link pitch. Generated with the `qrcode` package.

**FR-A13 · Per-branch theming.** Each branch carries palette tokens (accent color, heading font pairing, hero treatment). Two of our builds side by side must not look like the same template with a name swapped — this is the differentiation claim, so it's a requirement, not a nicety.

### 7.2 Surface B — Owner private link

**FR-B1 · The dashboard.** The owner's normal dashboard domain opens directly at `/`. In v1 there is no login or password; the dashboard deployment is selected for that hostel with `HOSTEL_ID` (the hostels row `_id`). The base app contains the Inbox and Rooms views. If authentication is added later, `/` becomes the gate and `/app` becomes the authenticated dashboard.

**FR-B2 · Security hygiene.** The dashboard is `noindex`, `nofollow`, excluded from any sitemap, and disallowed in `robots.txt` while authentication is deferred. It exposes real lead data. The dashboard hostname is the access boundary in v1; when authentication is added, access control must be enforced before rendering the dashboard.

**FR-B3 · Inbox tab.** Chronological inquiry list: who, phone, room wanted, when, message. Status badges: new / contacted / booked. Toggle updates the inquiry row.

**FR-B4 · Rooms tab.** *Narrow, structured self-service editing — price and availability only.* Per room row: price field + available count + in/out toggle. No free text, no photos, no layout — a bad edit here is impossible by construction ("GHS 450, 2 rooms left" looks identical whoever typed it). All edits write to `roomChangeLog`.

**FR-B5 · Everything else is ours.** Photos, testimonials, copy, theming: annual refresh, done by us. The pitch line this enables: *"You control day-to-day pricing and availability yourself; I keep the site looking sharp once a year."*

**FR-B6 · Hostel scope.** Each dashboard deployment is bound to one hostel by `HOSTEL_ID`. A multi-branch manager sees all branches' inquiries and rooms; a unit hostel has one implicit branch. Branch-level dashboard views can be added later if needed.

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

Each type exists in **ensuite** or **shared bath** variants. Pricing is quoted **per semester**, sometimes with a per-year option. Prices move during the admissions rush — hence live price editing being the one thing owners self-serve.

### 8.2 Amenity taxonomy (the ones that actually sell locally)

24/7 electricity backup (generator/"plant" — load-shedding makes this the #1 question) · reliable water (polytank/borehole) · Wi-Fi · on-site security guard · CCTV · shared kitchen · study/common room · proximity phrased as walk-time to campus.

### 8.3 How a booking actually happens here

Inquiry (WhatsApp) → chat / phone call → visit ("come and see the room") → **booking fee** to reserve (few hundred GHS, via MoMo) → room held, balance paid at move-in/registration. The site's job is to make step 1 structured and step 4's info visible (booking fee amount + MoMo details), nothing more.

### 8.4 The demo hostel (fictional, realistic)

- **Name:** Aseda Heights Hostel
- **Mode:** `unit` — the entry page is the whole site (the manual mode value lives in the mock file). A second fictional multi-branch hostel can be added later to demo the picker flow.
- **Location:** Kumasi — KNUST area ("8 minutes' walk to the main campus gate")
- **Rooms:** 4-in-1 shared bath — GHS 1,900/sem; 2-in-1 shared — GHS 3,400/sem; 1-in-1 ensuite — GHS 5,200/sem
- **Booking fee:** GHS 300 via MoMo
- **About-copy voice:** proud, plain-spoken owner — "we've run this house for eleven years," plant and water reliability front and center
- **Testimonials:** 3 residents with program/year
- **Images:** placeholder photography that reads like a real Ghanaian private hostel (building exterior, corridor, room, common room) — replaced by the client's real photos on sign-off

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
| Email receipts | Pingram | Verify current API docs at integration time (also does WhatsApp API — a future premium-tier option may live in the same account) |
| Analytics | Cloudflare Web Analytics | Free, privacy-friendly, dropped in per page; do not build analytics |
| Images | R2 + shared image-processing worker | All hostel projects point at the same R2 bucket/worker; serve sized variants, never originals |

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
- **NFR-7 · Durability.** Zero-maintenance posture: no schedulers, no queues, no servers we babysit. Convex, Vercel, and R2 are all managed.
- **NFR-8 · Differentiation audit.** Before signing client #2, view clients #1 and #2 side by side — if they read as the same template, the theming requirement (FR-A13) has failed.

---

## 11. v1 build order (what we're doing now)

Build order decision: **public page first, then the manager-facing site, then ours last** — so Kelvin can show the manager (a) what the public page looks like and (b) how they manage it. The internal tool is for us and comes later.

1. **Spec approval** — this document. ✅ (2026-09-06, with hostel-not-branch model correction)
2. **Scaffold** — pnpm + Next 16 + TS + Tailwind 4 + ESLint, per §9.
3. **Public site, demo hostel** — the full Aseda Heights page (FR-A0→A13) with hardcoded mock content in a typed `lib/mock-hostel.ts` (same shape as the Convex schema, so swapping to live data later is a data-source change, not a rewrite). Working WhatsApp flow with a test number. Working QR route.
   - **All public-page UI is decided under the huashu-design skill** (`.agents/skills/huashu-design`): 3 differentiated design directions offered before building → junior pass with placeholders → full pass with real photography (never SVG-drawn imagery or CSS silhouettes) → anti-slop checklist applied.
4. **Owner/manager dashboard** — inbox + rooms views (Surface B) in the separate `dashboard` app, scoped to the deployment's `HOSTEL_ID`.
5. **Client demo** — Kelvin shows the public page + the manager dashboard to the first hostel.
6. On acceptance: **Convex wiring** (schema, real hostel, real content, R2 uploads), Pingram receipt email.
7. **Internal tool (Surface C)** — ours, built later when there is real client data to manage.

The mockup must be a real running build — the demo has to *feel* like their future website, which a static image can't do.

---

## 12. Explicitly deferred (build only on real demand)

| Deferred thing | Trigger to revisit |
|---|---|
| Tenant/tenant portal | A specific paying owner with 2–3 properties asks for something bigger *after* v1 works for them. Name it honestly: that's property-management software, a different product. |
| Automated WhatsApp push (server sends to owner via API) | A few clients live + basic version proven; premium tier. Pingram already does WhatsApp API. |
| Automated cross-branch lead redirect | Volume makes manual redirects painful. |
| Org rollup link | First multi-branch hostel client signs. |
| MoMo/payments integration | A client demands it and we price it as a tier. |
---

## 13. Verification (how we know each piece works)

- **Spec:** Kelvin reads and approves this file before scaffolding.
- **Public site:** `pnpm dev` → `localhost:3000` — walkthrough of every FR-A item on a phone-sized viewport; WhatsApp button opens a correctly pre-filled chat (test number); QR scans to the page; Lighthouse mobile pass.
- **Mode routing:** unit hostel entry shows the full site directly; a branch path on a unit hostel redirects to the hostel home; unknown hostel or branch slug shows the branded 404 (not the default Next 404).
- **Form:** honeypot submission discarded; valid submission logged + WhatsApp opens with structured message.
- **Inbox/Rooms:** the manager dashboard opens at `/`; the deployment's `HOSTEL_ID` selects exactly one hostel; price edits reject 0/blank; change logs record edits; dashboard is `noindex` + robots-disallowed. Later authentication tests must cover the `/` gate and `/app` dashboard.
- **Internal tool (when built):** token gate blocks anonymous access; content swap reflects on the public site within a rebuild.
- **Deploy:** each hostel's Vercel project answers at both its `*.vercel.app` URL and the client's custom domain; SSL auto-issued; `HOSTEL_ID` env selects the hostel.

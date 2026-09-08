/**
 * Mock hostel data for the Aseda Heights demo.
 * Shaped exactly like the Convex schema (SPEC.md §5) so switching to live
 * data later is a data-source swap, not a rewrite.
 *
 * Manual mode switch (SPEC.md §6.1): `mode` decides what `/` renders —
 * 'unit' serves the whole site at the root; 'multi' serves the org view
 * (brand + branch picker), with each branch's full site at /b/[slug].
 * Flip it to demo either flow; mode is data, not a code fork.
 *
 * Multiple images: every room and branch carries an ordered `photos` list
 * (first = cover). All sources are bundled static assets imported from
 * assets/images.ts — content-hashed and next/image-optimized.
 */

import { francoBranches, francoHostel } from "./franco-hostel";
import { img } from "../assets/images";

export type HostelMode = "unit" | "multi";

export type BathType = "ensuite" | "shared";

export type Amenity =
  | "power-backup"
  | "water-storage"
  | "wifi"
  | "security"
  | "cctv"
  | "kitchen"
  | "study-room"
  | "ac";

/** One photo in a room/branch carousel. Caption keeps mixed shots honest.
 *  `src` is a bundled static-asset URL (assets/images.ts, imported by the
 *  per-client shells) — content-hashed and next/image-optimized. There is
 *  no photo upload pipeline; all imagery is curated by us. */
export interface Photo {
  src: string;
  caption?: string;
}

/** Assurance ledger (the dark "practical things" band) — per-hostel
 *  curation: the owner's real claims, never generic amenity chips. */
export interface LedgerData {
  intro: string;
  items: { figure: string; title: string; body: string }[];
  also: string;
}

/** "How to book" — the client's real process, per-hostel. Different
 *  hostels book differently (booking fee vs pay-then-receipt); the guide
 *  must tell the truth for each. */
export interface GuideData {
  whatYouNeed: string[];
  steps: { title: string; body: string }[];
}

export interface RoomType {
  id: string;
  name: string;
  occupancy: 1 | 2 | 3 | 4;
  bathType: BathType;
  pricePerYear: number; // GHS, per academic year
  availableCount: number;
  accepting: boolean;
  amenities: Amenity[];
  blurb: string;
  sortOrder: number;
}

export interface Testimonial {
  name: string;
  detail: string; // program / year
  quote: string;
}

export interface Branch {
  id: string;
  slug: string;
  name: string;
  directionsNote: string;
  /** This branch caretaker's own WhatsApp line — falls back to the org's (SPEC.md §5). */
  whatsappNumber?: string;
  /** This branch's walk-to-campus figure — falls back to the org's. */
  walkToCampus?: string;
  photos: Photo[]; // ordered, first = cover
  rooms: RoomType[];
}

export interface Hostel {
  id: string;
  slug: string;
  name: string;
  mode: HostelMode;
  tagline: string;
  area: string; // university / area
  city: string;
  walkToCampus: string; // "8 min" — used in hero stats
  whatsappNumber: string; // E.164 — demo number, swap for the client's
  momoName: string;
  momoNumber: string;
  /** GHS booking fee — only when the hostel uses one (FR-A10). */
  bookingFee?: number;
  /** Replaces the fee line when there's no fixed booking fee — e.g.
   *  Franco's pay-then-send-receipt flow, explained in the owner's voice. */
  paymentNote?: string;
  aboutCopy: string[]; // paragraphs, owner's voice
  /** The hero crossfade — exactly 2 images (2026-09-08): the exterior
   *  and the annex. First = the static base. */
  heroImages: string[]; // ordered, first = cover (hero crossfade / framing)
  /** ONE stock image per room category, keyed by occupancy — the room
   *  photos on the public site (rooms carry no photos of their own).
   *  3-in-1 shares the 2-in-1 image (rare category). */
  roomImages: Record<1 | 2 | 3 | 4, string>;
  faqs: { question: string; answer: string }[]; // org-wide
  houseRules: { title: string; detail: string }[]; // org-wide (branch overrides later, on real demand)
  ledger: LedgerData; // the assurance band — per-hostel, real claims only
  guide: GuideData; // booking process — per-hostel, their real flow
  directions: string;
  mapQuery: string; // for a maps link
  status: "draft" | "live" | "paused";
}

/**
 * Aseda Heights Hostel — fictional but realistic KNUST-area hostel.
 * Prices are mid-range realistic GHS per academic year (SPEC.md §8.4).
 * Manual mode switch lives here: 'unit' | 'multi'.
 */
export const MODE: HostelMode = "multi";

export const asedaHeights: Hostel = {
  id: "aseda-heights",
  slug: "aseda-heights",
  name: "Aseda Heights Hostel",
  mode: MODE,
  tagline: "A quiet, well-kept home eight minutes from the KNUST main gate.",
  area: "KNUST, Kumasi",
  city: "Kumasi",
  walkToCampus: "8 min",
  whatsappNumber: "233270088802", // DEMO — the org line; branches can override with their caretaker's (SPEC.md §5)
  momoName: "Aseda Heights",
  momoNumber: "055 000 0000",
  bookingFee: 300,
  aboutCopy: [
    "We have run this house for eleven years, and most of our students come because someone who stayed here before told them about it. The rooms are clean, the corridors are quiet at night, and the plant comes on the moment the lights go — your fan and your phone charger will never know there was a blackout.",
    "Water is never a discussion here. The polytanks are filled twice a week and the borehole is there when the taps rest. There is a guard at the gate all night, cameras on both floors, and a study room that stays open past midnight during exams.",
    "Walk out of the main gate, take the road behind the mosque, and we are the cream building on your right — about eight minutes on foot. Come and see the room before you decide. We prefer it that way.",
  ],
  heroImages: [img.exterior.src, img.annex.src],
  roomImages: {
    1: img.room1in1.src,
    2: img.room2in1.src,
    3: img.room2in1.src, // rare category — shares the 2-in-1 shot
    4: img.room4in1.src,
  },
  faqs: [
    {
      question: "Is the booking fee part of the rent?",
      answer:
        "Yes — the fee comes off your first payment. It just holds the room so nobody else takes it.",
    },
    {
      question: "What happens when the lights go off?",
      answer:
        "The plant comes on immediately. Your fan and your phone charger will never know there was a blackout.",
    },
    {
      question: "Can I see the room before paying anything?",
      answer:
        "Please do — we prefer it that way. Send an inquiry or chat with us on WhatsApp and we'll arrange a visit.",
    },
    {
      question: "Do I pay everything at once?",
      answer:
        "No. The booking fee holds the room; the balance is paid at registration when the semester starts.",
    },
    {
      question: "Can my parents visit?",
      answer:
        "Anytime during the day. Visitors sign in at the gate and leave by 10pm, like everyone else's.",
    },
  ],
  houseRules: [
    { title: "Quiet hours", detail: "10pm to 6am. Exams or not, everyone sleeps." },
    { title: "Visitors", detail: "Welcome during the day; sign in at the gate and leave by 10pm." },
    { title: "Cooking", detail: "In the shared kitchen, not in the rooms." },
    { title: "Payments", detail: "Fees by the stated dates; receipts issued for everything." },
    { title: "Reporting faults", detail: "Report to the caretaker the same day — things get fixed within the week." },
  ],
  ledger: {
    intro: "What eleven years of running this house have taught us to get right.",
    items: [
      {
        figure: "24/7",
        title: "Power",
        body: "The plant comes on the moment the lights go. Your fan and your phone charger never know there was a blackout.",
      },
      {
        figure: "2×",
        title: "Water",
        body: "Polytanks filled twice a week, and the borehole answers when the taps rest. Water is never a discussion here.",
      },
      {
        figure: "All night",
        title: "Security",
        body: "A guard at the gate from dusk to dawn, with cameras on both floors.",
      },
      {
        figure: "Midnight",
        title: "Study room",
        body: "Open past midnight during exams, with light that never fails.",
      },
    ],
    also: "Also throughout the house: Wi-Fi, a shared kitchen big enough for the morning rush, and air conditioning in the 1-in-1.",
  },
  guide: {
    whatYouNeed: [
      "Your WhatsApp number",
      "Your student ID number and programme",
      "Your move-in semester",
      "A way to pay the booking fee (MoMo)",
    ],
    steps: [
      {
        title: "Ask",
        body: "Check the rooms and prices, then send an inquiry or chat with us on WhatsApp. We'll tell you what's open.",
      },
      {
        title: "Come and see",
        body: "Visit the room before you decide — we prefer it that way. We'll arrange a time on WhatsApp.",
      },
      {
        title: "Hold your room",
        body: "Pay the booking fee via MoMo and the room is held for you. It comes off your first payment.",
      },
      {
        title: "Register",
        body: "At the start of the semester, complete your registration and pay the balance.",
      },
      {
        title: "Move in",
        body: "Move in on your agreed date. If anything needs fixing, we're around.",
      },
    ],
  },
  directions:
    "From the KNUST main gate, take the road behind the mosque. We're the cream-coloured building on the right, about eight minutes on foot. Look for the blue 'Aseda Heights' sign at the gate.",
  mapQuery: "KNUST Main Gate, Kumasi",
  status: "live",
};

/** The single implicit branch for unit mode (SPEC.md §5). One photo per
 *  branch (2026-09-08); rooms carry none — categories use roomImages. */
export const mainLocation: Branch = {
  id: "aseda-main",
  slug: "main",
  name: "Aseda Heights — Main Building",
  directionsNote: "Behind the mosque, 8 min walk from the main gate",
  photos: [{ src: img.exterior.src, caption: "The main building, from the street" }],
  rooms: [
    {
      id: "room-4in1",
      name: "4-in-1",
      occupancy: 4,
      bathType: "shared",
      pricePerYear: 1900,
      availableCount: 6,
      accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "kitchen"],
      blurb:
        "Our most popular room. Four beds, big windows on both sides, shared bath on the corridor — never a queue in the morning.",
      sortOrder: 1,
    },
    {
      id: "room-2in1",
      name: "2-in-1",
      occupancy: 2,
      bathType: "shared",
      pricePerYear: 3400,
      availableCount: 3,
      accepting: true,
      amenities: [
        "power-backup",
        "water-storage",
        "wifi",
        "security",
        "kitchen",
        "study-room",
      ],
      blurb:
        "Two beds with a long desk between them — built for people who actually study in their room. Shared bath.",
      sortOrder: 2,
    },
    {
      id: "room-1in1",
      name: "1-in-1 Ensuite",
      occupancy: 1,
      bathType: "ensuite",
      pricePerYear: 5200,
      availableCount: 2,
      accepting: true,
      amenities: [
        "power-backup",
        "water-storage",
        "wifi",
        "security",
        "kitchen",
        "study-room",
        "ac",
      ],
      blurb:
        "One person, your own bathroom, air conditioning. The quiet option at the end of the corridor.",
      sortOrder: 3,
    },
  ],
};

/** Second branch — only surfaced in multi mode. Carries its own
 *  caretaker line and walk time: the demo's proof of branch overrides. */
export const annexLocation: Branch = {
  id: "aseda-annex",
  slug: "annex",
  name: "Aseda Heights — Annex",
  directionsNote: "Past the junction, 12 min walk from the main gate",
  whatsappNumber: "233270088802", // DEMO — the Annex caretaker's own line
  walkToCampus: "12 min",
  photos: [{ src: img.annex.src, caption: "The Annex, from the street" }],
  rooms: [
    {
      id: "annex-4in1",
      name: "4-in-1",
      occupancy: 4,
      bathType: "shared",
      pricePerYear: 1750,
      availableCount: 4,
      accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "kitchen"],
      blurb:
        "The budget option at the Annex — same management, same standards, a few minutes further from the gate.",
      sortOrder: 1,
    },
    {
      id: "annex-2in1",
      name: "2-in-1",
      occupancy: 2,
      bathType: "shared",
      pricePerYear: 3100,
      availableCount: 0,
      accepting: false,
      amenities: [
        "power-backup",
        "water-storage",
        "wifi",
        "security",
        "kitchen",
        "study-room",
      ],
      blurb: "Two beds, quiet corner of the Annex block, shared bath.",
      sortOrder: 2,
    },
  ],
};

/** Branches used when MODE === 'multi' (demo of the picker flow). */
export const branches: Branch[] = [mainLocation, annexLocation];

export function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

/** A room category — occupancy group with variant rooms under it
 *  (e.g. Franco's four 2-in-1 price tiers). Categories keep a long
 *  variant list scannable: open the category, see the tiers. */
export interface RoomCategory {
  occupancy: 1 | 2 | 3 | 4;
  /** All variants, cheapest-first. */
  rooms: RoomType[];
}

/** Group a branch's rooms into occupancy categories, cheapest tier first
 *  within each. Categories with one room still render as a category —
 *  one composition, no special cases. */
export function groupRooms(rooms: RoomType[]): RoomCategory[] {
  const byOccupancy = new Map<number, RoomType[]>();
  for (const room of rooms) {
    const list = byOccupancy.get(room.occupancy) ?? [];
    list.push(room);
    byOccupancy.set(room.occupancy, list);
  }
  return [...byOccupancy.entries()]
    .sort((a, b) => b[0] - a[0]) // 4-in-1 (budget) first, 1-in-1 (premium) last
    .map(([occupancy, list]) => ({
      occupancy: occupancy as RoomCategory["occupancy"],
      rooms: [...list].sort((a, b) => a.pricePerYear - b.pricePerYear),
    }));
}

/** The demo hostels this shell can serve. A production deployment sets
 *  HOSTEL_SLUG to its client's seed (landing_page/lib/<slug>-hostel.ts);
 *  live Convex data (HOSTEL_ID) overrides identity, branches and rooms. */
const shells: Record<string, { hostel: Hostel; branches: Branch[] }> = {
  [asedaHeights.slug]: { hostel: asedaHeights, branches },
  "franco-hostel": { hostel: francoHostel, branches: francoBranches },
};

/** Deployment-level hostel selection (SPEC.md §6.1): each Vercel project
 *  sets HOSTEL_SLUG; dev defaults to the demo hostel. */
export function getHostel(): Hostel {
  const slug = process.env.HOSTEL_SLUG ?? asedaHeights.slug;
  const shell = shells[slug];
  if (!shell) {
    throw new Error(`No hostel shell for HOSTEL_SLUG=${slug}`);
  }
  return shell.hostel;
}

export function getBranches(): Branch[] {
  const slug = process.env.HOSTEL_SLUG ?? asedaHeights.slug;
  const shell = shells[slug];
  if (!shell) {
    throw new Error(`No hostel shell for HOSTEL_SLUG=${slug}`);
  }
  return shell.branches;
}

/** Open rooms across a branch — accepting rooms' available counts, summed. */
export function openRooms(branch: Branch): number {
  return branch.rooms.reduce((n, r) => n + (r.accepting ? r.availableCount : 0), 0);
}

/** Lowest academic-year price across a set of rooms — the "from" figure.
 *  null when there are no rooms yet (rendered as "Ask us"). */
export function minFrom(rooms: RoomType[]): number | null {
  return rooms.length ? Math.min(...rooms.map((r) => r.pricePerYear)) : null;
}

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
 * (first = cover). Mock paths live in /public/mock — production keys are
 * R2 objects (SPEC.md §5 `photoKeys[]`).
 */

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

/** One photo in a room/branch carousel. Caption keeps mixed shots honest. */
export interface Photo {
  src: string; // mock: path in /public/mock — prod: R2 key
  caption?: string;
}

export interface RoomType {
  id: string;
  name: string;
  occupancy: 1 | 2 | 3 | 4;
  bathType: BathType;
  pricePerSemester: number; // GHS
  availableCount: number;
  accepting: boolean;
  amenities: Amenity[];
  photos: Photo[]; // ordered, first = cover
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
  bookingFee: number; // GHS
  aboutCopy: string[]; // paragraphs, owner's voice
  heroImages: string[]; // ordered, first = cover (hero crossfade / framing)
  gallery: { src: string; caption: string }[];
  testimonials: Testimonial[];
  faqs: { question: string; answer: string }[]; // org-wide
  houseRules: { title: string; detail: string }[]; // org-wide (branch overrides later, on real demand)
  directions: string;
  mapQuery: string; // for a maps link
  status: "draft" | "live" | "paused";
}

/**
 * Aseda Heights Hostel — fictional but realistic KNUST-area hostel.
 * Prices are mid-range realistic GHS per semester (SPEC.md §8.4).
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
  whatsappNumber: "233550000000", // DEMO — the org line; branches can override with their caretaker's (SPEC.md §5)
  momoName: "Aseda Heights",
  momoNumber: "055 000 0000",
  bookingFee: 300,
  aboutCopy: [
    "We have run this house for eleven years, and most of our students come because someone who stayed here before told them about it. The rooms are clean, the corridors are quiet at night, and the plant comes on the moment the lights go — your fan and your phone charger will never know there was a blackout.",
    "Water is never a discussion here. The polytanks are filled twice a week and the borehole is there when the taps rest. There is a guard at the gate all night, cameras on both floors, and a study room that stays open past midnight during exams.",
    "Walk out of the main gate, take the road behind the mosque, and we are the cream building on your right — about eight minutes on foot. Come and see the room before you decide. We prefer it that way.",
  ],
  heroImages: ["/mock/exterior.jpg", "/mock/common-room.jpg", "/mock/corridor.jpg"],
  gallery: [
    { src: "/mock/corridor.jpg", caption: "Ground floor corridor" },
    { src: "/mock/common-room.jpg", caption: "The common room" },
    { src: "/mock/kitchen.jpg", caption: "Shared kitchen" },
    { src: "/mock/study-room.jpg", caption: "Study room, open till midnight" },
  ],
  testimonials: [
    {
      name: "Nana Adwoa",
      detail: "Level 300, Civil Engineering",
      quote:
        "I came because of the plant, honestly. Two semesters and my reading has never stopped for dumsor. Madam is also always reachable — things get fixed the same week you report them.",
    },
    {
      name: "Kwesi Frimpong",
      detail: "Level 200, Computer Science",
      quote:
        "The study room saved me during exam season. And it's genuinely eight minutes to the gate — I've timed it, even walking slow.",
    },
    {
      name: "Zainab Mohammed",
      detail: "Level 400, Pharmacy",
      quote:
        "Four of us shared a 4-in-1 for two years. Water never finished, security is serious, and the kitchen is big enough that it never gets crowded in the morning.",
    },
  ],
  faqs: [
    {
      question: "Is the booking fee part of the rent?",
      answer:
        "Yes — the fee comes off your first semester payment. It just holds the room so nobody else takes it.",
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
  directions:
    "From the KNUST main gate, take the road behind the mosque. We're the cream-coloured building on the right, about eight minutes on foot. Look for the blue 'Aseda Heights' sign at the gate.",
  mapQuery: "KNUST Main Gate, Kumasi",
  status: "live",
};

/** The single implicit branch for unit mode (SPEC.md §5). */
export const mainLocation: Branch = {
  id: "aseda-main",
  slug: "main",
  name: "Aseda Heights — Main Building",
  directionsNote: "Behind the mosque, 8 min walk from the main gate",
  photos: [
    { src: "/mock/exterior.jpg", caption: "The main building, from the street" },
    { src: "/mock/corridor.jpg", caption: "Ground floor corridor" },
    { src: "/mock/common-room.jpg", caption: "The common room" },
  ],
  rooms: [
    {
      id: "room-4in1",
      name: "4-in-1",
      occupancy: 4,
      bathType: "shared",
      pricePerSemester: 1900,
      availableCount: 6,
      accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "kitchen"],
      photos: [
        { src: "/mock/room-4in1.jpg", caption: "The 4-in-1 room" },
        { src: "/mock/kitchen.jpg", caption: "The shared kitchen" },
        { src: "/mock/common-room.jpg", caption: "The common room" },
      ],
      blurb:
        "Our most popular room. Four beds, big windows on both sides, shared bath on the corridor — never a queue in the morning.",
      sortOrder: 1,
    },
    {
      id: "room-2in1",
      name: "2-in-1",
      occupancy: 2,
      bathType: "shared",
      pricePerSemester: 3400,
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
      photos: [
        { src: "/mock/room-2in1.jpg", caption: "The 2-in-1 room" },
        { src: "/mock/study-room.jpg", caption: "The study room — open till midnight" },
        { src: "/mock/corridor.jpg", caption: "The corridor" },
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
      pricePerSemester: 5200,
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
      photos: [
        { src: "/mock/room-1in1.jpg", caption: "The 1-in-1 ensuite" },
        { src: "/mock/corridor.jpg", caption: "The corridor" },
        { src: "/mock/common-room.jpg", caption: "The common room" },
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
  whatsappNumber: "233550000002", // DEMO — the Annex caretaker's own line
  walkToCampus: "12 min",
  photos: [
    { src: "/mock/annex.jpg", caption: "The Annex, from the street" },
    { src: "/mock/kitchen.jpg", caption: "The shared kitchen" },
    { src: "/mock/study-room.jpg", caption: "The study room" },
  ],
  rooms: [
    {
      id: "annex-4in1",
      name: "4-in-1",
      occupancy: 4,
      bathType: "shared",
      pricePerSemester: 1750,
      availableCount: 4,
      accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "kitchen"],
      photos: [
        { src: "/mock/room-4in1.jpg", caption: "The 4-in-1 room" },
        { src: "/mock/annex.jpg", caption: "The Annex building" },
        { src: "/mock/kitchen.jpg", caption: "The shared kitchen" },
      ],
      blurb:
        "The budget option at the Annex — same management, same standards, a few minutes further from the gate.",
      sortOrder: 1,
    },
    {
      id: "annex-2in1",
      name: "2-in-1",
      occupancy: 2,
      bathType: "shared",
      pricePerSemester: 3100,
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
      photos: [
        { src: "/mock/room-2in1.jpg", caption: "The 2-in-1 room" },
        { src: "/mock/study-room.jpg", caption: "The study room" },
        { src: "/mock/annex.jpg", caption: "The Annex building" },
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

/**
 * Deployment-level hostel selection (SPEC.md §6.1): in production each
 * Vercel project sets HOSTEL_SLUG; dev defaults to the demo hostel.
 * Mock-data stand-in for the future Convex `getHostel` query.
 */
export function getHostel(): Hostel {
  const slug = process.env.HOSTEL_SLUG ?? asedaHeights.slug;
  if (slug !== asedaHeights.slug) {
    throw new Error(`No hostel found for HOSTEL_SLUG=${slug}`);
  }
  return asedaHeights;
}

export function getBranches(): Branch[] {
  return branches;
}

/** Open rooms across a branch — accepting rooms' available counts, summed. */
export function openRooms(branch: Branch): number {
  return branch.rooms.reduce((n, r) => n + (r.accepting ? r.availableCount : 0), 0);
}

/** Lowest semester price across a set of rooms — the "from" figure. */
export function minFrom(rooms: RoomType[]): number {
  return Math.min(...rooms.map((r) => r.pricePerSemester));
}

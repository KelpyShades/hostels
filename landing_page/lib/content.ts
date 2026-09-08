/**
 * Central UI copy (labels, headings, buttons, helpers, errors) —
 * every user-facing string in the chrome lives here so switching or
 * changing them never means hunting through components.
 *
 * Split of concerns:
 *   - content.ts  → UI chrome strings (shared across hostels, themed per direction)
 *   - mock-hostel.ts → per-hostel data (names, prices, copy in the owner's voice,
 *     testimonials, directions) — later these become Convex rows.
 */

import type { Amenity } from "./mock-hostel";

export const content = {
  hero: {
    availableNow: "Rooms available now",
    currentlyFull: "Currently full — ask about next semester",
    roomsFrom: "Rooms from",
    kicker: "Student rooms in",
    /** Facts bar at the base of the hero — figure + label pairs. */
    facts: {
      fromLabel: "Rooms from",
      fromEmpty: "Ask us",
      walkLabel: "To the main gate",
      openLabel: "Open now",
      onFoot: "on foot",
      feeNote: "holds your room",
    },
  },

  sections: {
    rooms: "Rooms & rates",
    perYear: "per academic year",
    amenities: "The practical things",
    guide: "How to book",
    rules: "House rules",
    goodToKnow: "Good to know",
    questions: "Questions people ask",
    location: "Finding us",
    inquire: "Ask about a room",
  },

  /** Nav labels (chrome — kept short; section titles can run longer). */
  nav: {
    rooms: "Rooms",
    location: "Finding us",
    locations: "Locations",
    practical: "The practical things",
    allLocations: "All locations",
  },

  /** Assurance ledger + registration guide live in the per-hostel seed
   *  (lib/mock-hostel.ts Hostel.ledger / Hostel.guide) — different hostels
   *  make different claims and book differently; the chrome stays shared. */

  location: {
    openInMaps: "Open in Google Maps",
    walkNote: "on foot, to the main gate",
  },

  closing: {
    line: "Come and see the room before you decide.",
    sub: "Rooms fill quickly once admissions open. Send an inquiry or arrange a visit on WhatsApp.",
  },

  /** Guide chrome — the steps themselves are per-hostel (Hostel.guide). */
  guide: {
    beforeYouStart: "Before you start",
    theProcess: "The process",
  },

  rooms: {
    roomLeft: "1 room left",
    roomsLeft: "rooms left",
    waitingList: "Full — waiting list",
    waitListShort: "Waiting list",
    joinWaitlist: "Join the waiting list",
    askAboutRoom: "Ask about this room",
    checkAvailability: "Check availability",
    chatAboutRoom: "Chat about this room",
    ensuite: "ensuite",
    sharedBath: "shared bath",
    sleeps: "Sleeps",
    /** Occupancy categories (grouped rooms, e.g. Franco's variant tiers). */
    categories: {
      1: "One in a room",
      2: "Two in a room",
      3: "Three in a room",
      4: "Four in a room",
    } satisfies Record<1 | 2 | 3 | 4, string>,
    from: "from",
    /** "3 options" — variants under one category. */
    optionCount: (n: number) => (n === 1 ? "1 option" : `${n} options`),
    chatAboutThese: "Chat about these rooms",
    /** Variant tile title — the part after " — " in a seeded room name
     *  ("2 in a room — Old block (No TV)" → "Old block (No TV)"). */
    variantLabel: (name: string) => {
      const parts = name.split(" — ");
      return parts.length > 1 ? (parts.slice(1).join(" — ")) : name;
    },
  },

  /** The dedicated inquiry page (shareable link — unit: /inquire,
   *  branch: /b/[slug]/inquire, org-level picker: /inquire on multi). */
  inquirePage: {
    backToRooms: "Back to rooms & rates",
    branchQuestion: "Which location are you asking about?",
    branchHint: "Your message goes to that location's caretaker on WhatsApp.",
    askingAt: "Asking at",
    changeLocation: "Change",
  },

  rateCard: {
    title: "Rates at a glance",
    room: "Room",
    sleeps: "Sleeps",
    bath: "Bath",
    price: "Per academic year",
    availability: "Availability",
    waitlist: "Waitlist",
  },

  properties: {
    eyebrow: "Our properties",
    heading: "Choose your location",
    viewRooms: "View rooms & rates",
    from: "from",
    perYear: "per academic year",
    roomsOpen: "rooms open",
    fullyBooked: "Fully booked",
    waitlistOpen: "waitlist open",
    switcherLabel: "Properties",
    compareTitle: "At a glance",
    walkToCampus: "Walk to campus",
    fromPrice: "From",
  },

  sticky: {
    check: "Check availability",
    chat: "Chat on WhatsApp",
  },

  form: {
    name: "Your name",
    namePlaceholder: "e.g. Ama Mensah",
    phone: "Phone / WhatsApp",
    phonePlaceholder: "05X XXX XXXX",
    email: "Email",
    emailPlaceholder: "you@example.com — your booking confirmation goes here",
    guardianName: "Guardian's name",
    guardianNamePlaceholder: "e.g. Mr. Kwame Mensah",
    guardianPhone: "Guardian's phone",
    course: "Course / programme",
    coursePlaceholder: "e.g. BSc. Computer Science",
    level: "Level",
    levelOptions: ["Level 100", "Level 200", "Level 300", "Level 400", "Postgraduate"],
    academicYear: "Academic year",
    roomType: "Room type",
    chooseRoom: "Choose a room…",
    moveIn: "Move-in",
    anythingElse: "Anything else?",
    optional: "(optional)",
    messagePlaceholder: "e.g. I'd like to visit this Saturday",
    submit: "Send on WhatsApp",
    helper: "Opens WhatsApp with your details already typed — you just press send. Your confirmation arrives by email.",
    sentHelper: "WhatsApp should have opened — just press send there and we'll reply. Your reference and confirmation are on their way to your email.",
    errors: {
      name: "Please enter your name",
      phoneShort: "Enter a phone number we can reach you on",
      phoneLong: "That number looks too long",
      emailRequired: "Enter your email — your booking confirmation goes there",
      emailInvalid: "That email address doesn't look right",
      guardianName: "Enter your guardian's name",
      course: "Enter your course or programme",
      level: "Choose your level",
      room: "Choose a room type",
      moveIn: "Choose the academic year",
      messageLong: "Keep it short — details can come on WhatsApp",
    },
  },

  booking: {
    feeLabel: "Booking fee",
    holdsRoom: "It holds your room and comes off your first payment.",
    payVia: "Pay via MoMo",
  },

  chat: {
    floatingAction: "Chat on WhatsApp",
    generalGreeting: "Hello, I'd like to ask about rooms at your hostel.",
    /** With room context (lib/wa.ts passes the branch's rooms): names the
     *  categories from the UI — "your 4 in 1, 2 in 1 and 1 in 1 rooms". */
    generalGreetingRooms: "Hello, I'd like to ask about your {categories} rooms. What's still available?",
    roomGreeting: "Hello, I'm interested in the {room} at {hostel}. Is it still available?",
    /** Pre-filled WhatsApp inquiry message (FR-A8) — {tokens} replaced in lib/wa.ts.
     *  The reference line lets the manager match the chat to the inbox row. */
    inquiryMessage: [
      "Hello, I found {hostel} online.",
      "",
      "Name: {name}",
      "Phone: {phone}",
      "Guardian: {guardian} — {guardianPhone}",
      "Programme: {course}, {level}",
      "Room wanted: {room}",
      "Academic year: {moveIn}",
      "{ref}",
      "{note}",
      "",
      "Please let me know if it's available. Thank you!",
    ],
    notePrefix: "Note:",
  },

  notFound: {
    eyebrow: "Wrong turn",
    title: "This hostel isn't here.",
    body: "The page you're looking for isn't here. The link may be mistyped.",
    backHome: "Back to the hostel",
  },

  amenityLabels: {
    "power-backup": "24/7 power backup",
    "water-storage": "Reliable water",
    wifi: "Wi-Fi",
    security: "Night security",
    cctv: "CCTV",
    kitchen: "Shared kitchen",
    "study-room": "Study room",
    ac: "Air conditioning",
  } satisfies Record<Amenity, string>,

  /** Chosen-skin copy (the merged “Quiet Glass” design won — 2026-09-06). */
  cta: "Check availability",
  inquiryIntro:
    "Fill this in and WhatsApp opens with everything typed — the room you want, when you're moving in. You just press send.",
} as const;

export type Content = typeof content;

/** The academic years the form offers, next one first (FR-A8):
 *  the Ghanaian AY runs ~Sept–May, so Jan–May is (year-1)/year and from
 *  June the "next" AY is year/(year+1) — the one admissions open for.
 *  E.g. June 2026 → ["2026/2027", "2027/2028"]. */
export function academicYears(count = 2): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const start = now.getMonth() + 1 >= 6 ? year : year - 1;
  return Array.from({ length: count }, (_, i) => `${start + i}/${start + i + 1}`);
}

/** Availability phrase for a room — "2 rooms left" / "1 room left" / "Full — waiting list". */
export function availabilityLabel(
  room: { accepting: boolean; availableCount: number },
  waitingListText: string = content.rooms.waitingList,
): string {
  if (!room.accepting) return waitingListText;
  return room.availableCount === 1
    ? content.rooms.roomLeft
    : `${room.availableCount} ${content.rooms.roomsLeft}`;
}

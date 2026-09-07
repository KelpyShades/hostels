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
      walkLabel: "To the main gate",
      openLabel: "Open now",
      onFoot: "on foot",
      feeNote: "holds your room",
    },
  },

  sections: {
    rooms: "Rooms & rates",
    perSemester: "per semester",
    gallery: "Around the house",
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
    gallery: "Gallery",
    location: "Finding us",
    locations: "Locations",
    practical: "The practical things",
    allLocations: "All locations",
  },

  /** Assurance ledger — the dark "practical things" band. Per-hostel
   *  curation derived from the owner's aboutCopy; the figures are the
   *  design, the bodies are the owner's own claims. */
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

  location: {
    openInMaps: "Open in Google Maps",
    walkNote: "on foot, to the main gate",
  },

  /** Registration-guide section (adapted from the TYB reference site —
   *  org-wide: the process is the same across branches; only the WhatsApp
   *  contact and open rooms differ per branch). */
  guide: {
    beforeYouStart: "Before you start",
    whatYouNeed: [
      "Your WhatsApp number",
      "Your student ID number and programme",
      "Your move-in semester",
      "A way to pay the booking fee (MoMo)",
    ],
    theProcess: "The process",
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
        body: "Pay the booking fee via MoMo and the room is held for you. It comes off your first semester payment.",
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

  closing: {
    line: "Come and see the room before you decide.",
    sub: "Rooms fill quickly once admissions open. Send an inquiry or arrange a visit on WhatsApp.",
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
  },

  rateCard: {
    title: "Rates at a glance",
    room: "Room",
    sleeps: "Sleeps",
    bath: "Bath",
    price: "Per semester",
    availability: "Availability",
    waitlist: "Waitlist",
  },

  properties: {
    eyebrow: "Our properties",
    heading: "Choose your location",
    viewRooms: "View rooms & rates",
    from: "from",
    perSemester: "per semester",
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
    roomType: "Room type",
    chooseRoom: "Choose a room…",
    moveIn: "Move-in",
    whichSemester: "Which semester?",
    anythingElse: "Anything else?",
    optional: "(optional)",
    messagePlaceholder: "e.g. I'd like to visit this Saturday",
    submit: "Send on WhatsApp",
    helper: "Opens WhatsApp with your details already typed — you just press send.",
    sentHelper: "WhatsApp should have opened — just press send there and we'll reply.",
    errors: {
      name: "Please enter your name",
      phoneShort: "Enter a phone number we can reach you on",
      phoneLong: "That number looks too long",
      room: "Choose a room type",
      moveIn: "Choose a semester",
      messageLong: "Keep it short — details can come on WhatsApp",
    },
  },

  booking: {
    feeLabel: "Booking fee",
    holdsRoom: "It holds your room and comes off your first semester payment.",
    payVia: "Pay via MoMo",
  },

  chat: {
    floatingAction: "Chat on WhatsApp",
    generalGreeting: "Hello, I'd like to ask about rooms at your hostel.",
    roomGreeting: "Hello, I'm interested in the {room} room at {hostel}. Is it still available?",
    /** Pre-filled WhatsApp inquiry message (FR-A8) — {tokens} replaced in lib/wa.ts */
    inquiryMessage: [
      "Hello, I found {hostel} online.",
      "",
      "Name: {name}",
      "Phone: {phone}",
      "Room wanted: {room}",
      "Move-in: {moveIn}",
      "{note}",
      "",
      "Please let me know if it's available. Thank you!",
    ],
    notePrefix: "Note:",
    semesters: ["September 2026 semester", "January 2027 semester"],
  },

  gallery: {
    heroCaption: "The main building, from the street.",
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

import type { Branch, Hostel } from "./mock-hostel";
import { img } from "../assets/images";

/**
 * Franco Hostel — the FIRST REAL CLIENT's static shell (preview build,
 * 2026-09-07). Sunyani–Fiapre, serving University of Energy and Natural
 * Resources students, a 20-minute walk from campus. Four branches: Main,
 * Annex 1, Annex 2, Annex 3.
 *
 * THE ROOM CATALOG LIVES IN CONVEX, not here: names, prices, variants,
 * blurbs — everything under §5 `rooms` — is seeded once (convex/seed.ts,
 * `npx convex run seed:seedFrancoHostel`) and then owned by the manager
 * via the dashboard. This file carries only org-level presentation:
 * about copy, ledger, guide, FAQs, photos, payment note. If Convex is
 * unreachable the branches render with no rooms — by design; live data
 * is the source of truth.
 * Facts confirmed by Kelvin (2026-09-07):
 * - Every room has its own bathroom, shared inside the room for 4-in-1
 *   and 2-in-1; private for 1-in-1. Kitchen is shared.
 * - Wi-Fi on for everyone. Security all night. NO plant (no generator),
 *   NO study room — we never claim what they don't have.
 * - Room categories carry price variants: both the 2-in-1s and the 1-in-1s
 *   come in old block vs new block; the 2-in-1s further split without/with
 *   TV (6,000/6,200 old, 7,000/7,200 new; singles 9,200 old, 10,500 new).
 *   Prices per academic year — see convex/seed.ts. All branches mirror
 *   Main (confirmed).
 * - Campus is a 20-minute WALK from Fiapre.
 * - Their flow: student visits → pays → sends the MoMo receipt to the
 *   manager → manager confirms → student gets a room code. Our step-up:
 *   the code is issued by the dashboard and confirmed by email.
 */

export const francoHostel: Hostel = {
  id: "franco-hostel",
  slug: "franco-hostel",
  name: "Franco Hostel",
  mode: "multi",
  tagline: "A calm, secure home in Fiapre, Sunyani — twenty minutes from UENR.",
  area: "Fiapre, Sunyani — UENR",
  city: "Sunyani",
  walkToCampus: "20 min",
  whatsappNumber: "233270088802", // DEMO — replace with the manager's real line
  momoName: "Franco Hostel",
  momoNumber: "027 008 8802", // DEMO — replace with the real MoMo details
  bookingFee: undefined, // No fixed booking fee — payment note explains their flow
  paymentNote:
    "No booking fee. Pay for your room by MoMo, send the receipt to the manager on WhatsApp, and you'll receive your room code once it's confirmed.",
  aboutCopy: [
    "Franco Hostel has been housing UENR students in Fiapre for years. Four buildings — the Main and three annexes — same management, same standards. Every room has its own bathroom inside; you share it with your roommates only, and if you take a single room, it's yours alone.",
    "Wi-Fi is on for everyone, there's a shared kitchen in each building, and a security man is awake all night. Come and see the room before you pay — most of our students heard about us from someone who stayed here.",
    "We are a twenty-minute walk from the UENR campus, here in Fiapre, Sunyani. Come any day, walk the rooms, and pick the one that fits your pocket.",
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
      question: "Does every room have its own bathroom?",
      answer: "Yes — the bathroom is inside the room. You share it with your roommates only, and single rooms have it to themselves.",
    },
    {
      question: "Is there a booking fee?",
      answer:
        "No. You pay for the room, send your MoMo receipt to the manager, and you receive a room code once it's confirmed.",
    },
    {
      question: "Can I see the room before paying?",
      answer: "Please do — we prefer it. Chat with us on WhatsApp and arrange a visit any day.",
    },
    {
      question: "How far is the campus?",
      answer: "A twenty-minute walk from the UENR campus, here in Fiapre, Sunyani.",
    },
    {
      question: "What about light and water?",
      answer: "Water runs in the rooms. We don't run a plant, so keep a small lamp or power bank for blackout nights — everyone in Fiapre knows the dumsor calendar.",
    },
  ],
  houseRules: [
    { title: "Quiet hours", detail: "10pm to 6am — exams or not, everyone sleeps." },
    { title: "Visitors", detail: "Welcome during the day; they leave by 10pm." },
    { title: "Cooking", detail: "In the shared kitchen, not in the rooms." },
    { title: "Payments", detail: "Pay by MoMo, keep your receipt — it's your proof." },
    { title: "Reporting faults", detail: "Tell the manager the same day; things get fixed fast." },
  ],
  directions:
    "We're in Fiapre, Sunyani — a twenty-minute walk from the UENR campus. Ask any trotro mate for 'Franco Hostel, Fiapre'; the Main building is the one with the sign. The annexes are a short walk from it.",
  mapQuery: "Fiapre, Sunyani, Ghana",
  status: "live",
  ledger: {
    intro: "What we keep plain and true, every semester, in all four buildings.",
    items: [
      {
        figure: "All night",
        title: "Security",
        body: "A security man is awake from dusk to dawn in every building. Your room, your things, your people are watched.",
      },
      {
        figure: "Every room",
        title: "Own bathroom",
        body: "The bathroom is inside the room — shared with your roommates only. Single rooms have it completely to themselves.",
      },
      {
        figure: "Free",
        title: "Wi-Fi",
        body: "On for everyone, all buildings. Stream your lectures, do your assignments, call home.",
      },
      {
        figure: "Shared",
        title: "Kitchen",
        body: "A shared kitchen in each building, big enough for the morning rush.",
      },
    ],
    also: "Also throughout the house: running water in the rooms, and a manager who answers WhatsApp.",
  },
  guide: {
    whatYouNeed: [
      "Your WhatsApp number",
      "Your student ID number and programme",
      "Your move-in semester",
      "MoMo, to pay for your room",
    ],
    steps: [
      {
        title: "Look around",
        body: "Check the rooms and prices here, then come and see the room in person — we prefer it that way.",
      },
      {
        title: "Ask",
        body: "Send an inquiry or chat with the manager on WhatsApp. We'll tell you what's open and hold nothing back.",
      },
      {
        title: "Pay",
        body: "Pay for your room by MoMo. The details are on this page — keep your receipt.",
      },
      {
        title: "Send your receipt",
        body: "Send the receipt to the manager on WhatsApp. Once it's confirmed, you get your room code — by email too, if you leave your address.",
      },
      {
        title: "Move in",
        body: "Come with your code on your agreed date. If anything needs fixing, the manager is around.",
      },
    ],
  },
};

/** Branch shells — identity, photos, directions, the caretaker's own
 *  WhatsApp line. The room catalog (names, prices, variants, blurbs)
 *  lives in Convex (convex/seed.ts) and is owned by the manager from
 *  there on. Each branch carries its own WhatsApp number: the branch's
 *  line wins for chats and inquiries on its pages (SPEC.md §5), falling
 *  back to the org line. */
export const francoMain: Branch = {
  id: "franco-main",
  slug: "main",
  name: "Main",
  directionsNote: "Fiapre, Sunyani — a 20-minute walk from the UENR campus",
  whatsappNumber: "233550000010", // TODO(client): the Main caretaker's real line
  photos: [{ src: img.exterior.src, caption: "The Main building" }],
  rooms: [],
};

function annexBranch(n: 1 | 2 | 3): Branch {
  return {
    id: `franco-annex-${n}`,
    slug: `annex-${n}`,
    name: `Annex ${n}`,
    directionsNote: "Fiapre, Sunyani — a short walk from the Main building",
    whatsappNumber: `23355000001${n}`, // TODO(client): this annex caretaker's real line
    photos: [{ src: img.annex.src, caption: `Annex ${n}` }],
    rooms: [],
  };
}

export const francoBranches: Branch[] = [
  francoMain,
  annexBranch(1),
  annexBranch(2),
  annexBranch(3),
];

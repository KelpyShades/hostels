import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const hostelMode = v.union(v.literal("unit"), v.literal("multi"));
const hostelStatus = v.union(v.literal("draft"), v.literal("live"), v.literal("paused"));
const bathType = v.union(v.literal("ensuite"), v.literal("shared"));
const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("booked"),
);
const inquirySource = v.union(v.literal("wa"), v.literal("form"));
const changedBy = v.union(v.literal("owner"), v.literal("internal"));

// Everything the public site renders as static content — tagline, about copy,
// photos, testimonials, theme, MoMo details, SEO, directions — is hardcoded
// per client in the site's strings file, not stored here. The database holds
// only what must be live (rooms, prices, availability) or manager-run
// (branches, enquiries) plus the small business fields we oversee.
export default defineSchema({
  hostels: defineTable({
    name: v.string(),
    mode: hostelMode,
    status: hostelStatus,
    // Ours, not the manager's: business data for the internal tool.
    renewalDate: v.optional(v.string()),
    // Room-code prefix, seeded per client (e.g. "FRANCO") — codes read
    // FRANCO-2026-001, never a random string.
    codePrefix: v.optional(v.string()),
    // Where student email replies land — PER HOSTEL (the manager's
    // address). All hostels share this deployment; a shared env var would
    // let one client override another's replies. Seeded per client.
    replyToEmail: v.optional(v.string()),
    // Monotonic count of bookings ever issued — the sequence in the code.
    // Lives on the hostel row so concurrent bookings serialize safely.
    bookingSeq: v.optional(v.number()),
    // Monotonic count of enquiries ever received — the sequence in the
    // inquiry reference (FRANCO-2026-E001), same serialization trick.
    inquirySeq: v.optional(v.number()),
  }).index("by_status", ["status"]),

  branches: defineTable({
    hostelId: v.id("hostels"),
    name: v.string(),
    directionsNote: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_hostel", ["hostelId"]),

  rooms: defineTable({
    branchId: v.id("branches"),
    hostelId: v.id("hostels"),
    name: v.string(),
    occupancy: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    bathType,
    pricePerYear: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
    amenities: v.optional(v.array(v.string())),
    // One-line description shown on the public site. Seeded with the room
    // (curated by us); NOT editable from the manager room form, so manager
    // edits never touch presentation copy.
    blurb: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_hostel", ["hostelId"])
    .index("by_branch", ["branchId"])
    .index("by_branch_and_sort", ["branchId", "sortOrder"]),

  inquiries: defineTable({
    branchId: v.id("branches"),
    hostelId: v.id("hostels"),
    name: v.string(),
    phone: v.string(),
    // Optional — set from the inquiry form; receipt + booking confirmation
    // emails go here (FR-A8). Email delivery is env-gated (convex/emails.ts).
    email: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    course: v.optional(v.string()),
    level: v.optional(v.string()),
    roomName: v.string(),
    moveInDate: v.string(),
    message: v.optional(v.string()),
    status: inquiryStatus,
    source: inquirySource,
    // Set once, the first time a manager marks the inquiry "booked": the
    // student's room code, delivered by email — the written confirmation
    // that replaces the manager's informal "I've given them a code".
    refCode: v.optional(v.string()),
    // Issued at submission (FRANCO-2026-E001): lets the manager match a
    // WhatsApp chat / email to the inbox row at a glance.
    inquiryRef: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_hostel", ["hostelId"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_refCode", ["refCode"]),

  roomChangeLog: defineTable({
    branchId: v.id("branches"),
    roomId: v.id("rooms"),
    field: v.union(
      v.literal("created"),
      v.literal("deleted"),
      v.literal("name"),
      v.literal("occupancy"),
      v.literal("bathType"),
      v.literal("amenities"),
      v.literal("pricePerYear"),
      v.literal("availableCount"),
      v.literal("accepting"),
    ),
    oldValue: v.string(),
    newValue: v.string(),
    changedBy,
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_branch", ["branchId"])
    .index("by_created", ["createdAt"]),
});

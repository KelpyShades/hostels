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
const assetKind = v.union(v.literal("hero"), v.literal("gallery"), v.literal("room"));

export default defineSchema({
  hostels: defineTable({
    // Identity — the only fields needed to draft a hostel row.
    name: v.string(),
    mode: hostelMode,
    status: hostelStatus,
    // Everything below is optional so a draft can be created in the Convex
    // dashboard with just name + mode + status, then filled in later.
    customDomain: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    momoName: v.optional(v.string()),
    momoNumber: v.optional(v.string()),
    bookingFee: v.optional(v.number()),
    tagline: v.optional(v.string()),
    aboutCopy: v.optional(v.string()),
    directions: v.optional(v.string()),
    mapQuery: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    renewalDate: v.optional(v.string()),
    theme: v.optional(
      v.object({
        background: v.string(),
        foreground: v.string(),
        accent: v.string(),
      }),
    ),
  }).index("by_status", ["status"]),

  branches: defineTable({
    hostelId: v.id("hostels"),
    name: v.string(),
    slug: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    directions: v.optional(v.string()),
    directionsNote: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_hostel", ["hostelId"]),

  rooms: defineTable({
    branchId: v.id("branches"),
    hostelId: v.id("hostels"),
    name: v.string(),
    occupancy: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    bathType,
    pricePerSemester: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
    amenities: v.optional(v.array(v.string())),
    photoKey: v.optional(v.string()),
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
    roomName: v.string(),
    moveInDate: v.string(),
    message: v.optional(v.string()),
    status: inquiryStatus,
    source: inquirySource,
    createdAt: v.number(),
  })
    .index("by_hostel", ["hostelId"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  roomChangeLog: defineTable({
    branchId: v.id("branches"),
    roomId: v.id("rooms"),
    field: v.union(
      v.literal("pricePerSemester"),
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

  assets: defineTable({
    hostelId: v.id("hostels"),
    branchId: v.optional(v.id("branches")),
    roomId: v.optional(v.id("rooms")),
    key: v.string(),
    kind: assetKind,
    caption: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_hostel", ["hostelId"])
    .index("by_branch", ["branchId"])
    .index("by_room", ["roomId"]),
});

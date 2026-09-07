import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { env } from "./_generated/server";

const operatorKey = v.string();

function requireOperator(providedKey: string) {
  if (!env.OPERATOR_KEY || providedKey !== env.OPERATOR_KEY) {
    throw new Error("Invalid operator key");
  }
}

const roomValidator = v.object({
  _id: v.id("rooms"),
  _creationTime: v.number(),
  branchId: v.id("branches"),
  hostelId: v.id("hostels"),
  name: v.string(),
  occupancy: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
  bathType: v.union(v.literal("ensuite"), v.literal("shared")),
  pricePerSemester: v.number(),
  availableCount: v.number(),
  accepting: v.boolean(),
  amenities: v.array(v.string()),
  photoKey: v.optional(v.string()),
  sortOrder: v.number(),
});

const hostelValidator = v.object({
  _id: v.id("hostels"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  customDomain: v.optional(v.string()),
  mode: v.union(v.literal("unit"), v.literal("multi")),
  whatsappNumber: v.string(),
  momoName: v.string(),
  momoNumber: v.string(),
  bookingFee: v.number(),
  tagline: v.string(),
  aboutCopy: v.string(),
  directions: v.string(),
  mapQuery: v.string(),
  status: v.union(v.literal("draft"), v.literal("live"), v.literal("paused")),
  seoTitle: v.string(),
  seoDescription: v.string(),
  renewalDate: v.optional(v.string()),
  theme: v.object({
    background: v.string(),
    foreground: v.string(),
    accent: v.string(),
  }),
});

const inquiryValidator = v.object({
  _id: v.id("inquiries"),
  _creationTime: v.number(),
  branchId: v.id("branches"),
  hostelId: v.id("hostels"),
  name: v.string(),
  phone: v.string(),
  roomName: v.string(),
  moveInDate: v.string(),
  message: v.optional(v.string()),
  status: v.union(v.literal("new"), v.literal("contacted"), v.literal("booked")),
  source: v.union(v.literal("wa"), v.literal("form")),
  createdAt: v.number(),
});

export const overview = query({
  args: { operatorKey },
  returns: v.object({
    hostels: v.array(hostelValidator),
    rooms: v.array(roomValidator),
    inquiries: v.array(inquiryValidator),
  }),
  handler: async (ctx, args) => {
    requireOperator(args.operatorKey);
    const hostels = await ctx.db.query("hostels").withIndex("by_slug").take(100);
    const rooms = await ctx.db.query("rooms").withIndex("by_hostel").take(500);
    const inquiries = await ctx.db.query("inquiries").withIndex("by_created").order("desc").take(100);
    return { hostels, rooms, inquiries };
  },
});

export const updateRoom = mutation({
  args: {
    operatorKey,
    roomId: v.id("rooms"),
    pricePerSemester: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireOperator(args.operatorKey);
    if (!Number.isInteger(args.pricePerSemester) || args.pricePerSemester <= 0) {
      throw new Error("Price must be a positive integer");
    }
    if (!Number.isInteger(args.availableCount) || args.availableCount < 0) {
      throw new Error("Available count must be a non-negative integer");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const changes = [
      ["pricePerSemester", room.pricePerSemester, args.pricePerSemester],
      ["availableCount", room.availableCount, args.availableCount],
      ["accepting", room.accepting, args.accepting],
    ] as const;

    await ctx.db.patch(args.roomId, {
      pricePerSemester: args.pricePerSemester,
      availableCount: args.availableCount,
      accepting: args.accepting,
    });

    for (const [field, oldValue, newValue] of changes) {
      if (oldValue !== newValue) {
        await ctx.db.insert("roomChangeLog", {
          branchId: room.branchId,
          roomId: args.roomId,
          field,
          oldValue: String(oldValue),
          newValue: String(newValue),
          changedBy: "internal",
          createdAt: Date.now(),
        });
      }
    }
    return null;
  },
});

export const updateInquiryStatus = mutation({
  args: {
    operatorKey,
    inquiryId: v.id("inquiries"),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("booked")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireOperator(args.operatorKey);
    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry) throw new Error("Inquiry not found");
    await ctx.db.patch(args.inquiryId, { status: args.status });
    return null;
  },
});

export const seedDemo = mutation({
  args: { operatorKey },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireOperator(args.operatorKey);
    const existing = await ctx.db.query("hostels").withIndex("by_slug", (q) => q.eq("slug", "aseda-heights")).first();
    if (existing) return null;

    const hostelId = await ctx.db.insert("hostels", {
      name: "Aseda Heights Hostel",
      slug: "aseda-heights",
      mode: "multi",
      whatsappNumber: "233550000000",
      momoName: "Aseda Heights",
      momoNumber: "055 000 0000",
      bookingFee: 300,
      tagline: "A quiet, well-kept home eight minutes from the KNUST main gate.",
      aboutCopy: "We have run this house for eleven years. The rooms are clean, the plant comes on when the lights go, and water is never a discussion here.",
      directions: "Behind the mosque, eight minutes on foot from the main gate.",
      mapQuery: "KNUST Main Gate, Kumasi",
      status: "live",
      seoTitle: "Aseda Heights Hostel — KNUST, Kumasi",
      seoDescription: "Student rooms near KNUST with reliable power backup, water, and security.",
      renewalDate: "2027-09-01",
      theme: { background: "#f3f2ec", foreground: "#1f2420", accent: "#2e4b3b" },
    });

    const branchId = await ctx.db.insert("branches", {
      hostelId,
      name: "Main Building",
      slug: "main",
      directionsNote: "Behind the mosque, 8 min walk from the main gate",
      inboxToken: crypto.randomUUID(),
      sortOrder: 1,
    });

    await ctx.db.insert("rooms", {
      hostelId, branchId, name: "4-in-1", occupancy: 4, bathType: "shared",
      pricePerSemester: 1900, availableCount: 6, accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "kitchen"], sortOrder: 1,
    });
    await ctx.db.insert("rooms", {
      hostelId, branchId, name: "2-in-1", occupancy: 2, bathType: "shared",
      pricePerSemester: 3400, availableCount: 3, accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "study-room"], sortOrder: 2,
    });
    await ctx.db.insert("rooms", {
      hostelId, branchId, name: "1-in-1 Ensuite", occupancy: 1, bathType: "ensuite",
      pricePerSemester: 5200, availableCount: 2, accepting: true,
      amenities: ["power-backup", "water-storage", "wifi", "security", "ac"], sortOrder: 3,
    });
    return null;
  },
});

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const hostelIdArg = v.id("hostels");
const occupancyArg = v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4));
const bathTypeArg = v.union(v.literal("ensuite"), v.literal("shared"));
const amenitiesArg = v.array(v.string());
const inquiryStatusArg = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("booked"),
);

const hostelSummary = v.object({
  _id: v.id("hostels"),
  _creationTime: v.number(),
  name: v.string(),
  mode: v.union(v.literal("unit"), v.literal("multi")),
  status: v.union(v.literal("draft"), v.literal("live"), v.literal("paused")),
});

const branchSummary = v.object({
  _id: v.id("branches"),
  _creationTime: v.number(),
  hostelId: v.id("hostels"),
  name: v.string(),
  directionsNote: v.optional(v.string()),
  sortOrder: v.number(),
});

const roomValidator = v.object({
  _id: v.id("rooms"),
  _creationTime: v.number(),
  branchId: v.id("branches"),
  hostelId: v.id("hostels"),
  name: v.string(),
  occupancy: occupancyArg,
  bathType: bathTypeArg,
  pricePerYear: v.number(),
  availableCount: v.number(),
  accepting: v.boolean(),
  amenities: v.optional(v.array(v.string())),
  blurb: v.optional(v.string()),
  sortOrder: v.number(),
});

const inquiryValidator = v.object({
  _id: v.id("inquiries"),
  _creationTime: v.number(),
  branchId: v.id("branches"),
  hostelId: v.id("hostels"),
  name: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),
  guardianName: v.optional(v.string()),
  guardianPhone: v.optional(v.string()),
  course: v.optional(v.string()),
  level: v.optional(v.string()),
  roomName: v.string(),
  moveInDate: v.string(),
  message: v.optional(v.string()),
  status: inquiryStatusArg,
  source: v.union(v.literal("wa"), v.literal("form")),
  refCode: v.optional(v.string()),
  inquiryRef: v.optional(v.string()),
  createdAt: v.number(),
});

const managerData = v.object({
  hostel: hostelSummary,
  branches: v.array(branchSummary),
  rooms: v.array(roomValidator),
  inquiries: v.array(inquiryValidator),
});

type ManagerCtx = QueryCtx | MutationCtx;

type HostelScope = {
  hostel: Doc<"hostels">;
  branches: Doc<"branches">[];
};

type ChangeField =
  | "created"
  | "deleted"
  | "name"
  | "occupancy"
  | "bathType"
  | "amenities"
  | "pricePerYear"
  | "availableCount"
  | "accepting";

/**
 * Server-side sanitization for every free-text field a manager can save.
 * Control characters are stripped, whitespace collapsed, length capped.
 * Convex stores documents (never interpolates into queries), and these
 * caps keep hostile or accidental garbage out of the data either way.
 */
export function cleanText(input: string, maxLength: number): string {
  const stripped = Array.from(input)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("");
  return stripped.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function requireCleanName(input: string, maxLength = 80): string {
  const name = cleanText(input, maxLength);
  if (!name) throw new Error("Give this a name before saving.");
  return name;
}

function requirePrice(price: number): number {
  if (!Number.isInteger(price) || price <= 0 || price > 1_000_000) {
    throw new Error("Price must be a whole number of cedis, at least 1.");
  }
  return price;
}

function requireCount(count: number): number {
  if (!Number.isInteger(count) || count < 0 || count > 10_000) {
    throw new Error("Rooms available must be a whole number, zero or more.");
  }
  return count;
}

function cleanAmenities(amenities: string[]): string[] {
  const cleaned = amenities
    .map((value) => cleanText(value, 40))
    .filter(Boolean)
    .slice(0, 16);
  return [...new Set(cleaned)];
}

export async function resolveHostel(ctx: ManagerCtx, hostelId: Id<"hostels">): Promise<HostelScope | null> {
  const hostel = await ctx.db.get(hostelId);
  if (!hostel) return null;

  const branches = await ctx.db
    .query("branches")
    .withIndex("by_hostel", (q) => q.eq("hostelId", hostel._id))
    .take(100);

  return { hostel, branches };
}

export function canAccessBranch(scope: HostelScope, branchId: Id<"branches">) {
  return scope.branches.some((branch) => branch._id === branchId);
}

function publicHostel(hostel: Doc<"hostels">) {
  return {
    _id: hostel._id,
    _creationTime: hostel._creationTime,
    name: hostel.name,
    mode: hostel.mode,
    status: hostel.status,
  };
}

async function logChange(
  ctx: MutationCtx,
  args: {
    branchId: Id<"branches">;
    roomId: Id<"rooms">;
    field: ChangeField;
    oldValue: string;
    newValue: string;
  },
) {
  await ctx.db.insert("roomChangeLog", {
    ...args,
    changedBy: "owner",
    createdAt: Date.now(),
  });
}

export const get = query({
  args: {
    hostelId: hostelIdArg,
    // Branch scoping (FR-B6): set by a caretaker deployment (or the
    // owner's switcher) to see only one branch's rooms and inquiries.
    // View-level only — v1 has no auth; real enforcement ships with the
    // login tier.
    branchId: v.optional(v.id("branches")),
  },
  returns: v.union(managerData, v.null()),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) return null;

    let branches = scope.branches;
    if (args.branchId) {
      const scoped = scope.branches.find((b) => b._id === args.branchId);
      if (!scoped) return null; // branch outside this hostel
      branches = [scoped];
    }

    const branchIds = new Set(branches.map((b) => b._id));
    const rooms = (
      await ctx.db
        .query("rooms")
        .withIndex("by_hostel", (q) => q.eq("hostelId", scope.hostel._id))
        .take(300)
    ).filter((room) => branchIds.has(room.branchId));
    const inquiries = (
      await ctx.db
        .query("inquiries")
        .withIndex("by_hostel", (q) => q.eq("hostelId", scope.hostel._id))
        .order("desc")
        .take(300)
    ).filter((inquiry) => branchIds.has(inquiry.branchId));

    return {
      hostel: publicHostel(scope.hostel),
      branches: branches.map((branch) => ({
        _id: branch._id,
        _creationTime: branch._creationTime,
        hostelId: branch.hostelId,
        name: branch.name,
        directionsNote: branch.directionsNote,
        sortOrder: branch.sortOrder,
      })),
      rooms: rooms.map((room) => ({
        _id: room._id,
        _creationTime: room._creationTime,
        branchId: room.branchId,
        hostelId: room.hostelId,
        name: room.name,
        occupancy: room.occupancy,
        bathType: room.bathType,
        pricePerYear: room.pricePerYear,
        availableCount: room.availableCount,
        accepting: room.accepting,
        amenities: room.amenities,
        blurb: room.blurb,
        sortOrder: room.sortOrder,
      })),
      inquiries,
    };
  },
});

/**
 * Unit hostels keep exactly one implicit branch so rooms always have a home.
 * The dashboard calls this on load; it is idempotent and returns the branch.
 */
export const ensureSetup = mutation({
  args: { hostelId: hostelIdArg },
  returns: v.union(v.id("branches"), v.null()),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    if (scope.hostel.mode !== "unit") return null;

    const existing = [...scope.branches].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    if (existing) return existing._id;

    return await ctx.db.insert("branches", {
      hostelId: scope.hostel._id,
      name: "Main Building",
      sortOrder: 0,
    });
  },
});

/** Branch edits are deliberately narrow (FR-B6a): the branch STRUCTURE —
 *  name, existence, order, photos — is seeded by us (convex/seed.ts) and
 *  never manager-writable, because the branch name is the stable key the
 *  public site's curated shell matches on. The manager touches only the
 *  directions note; ALL imagery is bundled static assets curated at the
 *  annual refresh. */
export const updateBranch = mutation({
  args: {
    hostelId: hostelIdArg,
    branchId: v.id("branches"),
    directionsNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    const branch = await ctx.db.get(args.branchId);
    if (!branch || branch.hostelId !== scope.hostel._id || !canAccessBranch(scope, args.branchId)) {
      throw new Error("This branch is outside this hostel");
    }

    await ctx.db.patch(args.branchId, {
      ...(args.directionsNote !== undefined
        ? { directionsNote: cleanText(args.directionsNote, 160) }
        : {}),
    });
    return null;
  },
});

export const createRoom = mutation({
  args: {
    hostelId: hostelIdArg,
    branchId: v.id("branches"),
    name: v.string(),
    occupancy: occupancyArg,
    bathType: bathTypeArg,
    pricePerYear: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
    amenities: amenitiesArg,
  },
  returns: v.id("rooms"),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    if (!canAccessBranch(scope, args.branchId)) {
      throw new Error("This branch is outside this hostel");
    }

    const name = requireCleanName(args.name);
    requirePrice(args.pricePerYear);
    requireCount(args.availableCount);

    const last = await ctx.db
      .query("rooms")
      .withIndex("by_branch_and_sort", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .first();
    const sortOrder = (last?.sortOrder ?? -1) + 1;

    const roomId = await ctx.db.insert("rooms", {
      branchId: args.branchId,
      hostelId: scope.hostel._id,
      name,
      occupancy: args.occupancy,
      bathType: args.bathType,
      pricePerYear: args.pricePerYear,
      availableCount: args.availableCount,
      accepting: args.accepting,
      amenities: cleanAmenities(args.amenities),
      sortOrder,
    });

    await logChange(ctx, {
      branchId: args.branchId,
      roomId,
      field: "created",
      oldValue: "",
      newValue: name,
    });
    return roomId;
  },
});

export const updateRoom = mutation({
  args: {
    hostelId: hostelIdArg,
    roomId: v.id("rooms"),
    name: v.string(),
    occupancy: occupancyArg,
    bathType: bathTypeArg,
    pricePerYear: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
    amenities: amenitiesArg,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");

    const current = await ctx.db.get(args.roomId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This room is outside this hostel");
    }

    const name = requireCleanName(args.name);
    requirePrice(args.pricePerYear);
    requireCount(args.availableCount);
    const amenities = cleanAmenities(args.amenities);

    await ctx.db.patch(args.roomId, {
      name,
      occupancy: args.occupancy,
      bathType: args.bathType,
      pricePerYear: args.pricePerYear,
      availableCount: args.availableCount,
      accepting: args.accepting,
      amenities,
    });

    const oldAmenities = current.amenities ?? [];
    const changes: Array<[ChangeField, string, string]> = [
      ["name", current.name, name],
      ["occupancy", String(current.occupancy), String(args.occupancy)],
      ["bathType", current.bathType, args.bathType],
      ["amenities", JSON.stringify(oldAmenities), JSON.stringify(amenities)],
      ["pricePerYear", String(current.pricePerYear), String(args.pricePerYear)],
      ["availableCount", String(current.availableCount), String(args.availableCount)],
      ["accepting", String(current.accepting), String(args.accepting)],
    ];
    for (const [field, oldValue, newValue] of changes) {
      if (oldValue !== newValue) {
        await logChange(ctx, { branchId: current.branchId, roomId: args.roomId, field, oldValue, newValue });
      }
    }
    return null;
  },
});

export const deleteRoom = mutation({
  args: {
    hostelId: hostelIdArg,
    roomId: v.id("rooms"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");

    const current = await ctx.db.get(args.roomId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This room is outside this hostel");
    }

    await logChange(ctx, {
      branchId: current.branchId,
      roomId: args.roomId,
      field: "deleted",
      oldValue: current.name,
      newValue: "",
    });
    await ctx.db.delete(args.roomId);
    return null;
  },
});

export const updateInquiryStatus = mutation({
  args: {
    hostelId: hostelIdArg,
    inquiryId: v.id("inquiries"),
    status: inquiryStatusArg,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");

    const current = await ctx.db.get(args.inquiryId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This inquiry is outside this hostel");
    }

    // Marking "booked" for the first time issues the student's room code:
    // {PREFIX}-{YEAR}-{SEQ} — e.g. FRANCO-2026-001 — the hostel's seeded
    // prefix, the academic year they paid for (from the move-in semester),
    // and a monotonic per-hostel count. Deterministic: the same booking
    // always keeps its code; codes never collide; walk-in students get
    // sent the site link by the manager and book through the form.
    if (args.status === "booked" && !current.refCode) {
      const year = /\d{4}/.exec(current.moveInDate)?.[0] ?? String(new Date().getFullYear());
      const seq = (scope.hostel.bookingSeq ?? 0) + 1;
      const prefix = scope.hostel.codePrefix ?? "RM";
      const refCode = `${prefix}-${year}-${String(seq).padStart(3, "0")}`;
      // The hostel-doc patch (bookingSeq) serializes concurrent bookings:
      // a second booking that read the same counter conflicts and retries.
      await ctx.db.patch(scope.hostel._id, { bookingSeq: seq });
      await ctx.db.patch(args.inquiryId, { status: args.status, refCode });
      if (current.email) {
        await ctx.scheduler.runAfter(0, internal.emails.sendBookingConfirmation, {
          to: current.email,
          hostelName: scope.hostel.name,
          ...(scope.hostel.replyToEmail ? { replyTo: scope.hostel.replyToEmail } : {}),
          studentName: current.name,
          roomName: current.roomName,
          refCode,
        });
      }
      return null;
    }

    await ctx.db.patch(args.inquiryId, { status: args.status });
    return null;
  },
});

/** Delete one enquiry — a mistaken entry, a spam row, a booking that
 *  fell through. Codes already issued (FRANCO-2026-001) are never reused;
 *  the counter only moves forward. */
export const deleteInquiry = mutation({
  args: {
    hostelId: hostelIdArg,
    inquiryId: v.id("inquiries"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");

    const current = await ctx.db.get(args.inquiryId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This inquiry is outside this hostel");
    }

    await ctx.db.delete(args.inquiryId);
    return null;
  },
});

/** Clear the inbox — the end-of-campaign action ("everything is done,
 *  new academic year, fresh start"). Deletes every enquiry in scope: the
 *  branch's only (branch workspaces, caretaker locks) or the whole hostel
 *  (unit hostels, no branchId). Issued codes are never reused. */
export const clearInquiries = mutation({
  args: {
    hostelId: hostelIdArg,
    branchId: v.optional(v.id("branches")),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    if (args.branchId && !canAccessBranch(scope, args.branchId)) {
      throw new Error("This branch doesn't belong to this hostel");
    }

    const inquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_hostel", (q) => q.eq("hostelId", scope.hostel._id))
      .collect();
    const doomed = args.branchId
      ? inquiries.filter((inquiry) => inquiry.branchId === args.branchId)
      : inquiries;
    for (const inquiry of doomed) {
      await ctx.db.delete(inquiry._id);
    }
    return doomed.length;
  },
});

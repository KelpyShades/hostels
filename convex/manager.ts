import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const hostelIdArg = v.id("hostels");
const inquiryStatus = v.union(
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
  slug: v.optional(v.string()),
  directionsNote: v.optional(v.string()),
  sortOrder: v.number(),
});

const room = v.object({
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
  amenities: v.optional(v.array(v.string())),
  photoKey: v.optional(v.string()),
  sortOrder: v.number(),
});

const inquiry = v.object({
  _id: v.id("inquiries"),
  _creationTime: v.number(),
  branchId: v.id("branches"),
  hostelId: v.id("hostels"),
  name: v.string(),
  phone: v.string(),
  roomName: v.string(),
  moveInDate: v.string(),
  message: v.optional(v.string()),
  status: inquiryStatus,
  source: v.union(v.literal("wa"), v.literal("form")),
  createdAt: v.number(),
});

const managerData = v.object({
  hostel: hostelSummary,
  branches: v.array(branchSummary),
  rooms: v.array(room),
  inquiries: v.array(inquiry),
});

type ManagerCtx = QueryCtx | MutationCtx;

type HostelScope = {
  hostel: Doc<"hostels">;
  branches: Doc<"branches">[];
};

async function resolveHostel(ctx: ManagerCtx, hostelId: Id<"hostels">): Promise<HostelScope | null> {
  const hostel = await ctx.db.get(hostelId);
  if (!hostel) return null;

  const branches = await ctx.db
    .query("branches")
    .withIndex("by_hostel", (q) => q.eq("hostelId", hostel._id))
    .take(100);

  return { hostel, branches };
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

function publicBranch(branch: Doc<"branches">) {
  return {
    _id: branch._id,
    _creationTime: branch._creationTime,
    hostelId: branch.hostelId,
    name: branch.name,
    slug: branch.slug,
    directionsNote: branch.directionsNote,
    sortOrder: branch.sortOrder,
  };
}

function canAccessBranch(scope: HostelScope, branchId: Id<"branches">) {
  return scope.branches.some((branch) => branch._id === branchId);
}

export const get = query({
  args: { hostelId: hostelIdArg },
  returns: v.union(managerData, v.null()),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) return null;

    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_hostel", (q) => q.eq("hostelId", scope.hostel._id))
      .take(300);
    const inquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_hostel", (q) => q.eq("hostelId", scope.hostel._id))
      .order("desc")
      .take(300);

    return {
      hostel: publicHostel(scope.hostel),
      branches: scope.branches.map(publicBranch),
      rooms,
      inquiries,
    };
  },
});

export const updateRoom = mutation({
  args: {
    hostelId: hostelIdArg,
    roomId: v.id("rooms"),
    pricePerSemester: v.number(),
    availableCount: v.number(),
    accepting: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    if (!Number.isInteger(args.pricePerSemester) || args.pricePerSemester <= 0) {
      throw new Error("Price must be a positive integer");
    }
    if (!Number.isInteger(args.availableCount) || args.availableCount < 0) {
      throw new Error("Available count must be a non-negative integer");
    }

    const current = await ctx.db.get(args.roomId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This room is outside this hostel");
    }

    const changes = [
      ["pricePerSemester", current.pricePerSemester, args.pricePerSemester],
      ["availableCount", current.availableCount, args.availableCount],
      ["accepting", current.accepting, args.accepting],
    ] as const;

    await ctx.db.patch(args.roomId, {
      pricePerSemester: args.pricePerSemester,
      availableCount: args.availableCount,
      accepting: args.accepting,
    });

    for (const [field, oldValue, newValue] of changes) {
      if (oldValue !== newValue) {
        await ctx.db.insert("roomChangeLog", {
          branchId: current.branchId,
          roomId: args.roomId,
          field,
          oldValue: String(oldValue),
          newValue: String(newValue),
          changedBy: "owner",
          createdAt: Date.now(),
        });
      }
    }
    return null;
  },
});

export const updateInquiryStatus = mutation({
  args: {
    hostelId: hostelIdArg,
    inquiryId: v.id("inquiries"),
    status: inquiryStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");

    const current = await ctx.db.get(args.inquiryId);
    if (!current || current.hostelId !== scope.hostel._id || !canAccessBranch(scope, current.branchId)) {
      throw new Error("This inquiry is outside this hostel");
    }

    await ctx.db.patch(args.inquiryId, { status: args.status });
    return null;
  },
});

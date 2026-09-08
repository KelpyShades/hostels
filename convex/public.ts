import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { canAccessBranch, cleanText, resolveHostel } from "./manager";

/**
 * Public API for the hostel site (landing_page): everything a visitor
 * may see (SPEC.md §7.1). One query serves the live shell data — hostel
 * identity, branches, rooms with prices and availability — and one
 * mutation logs an inquiry before the WhatsApp redirect fires (FR-A8).
 *
 * The public site renders static copy (about, photos, testimonials) from
 * its own strings file; this API carries only what must be live.
 */

const hostelIdArg = v.id("hostels");

const publicHostel = v.object({
  _id: v.id("hostels"),
  name: v.string(),
  mode: v.union(v.literal("unit"), v.literal("multi")),
  status: v.union(v.literal("draft"), v.literal("live"), v.literal("paused")),
});

const publicBranch = v.object({
  _id: v.id("branches"),
  name: v.string(),
  directionsNote: v.optional(v.string()),
  sortOrder: v.number(),
});

const publicRoom = v.object({
  _id: v.id("rooms"),
  branchId: v.id("branches"),
  name: v.string(),
  occupancy: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
  bathType: v.union(v.literal("ensuite"), v.literal("shared")),
  pricePerYear: v.number(),
  availableCount: v.number(),
  accepting: v.boolean(),
  amenities: v.optional(v.array(v.string())),
  blurb: v.optional(v.string()),
  sortOrder: v.number(),
});

export const get = query({
  args: { hostelId: hostelIdArg },
  returns: v.union(
    v.null(),
    v.object({
      hostel: publicHostel,
      branches: v.array(publicBranch),
      rooms: v.array(publicRoom),
    }),
  ),
  handler: async (ctx, args) => {
    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) return null;

    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_hostel", (q) => q.eq("hostelId", args.hostelId))
      .collect();

    return {
      hostel: {
        _id: scope.hostel._id,
        name: scope.hostel.name,
        mode: scope.hostel.mode,
        status: scope.hostel.status,
      },
      branches: [...scope.branches]
        .sort((a, b) => a.sortOrder - b.sortOrder || a._id.localeCompare(b._id))
        .map((branch) => ({
          _id: branch._id,
          name: branch.name,
          directionsNote: branch.directionsNote,
          sortOrder: branch.sortOrder,
        })),
      rooms: rooms
        .sort((a, b) => a.sortOrder - b.sortOrder || a._id.localeCompare(b._id))
        .map((room) => ({
          _id: room._id,
          branchId: room.branchId,
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
    };
  },
});

export const submitInquiry = mutation({
  args: {
    hostelId: hostelIdArg,
    branchId: v.id("branches"),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    guardianName: v.string(),
    guardianPhone: v.string(),
    course: v.string(),
    level: v.string(),
    roomName: v.string(),
    moveInDate: v.string(),
    message: v.optional(v.string()),
    // Honeypot (FR-A9): humans never see or fill this. Filled → discard
    // silently, pretending success so bots learn nothing.
    company: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean(), ref: v.union(v.string(), v.null()) }),
  handler: async (ctx, args) => {
    if (args.company && cleanText(args.company, 80)) return { ok: true, ref: null };

    const scope = await resolveHostel(ctx, args.hostelId);
    if (!scope) throw new Error("This hostel is not configured");
    if (!canAccessBranch(scope, args.branchId)) {
      throw new Error("This branch doesn't belong to this hostel");
    }

    const name = cleanText(args.name, 80);
    const phone = cleanText(args.phone, 20);
    const email = cleanText(args.email, 120);
    const guardianName = cleanText(args.guardianName, 80);
    const guardianPhone = cleanText(args.guardianPhone, 20);
    const course = cleanText(args.course, 80);
    const level = cleanText(args.level, 40);
    const roomName = cleanText(args.roomName, 80);
    const moveInDate = cleanText(args.moveInDate, 60);
    const message = args.message ? cleanText(args.message, 500) : "";
    if (!name || !phone || !roomName || !moveInDate) {
      throw new Error("Fill in your name, phone, room type, and academic year.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter your email — your confirmation goes there.");
    }
    if (!guardianName || !guardianPhone) {
      throw new Error("Fill in your guardian's name and phone.");
    }
    if (!course || !level) {
      throw new Error("Fill in your course and level.");
    }

    // Inquiry reference (FR-A8): {PREFIX}-{YEAR}-E{SEQ}, sequential like
    // the booking code but E-marked so the two never read alike. It goes
    // into the WhatsApp message, the receipt email and the dashboard —
    // one number to match a chat to an inbox row.
    const year = /\d{4}/.exec(moveInDate)?.[0] ?? String(new Date().getFullYear());
    const seq = (scope.hostel.inquirySeq ?? 0) + 1;
    const inquiryRef = `${scope.hostel.codePrefix ?? "ENQ"}-${year}-E${String(seq).padStart(3, "0")}`;
    // The hostel-doc patch serializes concurrent submissions (OCC retry).
    await ctx.db.patch(scope.hostel._id, { inquirySeq: seq });

    await ctx.db.insert("inquiries", {
      branchId: args.branchId,
      hostelId: args.hostelId,
      name,
      phone,
      email,
      guardianName,
      guardianPhone,
      course,
      level,
      inquiryRef,
      roomName,
      moveInDate,
      ...(message ? { message } : {}),
      status: "new",
      source: "form",
      createdAt: Date.now(),
    });

    // Receipt email (FR-A8.3): fire-and-forget via a scheduled action. The
    // action itself is env-gated — no PINGRAM_API_KEY, no send — so dev and
    // the static demo never need an email account.
    if (email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendInquiryReceipt, {
        to: email,
        hostelName: scope.hostel.name,
        ...(scope.hostel.replyToEmail ? { replyTo: scope.hostel.replyToEmail } : {}),
        studentName: name,
        roomName,
        moveInDate,
        inquiryRef,
      });
    }
    return { ok: true, ref: inquiryRef };
  },
});

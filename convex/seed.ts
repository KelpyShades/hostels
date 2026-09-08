import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Seed Franco Hostel — the first real client (Sunyani–Fiapre, UENR).
 *
 * Run once per deployment:
 *   npx convex run seed:seedFrancoHostel
 * It prints the hostel's _id — set that as HOSTEL_ID on Franco's
 * landing_page and dashboard deployments.
 *
 * DESTRUCTIVE SYNC (preview reset): finds the hostel named "Franco Hostel"
 * and replaces its branches, rooms, and inquiries with the real structure
 * below — demo/test rows for this hostel are discarded. Prices per
 * academic year, confirmed 2026-09-07; annexes mirror Main (confirmed).
 *
 * Public like the other manager mutations (same deployment-binding
 * posture, SPEC.md §5) so the CLI can run it.
 */

interface SeedRoom {
  name: string;
  occupancy: 1 | 2 | 4;
  pricePerYear: number;
  availableCount: number;
  blurb: string;
}

// Franco's rooms: every room has its own bathroom (shared inside the room
// for 4-in-1/2-in-1, private for 1-in-1) — hence ensuite throughout.
// Wi-Fi for everyone, night security, shared kitchen. No plant, no study
// room — never claim what they don't have.
// Prices confirmed per academic year (Kelvin, 2026-09-07): both the 2-in-1s
// and 1-in-1s come in old block / new block, each without/with TV (2-in-1s)
// or plain (1-in-1s). Annexes mirror Main (confirmed, 2026-09-07).
const francoRooms: SeedRoom[] = [
  {
    name: "4 in a room",
    occupancy: 4,
    pricePerYear: 5000,
    availableCount: 8,
    blurb: "Four beds, bathroom inside the room, shared with your three roommates. The budget workhorse.",
  },
  {
    name: "2 in a room — Old block (No TV)",
    occupancy: 2,
    pricePerYear: 6000,
    availableCount: 4,
    blurb: "Two beds, bathroom inside the room — the original block, without a TV.",
  },
  {
    name: "2 in a room — Old block (With TV)",
    occupancy: 2,
    pricePerYear: 6200,
    availableCount: 3,
    blurb: "The original-block 2-in-1 with a TV in the room — two hundred cedis more, worth it for some.",
  },
  {
    name: "2 in a room — New block (No TV)",
    occupancy: 2,
    pricePerYear: 7000,
    availableCount: 2,
    blurb: "The 2-in-1s in the new block — seven thousand without a TV, seventy-two hundred with.",
  },
  {
    name: "2 in a room — New block (With TV)",
    occupancy: 2,
    pricePerYear: 7200,
    availableCount: 2,
    blurb: "The new-block 2-in-1 with a TV in the room — the top of the two-in-a-room range.",
  },
  {
    name: "1 in a room — Old block",
    occupancy: 1,
    pricePerYear: 9200,
    availableCount: 2,
    blurb: "One person, your own bathroom, your own key — in the original block.",
  },
  {
    name: "1 in a room — New block",
    occupancy: 1,
    pricePerYear: 10500,
    availableCount: 1,
    blurb: "The single rooms in the new block — the freshest rooms in the house.",
  },
];

const francoBranches = [
  { name: "Main", directionsNote: "Fiapre, Sunyani — a 20-minute walk from the UENR campus" },
  { name: "Annex 1", directionsNote: "Fiapre, Sunyani — a short walk from the Main building" },
  { name: "Annex 2", directionsNote: "Fiapre, Sunyani — a short walk from the Main building" },
  { name: "Annex 3", directionsNote: "Fiapre, Sunyani — a short walk from the Main building" },
];

export const seedFrancoHostel = mutation({
  args: {},
  returns: v.object({ hostelId: v.id("hostels"), created: v.boolean() }),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("hostels")
      .filter((q) => q.eq(q.field("name"), "Franco Hostel"))
      .first();

    const hostelId =
      existing?._id ??
      (await ctx.db.insert("hostels", {
        name: "Franco Hostel",
        mode: "multi",
        status: "live",
        codePrefix: "FRANCO",
        replyToEmail: "kelvinappiah060904@gmail.com", // TEMP — see patch below
      }));

    // Destructive sync: clear this hostel's inquiries, rooms, branches.
    for (const inquiry of await ctx.db
      .query("inquiries")
      .withIndex("by_hostel", (q) => q.eq("hostelId", hostelId))
      .collect()) {
      await ctx.db.delete(inquiry._id);
    }
    for (const room of await ctx.db
      .query("rooms")
      .withIndex("by_hostel", (q) => q.eq("hostelId", hostelId))
      .collect()) {
      await ctx.db.delete(room._id);
    }
    for (const branch of await ctx.db
      .query("branches")
      .withIndex("by_hostel", (q) => q.eq("hostelId", hostelId))
      .collect()) {
      await ctx.db.delete(branch._id);
    }

    // The real structure: multi mode, four branches, variant-priced rooms.
    // codePrefix seeds the room-code format (FRANCO-2026-001); bookingSeq
    // resets with the preview reset so codes start at 001 again.
    // replyToEmail — TEMP: the builder's inbox until the client gives the
    // manager's real address. Per-hostel on purpose: every client shares
    // this Convex deployment, so it must never be a deployment env var.
    await ctx.db.patch(hostelId, {
      mode: "multi",
      status: "live",
      codePrefix: "FRANCO",
      replyToEmail: "kelvinappiah060904@gmail.com",
      bookingSeq: 0,
      inquirySeq: 0,
    });

    for (const [branchIndex, branch] of francoBranches.entries()) {
      const branchId = await ctx.db.insert("branches", {
        hostelId,
        name: branch.name,
        directionsNote: branch.directionsNote,
        sortOrder: branchIndex,
      });
      for (const [roomIndex, room] of francoRooms.entries()) {
        await ctx.db.insert("rooms", {
          branchId,
          hostelId,
          name: room.name,
          occupancy: room.occupancy,
          bathType: "ensuite",
          pricePerYear: room.pricePerYear,
          availableCount: room.availableCount,
          accepting: true,
          amenities: ["wifi", "security", "kitchen"],
          blurb: room.blurb,
          sortOrder: roomIndex,
        });
      }
    }

    console.log(`Franco Hostel synced: ${hostelId} — set this as HOSTEL_ID`);
    return { hostelId, created: !existing };
  },
});

/**
 * Live-data wiring for the public site (SPEC.md §6.3, §7.1).
 *
 * The page shell (about copy, gallery, testimonials, theme, MoMo) is
 * static, per-client, in lib/mock-hostel.ts. What must be live —
 * rooms, prices, availability, branches — comes from Convex. This
 * module merges the two: Convex values win; the static file supplies
 * the curated copy Convex doesn't carry (room blurbs, photo fallbacks,
 * per-branch caretaker lines), keyed by room/branch name.
 *
 * Pure and isomorphic — the pages run it server-side (ISR-fresh seed),
 * the client components re-run it on every Convex update, so the site
 * reflects manager edits the moment they happen (FR-B4).
 */

import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";
import { content } from "./content";
import type { Amenity, Branch, Hostel, RoomType } from "./mock-hostel";

/** What api.public.get returns for this deployment's hostel. */
export type PublicData = NonNullable<FunctionReturnType<typeof api.public.get>>;

export interface SiteData {
  hostel: Hostel;
  branches: Branch[];
}

/**
 * Deployment binding (SPEC.md §6.1): HOSTEL_ID selects the hostel row,
 * NEXT_PUBLIC_CONVEX_URL the Convex deployment. Unset → the static mock
 * shell renders alone (design/demo mode).
 */
export function publicConfig(): { hostelId: string; convexUrl: string } | null {
  const hostelId = process.env.HOSTEL_ID;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  return hostelId && convexUrl ? { hostelId, convexUrl } : null;
}

/** Stable branch slug from a branch name — /b/[branch] routing for
 *  branches created in the dashboard (SPEC.md §6.1). */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "branch"
  );
}

/** Headline numbers for the OG image and meta description — derived from
 *  the (live) room catalog only, never the static shell's mock copy. */
export function siteStats(site: SiteData) {
  const rooms = site.branches.flatMap((b) => b.rooms).filter((r) => r.accepting);
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.pricePerYear)) : null;
  const available = rooms.reduce((sum, r) => sum + r.availableCount, 0);
  const branchCount = site.branches.length;
  return { minPrice, available, branchCount };
}

/** Meta description from the same live numbers — the mock tagline/area
 *  never leak into share previews. */
export function metaDescription(site: SiteData): string {
  const { minPrice, available } = siteStats(site);
  const parts: string[] = [];
  if (minPrice !== null) {
    parts.push(`Rooms from GHS ${minPrice.toLocaleString("en-US")} a year`);
  }
  if (available > 0) {
    parts.push(`${available} available now`);
  }
  return parts.length
    ? `${parts.join(" · ")}. See the rooms, then book on WhatsApp.`
    : "See rooms, prices and availability, then book on WhatsApp.";
}

const amenityLabels = content.amenityLabels as Record<string, string>;

/** Live room → the site's RoomType. The room catalog itself lives in
 *  Convex (the source of truth — names, prices, variants, blurbs); rooms
 *  carry NO photos — the public site shows one curated stock image per
 *  category from the shell (Hostel.roomImages), so managers never upload
 *  room photos at all. */
export function mergeLiveRoom(
  live: PublicData["rooms"][number],
  seedRooms: RoomType[],
): RoomType {
  const seed = seedRooms.find((r) => r.name === live.name);
  return {
    id: live._id,
    name: live.name,
    occupancy: live.occupancy,
    bathType: live.bathType,
    pricePerYear: live.pricePerYear,
    availableCount: live.availableCount,
    accepting: live.accepting,
    amenities: (live.amenities ?? []).filter((a): a is Amenity => a in amenityLabels),
    blurb:
      live.blurb ??
      seed?.blurb ??
      `${live.occupancy}-in-1 with ${live.bathType === "ensuite" ? "its own bathroom" : "a shared bath"}.`,
    sortOrder: live.sortOrder,
  };
}

/**
 * Merge live Convex data onto the static seed. Live branches are the
 * source of truth for what exists; the static file (matched by branch
 * name) supplies slugs, curated photos and per-branch caretaker lines —
 * branches carry no photos in the database at all (2026-09-08: the R2
 * upload pipeline is gone; all imagery is bundled static assets).
 */
export function applyLive(seed: SiteData, live: PublicData): SiteData {
  const hostel: Hostel = {
    ...seed.hostel,
    name: live.hostel.name,
    mode: live.hostel.mode,
    status: live.hostel.status,
  };

  const allSeedRooms = seed.branches.flatMap((b) => b.rooms);

  const branches: Branch[] = [...live.branches]
    .sort((a, b) => a.sortOrder - b.sortOrder || a._id.localeCompare(b._id))
    .map((lb) => {
      const seedBranch = seed.branches.find((b) => slugify(b.name) === slugify(lb.name));
      return {
        id: lb._id,
        slug: seedBranch?.slug ?? slugify(lb.name),
        name: lb.name,
        directionsNote: lb.directionsNote ?? seedBranch?.directionsNote ?? hostel.area,
        whatsappNumber: seedBranch?.whatsappNumber,
        walkToCampus: seedBranch?.walkToCampus,
        photos: seedBranch?.photos ?? hostel.heroImages.map((src) => ({ src })),
        rooms: live.rooms
          .filter((r) => r.branchId === lb._id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((r) => mergeLiveRoom(r, seedBranch?.rooms ?? allSeedRooms)),
      };
    });

  return { hostel, branches };
}

/**
 * Server-side site data (SPEC.md §6.3): fetch the deployment's live
 * Convex data (hostel identity, branches, rooms), merge it onto the
 * static shell, and hand it to the pages. `revalidate` on the layout
 * keeps the prerendered HTML fresh; the client subscription keeps the
 * numbers fresh (see components/live-data.tsx).
 */

import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { getBranches, getHostel } from "./mock-hostel";
import { applyLive, publicConfig, type PublicData, type SiteData } from "./live";

/** The static shell — per-client content from the strings file. */
export function seedSite(): SiteData {
  return { hostel: getHostel(), branches: getBranches() };
}

/** Live Convex data for this deployment's hostel; null when Convex is
 *  unconfigured or unreachable — the static shell renders alone. */
export const fetchPublicData = cache(async (): Promise<PublicData | null> => {
  const config = publicConfig();
  if (!config) return null;
  try {
    const live = await fetchQuery(
      api.public.get,
      { hostelId: config.hostelId as Id<"hostels"> },
      { url: config.convexUrl },
    );
    if (live === null) {
      console.warn(`No hostel row for HOSTEL_ID=${config.hostelId} — rendering the static shell.`);
    }
    return live;
  } catch (error) {
    console.error("Convex public data unavailable:", error);
    return null;
  }
});

/** Seed + live merged — what every page renders server-side. */
export const getSite = cache(async (): Promise<{ site: SiteData; live: PublicData | null }> => {
  const live = await fetchPublicData();
  const seed = seedSite();
  return { site: live ? applyLive(seed, live) : seed, live };
});

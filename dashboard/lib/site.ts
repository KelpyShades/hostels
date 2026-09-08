/**
 * Server-side hostel identity for the dashboard's metadata and OG image
 * (the pages themselves are client-rendered against NEXT_PUBLIC_CONVEX_URL).
 * Reads the same deployment binding as the landing page: HOSTEL_ID +
 * NEXT_PUBLIC_CONVEX_URL. Unset/unreachable → null → generic copy.
 */

import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

export const getHostelName = cache(async (): Promise<string | null> => {
  const hostelId = process.env.HOSTEL_ID;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!hostelId || !convexUrl) return null;
  try {
    const live = await fetchQuery(
      api.public.get,
      { hostelId: hostelId as Id<"hostels"> },
      { url: convexUrl },
    );
    return live?.hostel.name ?? null;
  } catch (error) {
    // Next's signal that this route must render on-demand — rethrow it so
    // the router marks the route dynamic instead of logging a scary error
    // and prerendering fallback data.
    if (
      error instanceof Error &&
      (error as Error & { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Convex public data unavailable:", error);
    return null;
  }
});

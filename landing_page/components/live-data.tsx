"use client";

/**
 * Client-side live data (SPEC.md §6.3): one Convex subscription for the
 * whole site, provided by the layout. Sections pull the slices they
 * need through these hooks and re-render the moment a manager saves a
 * room, price, or availability change (FR-B4: edits appear immediately).
 *
 * While the subscription loads (and during SSR), hooks return the seed
 * props the server already merged — so prerendered HTML and first paint
 * are correct and there is no flash. Without Convex configured there is
 * no provider query: the static mock shell is the data.
 */

import { ConvexProvider, ConvexReactClient } from "convex/react";
// Cached queries (convex-helpers): subscriptions survive unmounts for a
// short expiration window, so navigating between the org view, branch sites,
// and back is instant instead of re-fetching. Next.js apps import the
// deep paths (CONVEX_HELPERS.md › Query Caching).
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { applyLive, mergeLiveRoom, type PublicData, type SiteData } from "@/lib/live";
import type { Branch, RoomType } from "@/lib/mock-hostel";

interface LiveContextValue {
  hostelId: string;
  client: ConvexReactClient | null;
  /** undefined = still loading · null = hostel row missing · else live data */
  live: PublicData | null | undefined;
  seed: SiteData;
}

const LiveContext = createContext<LiveContextValue | null>(null);

export function SiteDataProvider({
  convexUrl,
  hostelId,
  seed,
  children,
}: {
  convexUrl?: string;
  hostelId?: string;
  seed: SiteData;
  children: ReactNode;
}) {
  const client = useMemo(
    () => (convexUrl && hostelId ? new ConvexReactClient(convexUrl) : null),
    [convexUrl, hostelId],
  );

  if (!client || !hostelId) {
    return (
      <LiveContext.Provider value={{ hostelId: "", client: null, live: undefined, seed }}>
        {children}
      </LiveContext.Provider>
    );
  }

  return (
    <ConvexProvider client={client}>
      <ConvexQueryCacheProvider>
        <LiveQuery hostelId={hostelId} client={client} seed={seed}>
          {children}
        </LiveQuery>
      </ConvexQueryCacheProvider>
    </ConvexProvider>
  );
}

function LiveQuery({
  hostelId,
  client,
  seed,
  children,
}: {
  hostelId: string;
  client: ConvexReactClient;
  seed: SiteData;
  children: ReactNode;
}) {
  const live = useQuery(api.public.get, { hostelId: hostelId as Id<"hostels"> });
  return (
    <LiveContext.Provider value={{ hostelId, client, live, seed }}>
      {children}
    </LiveContext.Provider>
  );
}

/** One branch, live — rooms, prices, availability, photos up to date. */
export function useLiveBranch(branch: Branch): Branch {
  const ctx = useContext(LiveContext);
  if (!ctx?.live) return branch;
  const site = applyLive(ctx.seed, ctx.live);
  return site.branches.find((b) => b.id === branch.id) ?? branch;
}

/** All branches, live — the branch picker and switcher lists. */
export function useLiveBranches(branches: Branch[]): Branch[] {
  const ctx = useContext(LiveContext);
  if (!ctx?.live) return branches;
  return applyLive(ctx.seed, ctx.live).branches;
}

/** Rooms (optionally scoped to a branch), live, with curated copy. */
export function useLiveRooms(rooms: RoomType[], branchId?: string): RoomType[] {
  const ctx = useContext(LiveContext);
  if (!ctx?.live) return rooms;
  const live = ctx.live;
  const seedRooms = branchId
    ? (ctx.seed.branches.find((b) => b.id === branchId)?.rooms ?? rooms)
    : ctx.seed.branches.flatMap((b) => b.rooms);
  return live.rooms
    .filter((r) => (branchId ? r.branchId === branchId : true))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => mergeLiveRoom(r, seedRooms));
}

/** Open-room count (accepting rooms' available counts, summed), live. */
export function useLiveOpen(seedOpen: number, branchId?: string): number {
  const ctx = useContext(LiveContext);
  if (!ctx?.live) return seedOpen;
  const rooms = branchId
    ? ctx.live.rooms.filter((r) => r.branchId === branchId)
    : ctx.live.rooms;
  return rooms.reduce((n, r) => n + (r.accepting ? r.availableCount : 0), 0);
}

/** The Convex client + hostel id, for the inquiry form's mutation. */
export function useLiveClient(): { hostelId: string; client: ConvexReactClient } | null {
  const ctx = useContext(LiveContext);
  return ctx?.client ? { hostelId: ctx.hostelId, client: ctx.client } : null;
}

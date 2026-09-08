"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

/** The exact args the dashboard's manager.get subscription uses — the
 *  optimistic updates must patch the same query key (with branchId when
 *  the view is branch-scoped). */
export interface ManagerQueryArgs {
  hostelId: Id<"hostels">;
  branchId?: Id<"branches">;
}

/**
 * Mutations with optimistic updates so one-tap actions (the availability
 * stepper, the accepting switch, status pills) feel instant. Convex's
 * reactive subscription reconciles with the server value moments later.
 */
export function useRoomUpdate(queryArgs: ManagerQueryArgs) {
  return useMutation(api.manager.updateRoom).withOptimisticUpdate((localStore, args) => {
    const current = localStore.getQuery(api.manager.get, queryArgs);
    if (!current) return;
    localStore.setQuery(api.manager.get, queryArgs, {
      ...current,
      rooms: current.rooms.map((room) =>
        room._id === args.roomId
          ? {
              ...room,
              name: args.name,
              occupancy: args.occupancy,
              bathType: args.bathType,
              pricePerYear: args.pricePerYear,
              availableCount: args.availableCount,
              accepting: args.accepting,
              amenities: args.amenities ?? room.amenities,
            }
          : room,
      ),
    });
  });
}

export function useInquiryStatusUpdate(queryArgs: ManagerQueryArgs) {
  return useMutation(api.manager.updateInquiryStatus).withOptimisticUpdate((localStore, args) => {
    const current = localStore.getQuery(api.manager.get, queryArgs);
    if (!current) return;
    localStore.setQuery(api.manager.get, queryArgs, {
      ...current,
      inquiries: current.inquiries.map((inquiry) =>
        inquiry._id === args.inquiryId ? { ...inquiry, status: args.status } : inquiry,
      ),
    });
  });
}

"use client";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { HotelAppWorkspace } from "./hotel-app-workspace";

export function HotelAppLive() {
  const operatorKey = process.env.NEXT_PUBLIC_OPERATOR_KEY ?? "";
  const data = useQuery(api.dashboard.overview, { operatorKey });
  const updateRoom = useMutation(api.dashboard.updateRoom);
  const updateInquiryStatus = useMutation(api.dashboard.updateInquiryStatus);
  if (data === undefined) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading hotel app…</div>;
  const hostels = data.hostels.map((hostel) => ({
    id: hostel._id,
    name: hostel.name,
    slug: hostel.slug,
    status: hostel.status,
    customDomain: hostel.customDomain,
    renewalDate: hostel.renewalDate,
    tagline: hostel.tagline,
  }));
  return <HotelAppWorkspace
    hostels={hostels}
    rooms={data.rooms}
    inquiries={data.inquiries}
    onSaveRoom={async (roomId, values) => { await updateRoom({ operatorKey, roomId: roomId as Id<"rooms">, pricePerSemester: values.price, availableCount: values.available, accepting: values.accepting }); }}
    onUpdateInquiry={async (inquiryId, status) => { await updateInquiryStatus({ operatorKey, inquiryId: inquiryId as Id<"inquiries">, status }); }}
  />;
}

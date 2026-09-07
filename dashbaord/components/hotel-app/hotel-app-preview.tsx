"use client";

import { HotelAppWorkspace } from "./hotel-app-workspace";
import { previewHostels, previewRooms, previewInquiries } from "./preview-data";

export function HotelAppPreview() {
  return <HotelAppWorkspace hostels={previewHostels} rooms={previewRooms} inquiries={previewInquiries} preview />;
}

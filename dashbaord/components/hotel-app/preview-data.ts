import type { DemoHostel, DemoInquiry, DemoRoom } from "./types";

export const previewHostels: DemoHostel[] = [{
  id: "aseda-heights",
  name: "Aseda Heights Hostel",
  slug: "aseda-heights",
  status: "live",
  customDomain: "asedaheights.com",
  renewalDate: "Sep 1, 2027",
  tagline: "A quiet, well-kept home eight minutes from the KNUST main gate.",
}];

export const previewRooms: DemoRoom[] = [
  { _id: "room-4in1", hostelId: "aseda-heights", name: "4-in-1", occupancy: 4, bathType: "shared", pricePerSemester: 1900, availableCount: 6, accepting: true },
  { _id: "room-2in1", hostelId: "aseda-heights", name: "2-in-1", occupancy: 2, bathType: "shared", pricePerSemester: 3400, availableCount: 3, accepting: true },
  { _id: "room-1in1", hostelId: "aseda-heights", name: "1-in-1 Ensuite", occupancy: 1, bathType: "ensuite", pricePerSemester: 5200, availableCount: 2, accepting: true },
];

export const previewInquiries: DemoInquiry[] = [
  { _id: "inquiry-1", hostelId: "aseda-heights", name: "Ama Owusu", phone: "024 555 0192", roomName: "2-in-1", moveInDate: "2026-09", message: "Can I visit on Saturday afternoon?", status: "new", source: "form", createdAt: Date.now() - 1000 * 60 * 45 },
  { _id: "inquiry-2", hostelId: "aseda-heights", name: "Kojo Mensah", phone: "055 210 4431", roomName: "4-in-1", moveInDate: "2026-09", message: "", status: "contacted", source: "wa", createdAt: Date.now() - 1000 * 60 * 60 * 5 },
  { _id: "inquiry-3", hostelId: "aseda-heights", name: "Esi Antwi", phone: "020 112 8877", roomName: "1-in-1 Ensuite", moveInDate: "2026-09", message: "", status: "booked", source: "form", createdAt: Date.now() - 1000 * 60 * 60 * 22 },
];

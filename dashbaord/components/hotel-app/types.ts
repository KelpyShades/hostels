export type DemoHostel = {
  id: string;
  name: string;
  slug: string;
  status: "live" | "draft" | "paused";
  customDomain?: string;
  renewalDate?: string;
  tagline: string;
};

export type DemoRoom = {
  _id: string;
  hostelId: string;
  name: string;
  occupancy: number;
  bathType: "ensuite" | "shared";
  pricePerSemester: number;
  availableCount: number;
  accepting: boolean;
};

export type DemoInquiry = {
  _id: string;
  hostelId: string;
  name: string;
  phone: string;
  roomName: string;
  moveInDate: string;
  message?: string;
  status: "new" | "contacted" | "booked";
  source: "wa" | "form";
  createdAt: number;
};

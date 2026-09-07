export type ManagerHostel = {
  _id: string;
  name: string;
  mode: "unit" | "multi";
  status: "live" | "draft" | "paused";
};

export type ManagerBranch = {
  _id: string;
  hostelId: string;
  name: string;
  slug?: string;
  directionsNote?: string;
  sortOrder: number;
};

export type ManagerRoom = {
  _id: string;
  branchId: string;
  hostelId: string;
  name: string;
  occupancy: number;
  bathType: "ensuite" | "shared";
  pricePerSemester: number;
  availableCount: number;
  accepting: boolean;
  amenities?: string[];
  photoKey?: string;
  sortOrder: number;
};

export type ManagerInquiry = {
  _id: string;
  branchId: string;
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

export type ManagerData = {
  hostel: ManagerHostel;
  branches: ManagerBranch[];
  rooms: ManagerRoom[];
  inquiries: ManagerInquiry[];
};

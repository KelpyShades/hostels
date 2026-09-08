import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";

export type ManagerData = NonNullable<FunctionReturnType<typeof api.manager.get>>;
export type ManagerHostel = ManagerData["hostel"];
export type ManagerBranch = ManagerData["branches"][number];
export type ManagerRoom = ManagerData["rooms"][number];
export type ManagerInquiry = ManagerData["inquiries"][number];
export type InquiryStatus = ManagerInquiry["status"];

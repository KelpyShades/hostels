import { ManagerDashboard } from "@/components/manager-dashboard/manager-dashboard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <ManagerDashboard hostelId={process.env.HOSTEL_ID ?? ""} />;
}

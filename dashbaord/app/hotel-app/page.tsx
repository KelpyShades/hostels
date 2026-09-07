import type { Metadata } from "next";
import { HotelAppShell } from "@/components/hotel-app/hotel-app-shell";

export const metadata: Metadata = {
  title: "Hotel app — hostel/",
  description: "Internal hostel client management workspace.",
  robots: { index: false, follow: false },
};

export default function HotelAppPage() {
  return <HotelAppShell />;
}

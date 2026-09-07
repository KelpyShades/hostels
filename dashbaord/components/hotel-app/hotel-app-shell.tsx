"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HotelAppPreview } from "./hotel-app-preview";
import { HotelAppLive } from "./hotel-app-live";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function HotelAppShell() {
  if (!convexUrl) return <HotelAppPreview />;
  const client = new ConvexReactClient(convexUrl);
  return <ConvexProvider client={client}><HotelAppLive /></ConvexProvider>;
}

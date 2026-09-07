"use client";

import type { ReactNode } from "react";

/**
 * "Check availability" CTA on a room section (FR-A3: the room CTA
 * pre-selects that room in the inquiry form). A button (not an anchor):
 * it performs an action — dispatches the preselect event the InquiryForm
 * listens for — then navigates to #inquire (native anchor behavior via
 * location.hash; html has scroll-behavior: smooth — no scrollIntoView,
 * per huashu rule).
 */

export const PRESELECT_ROOM_EVENT = "hostel:preselect-room";

export function RoomCheckCta({
  roomName,
  className = "",
  children,
}: {
  roomName: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer ${className}`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(PRESELECT_ROOM_EVENT, { detail: { roomName } }),
        );
        window.location.hash = "inquire";
      }}
    >
      {children}
    </button>
  );
}

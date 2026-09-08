import Link from "next/link";

/**
 * "Check availability" CTA on a room tile/section (FR-A3: the room CTA
 * pre-selects that room in the inquiry form). Now a link to the dedicated
 * inquiry page — `/inquire?room=…` (unit) or `/b/[slug]/inquire?room=…`
 * (branch) — where the form opens with that exact room chosen.
 */

/** Inquiry-page href with a specific room pre-selected. */
export function inquireRoomHref(inquireHref: string, roomName: string): string {
  return `${inquireHref}?room=${encodeURIComponent(roomName)}`;
}

export function RoomCheckCta({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

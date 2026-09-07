import { content } from "@/lib/content";
import type { Hostel, RoomType } from "@/lib/mock-hostel";
import { Reveal } from "@/components/reveal";

/**
 * Shared pieces of the Folio site design: the section title and the small
 * display helpers every section file uses. Data selectors (openRooms,
 * minFrom) live in lib/mock-hostel.ts next to the data they derive from.
 */

const c = content;

/** Google Maps search link from the hostel's map query. */
export function mapUrl(hostel: Hostel): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hostel.mapQuery)}`;
}

/** "Ensuite" / "shared bath" in the site's voice. */
export function bathLabel(room: RoomType): string {
  return room.bathType === "ensuite" ? c.rooms.ensuite : c.rooms.sharedBath;
}

/** Branch display name — the part after the org prefix ("Org — Branch" → "Branch"). */
export function shortName(branchName: string): string {
  const parts = branchName.split(" — ");
  return parts[parts.length - 1] ?? branchName;
}

/** Split the hostel name for the stacked hero wordmark — first word over the rest. */
export function heroNameLines(name: string): [string, string | null] {
  const words = name.replace(/ Hostel$/, "").split(" ");
  if (words.length < 2) return [name, null];
  return [words[0], words.slice(1).join(" ")];
}

/** Nav wordmark — the name without its generic suffix, as the hero shows it. */
export function wordmarkText(name: string): string {
  return name.replace(/ Hostel$/, "");
}

/** Serif section title — the only heading treatment on the page. */
export function SectionTitle({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <h2
        className={`font-(family-name:--font-display) text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.01em] text-balance ${
          dark ? "text-(--deep-ink)" : "text-(--ink)"
        }`}
      >
        {children}
      </h2>
    </Reveal>
  );
}

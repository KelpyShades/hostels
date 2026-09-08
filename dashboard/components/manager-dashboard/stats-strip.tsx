import { content } from "@/lib/content";

/**
 * The signature element: the public site's dark "ledger" panel, echoed
 * small — deep wine ground, brass figures, tabular numerals.
 */
export function StatsStrip({ newCount, openRooms }: { newCount: number; openRooms: number }) {
  return (
    <section
      className="grid grid-cols-2 overflow-hidden rounded-xl bg-wine-deep"
      aria-label={content.stats.newEnquiries}
    >
      <div className="p-4 sm:p-5">
        <p className="text-xs font-medium text-[#9fb5a6]">{content.stats.newEnquiries}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-brass-bright sm:text-4xl">{newCount}</p>
      </div>
      <div className="border-l border-white/10 p-4 sm:p-5">
        <p className="text-xs font-medium text-[#9fb5a6]">{content.stats.roomsAvailable}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-brass-bright sm:text-4xl">{openRooms}</p>
      </div>
    </section>
  );
}

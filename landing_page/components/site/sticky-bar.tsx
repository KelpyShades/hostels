"use client";

import { content } from "@/lib/content";
import { WhatsAppGlyph } from "@/components/inquiry-form";
import { ScrollAppear } from "@/components/scroll-appear";
import { useLiveOpen } from "@/components/live-data";

/**
 * Sticky availability bar (mobile) + floating WhatsApp pill (desktop) —
 * FR-A11: a persistent way to start a conversation on every screen.
 * chatHref is resolved by the surface: the branch caretaker on a branch
 * site, the org line on the org view.
 */

const c = content;

export function StickyBar({
  open,
  branchId,
  ctaHref,
  chatHref,
}: {
  open: number;
  branchId?: string;
  ctaHref: string;
  chatHref: string;
}) {
  const liveOpen = useLiveOpen(open, branchId);
  return (
    <>
      <ScrollAppear className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
        <div className="border-t border-white/10 bg-(--deep)/95 pb-[env(safe-area-inset-bottom)] text-(--deep-ink) backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-(--deep-ink)/85">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-(--brass-bright)" />
              {liveOpen > 0 ? `${liveOpen} ${c.properties.roomsOpen}` : c.properties.fullyBooked}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={ctaHref}
                className="inline-flex min-h-10 items-center rounded-(--radius) bg-(--deep-ink) px-4 text-[13px] font-semibold text-(--deep)"
              >
                {c.cta}
              </a>
              <a
                href={chatHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.chat.floatingAction}
                className="flex h-10 w-10 items-center justify-center rounded-(--radius) border border-white/20"
              >
                <WhatsAppGlyph className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        </div>
      </ScrollAppear>
      <a
        href={chatHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 hidden items-center gap-2.5 rounded-(--radius) border border-white/15 bg-(--deep)/85 px-5 py-3 text-[13.5px] font-medium text-(--deep-ink) shadow-2xl backdrop-blur-xl sm:flex"
      >
        <WhatsAppGlyph className="h-4.5 w-4.5" />
        {c.chat.floatingAction}
      </a>
    </>
  );
}

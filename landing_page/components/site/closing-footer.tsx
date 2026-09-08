import Link from "next/link";
import { formatGhs, type Hostel } from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { WhatsAppGlyph } from "@/components/inquiry-form";
import { Reveal } from "@/components/reveal";
import type { NavLink } from "@/components/site/site-nav";

/**
 * Closing + footer — the last dark beat: the invitation in the display
 * face, then wordmark, section links, and the payment details (FR-A10).
 * ctaHref/chatHref differ by surface: "#inquire" + the branch caretaker
 * on a branch site, the branch picker + org line on the org view.
 */

const c = content;

export function ClosingFooter({
  hostel,
  links,
  ctaHref,
  chatHref,
}: {
  hostel: Hostel;
  links: NavLink[];
  ctaHref: string;
  chatHref: string;
}) {
  return (
    <footer className="bg-(--deep) text-(--deep-ink)">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="border-b border-white/10 py-24 text-center sm:py-28">
          <Reveal>
            <p className="mx-auto max-w-2xl font-(family-name:--font-display) text-[clamp(2.1rem,5vw,3.4rem)] font-medium leading-[1.12] text-balance">
              {c.closing.line}
            </p>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-(--deep-ink)/70">
              {c.closing.sub}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href={ctaHref}
                className="inline-flex min-h-12 items-center rounded-(--radius) bg-(--deep-ink) px-7 text-[14.5px] font-semibold text-(--deep) transition-transform active:scale-[0.99]"
              >
                {c.cta}
              </a>
              <a
                href={chatHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-(--radius) border border-white/25 px-7 text-[14.5px] font-semibold transition-colors hover:bg-white/10"
              >
                <WhatsAppGlyph className="h-4.5 w-4.5" />
                {c.chat.floatingAction}
              </a>
            </div>
          </Reveal>
        </div>
        <div className="flex flex-col gap-10 py-14 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[13.5px] font-semibold uppercase tracking-[0.2em]">
              {hostel.name}
            </p>
            <p className="mt-2.5 text-[13.5px] text-(--deep-ink)/65">{hostel.area}</p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] font-medium text-(--deep-ink)/75"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-(--deep-ink)"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="text-[13.5px] leading-relaxed text-(--deep-ink)/65">
            <p>
              {c.booking.payVia}: {hostel.momoName}, {hostel.momoNumber}
            </p>
            {hostel.bookingFee ? (
              <p className="mt-2">
                {c.booking.feeLabel}: {formatGhs(hostel.bookingFee)}
              </p>
            ) : null}
          </div>
        </div>
        <p className="border-t border-white/10 py-7 pb-20 text-center text-[12.5px] text-(--deep-ink)/55">
          © {new Date().getFullYear()} {hostel.name}
        </p>
      </div>
    </footer>
  );
}

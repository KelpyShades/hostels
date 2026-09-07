import { content } from "@/lib/content";
import type { Branch, Hostel } from "@/lib/mock-hostel";
import { Reveal } from "@/components/reveal";
import { SectionTitle, mapUrl } from "@/components/site/shared";

/**
 * Finding us — landmark directions and the walk to campus as the section's
 * big figure, on the soft ground band.
 */

const c = content;

export function FindingUsSection({ hostel, branch }: { hostel: Hostel; branch: Branch }) {
  // The branch's own walk figure when it has one — the org's otherwise.
  const walkToCampus = branch.walkToCampus ?? hostel.walkToCampus;
  return (
    <section id="location" className="scroll-mt-16 bg-(--bg-soft) py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionTitle>{c.sections.location}</SectionTitle>
          <Reveal>
            <p className="mt-8 max-w-md text-[16px] leading-[1.75] text-(--ink-soft)">
              {hostel.directions}
            </p>
            <a
              href={mapUrl(hostel)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex min-h-12 items-center rounded-(--radius) border border-(--ink)/30 px-7 text-[14px] font-semibold transition-colors hover:border-(--ink)"
            >
              {c.location.openInMaps}
            </a>
          </Reveal>
        </div>
        <div className="flex flex-col justify-center border-t border-(--line-strong) pt-12 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-20">
          <Reveal>
            <p className="text-[clamp(3.2rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.02em] tabular-nums text-(--accent)">
              {walkToCampus}
            </p>
            <p className="mt-4 text-[15px] font-medium text-(--ink-muted)">
              {c.location.walkNote}
            </p>
            <p className="mt-6 max-w-sm text-[14.5px] leading-relaxed text-(--ink-soft)">
              {branch.directionsNote}.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

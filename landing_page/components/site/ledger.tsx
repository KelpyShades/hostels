import type { Hostel } from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/site/shared";

/**
 * Assurance ledger — the page's dark beat. The hostel's real sales pitch
 * (power, water, security, study…) as giant brass figures over hairline
 * rules. Per-hostel curation in the seed's `Hostel.ledger` — real claims
 * only, never generic amenity chips.
 */

const c = content;

export function Ledger({ hostel }: { hostel: Hostel }) {
  const ledger = hostel.ledger;
  return (
    <section id="practical" className="scroll-mt-16 bg-(--deep) py-24 text-(--deep-ink) sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle dark>{c.sections.amenities}</SectionTitle>
        <Reveal>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-(--deep-ink)/70">
            {ledger.intro}
          </p>
        </Reveal>
        <dl className="mt-16">
          {ledger.items.map((item, i) => (
            <Reveal key={item.title}>
              <div
                className={`grid gap-3 border-t border-white/12 py-9 sm:grid-cols-[16rem_1fr] sm:gap-12 ${
                  i === ledger.items.length - 1 ? "border-b" : ""
                }`}
              >
                <dt className="text-[clamp(2.2rem,5vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.01em] tabular-nums text-(--brass-bright)">
                  {item.figure}
                </dt>
                <dd className="sm:pt-1.5">
                  <p className="text-[16px] font-semibold">{item.title}</p>
                  <p className="mt-2 max-w-lg text-[15px] leading-[1.7] text-(--deep-ink)/75">
                    {item.body}
                  </p>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
        <Reveal>
          <p className="mt-10 max-w-2xl text-[14.5px] leading-relaxed text-(--deep-ink)/70">
            {ledger.also}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import {
  formatGhs,
  minFrom,
  openRooms,
  type Branch,
} from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Reveal } from "@/components/reveal";
import { SectionTitle, shortName } from "@/components/site/shared";
import { useLiveBranches } from "@/components/live-data";

/**
 * Properties — the org view's branch picker: editorial rows (photos,
 * from-price, open count) leading into each branch's full site at
 * /b/[slug], closed by the "at a glance" comparison table.
 */

const c = content;

export function PropertiesSection({ branches }: { branches: Branch[] }) {
  const liveBranches = useLiveBranches(branches);
  const fromOf = (b: Branch) => {
    const from = minFrom(b.rooms);
    return from ? formatGhs(from) : c.hero.facts.fromEmpty;
  };
  return (
    <section id="properties" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <SectionTitle>{c.properties.heading}</SectionTitle>
      <div className="mt-16 space-y-24 sm:space-y-32">
        {liveBranches.map((b, i) => {
          const flipped = i % 2 === 1;
          const bOpen = openRooms(b);
          return (
            <Reveal key={b.id}>
              <article className="grid items-center gap-10 sm:grid-cols-12 sm:gap-14">
                <div className={`sm:col-span-7 ${flipped ? "sm:order-2" : ""}`}>
                  <PhotoCarousel
                    photos={b.photos}
                    sizes="(min-width: 640px) 58vw, 100vw"
                    aspectClassName="aspect-4/3 sm:aspect-3/2"
                    className="overflow-hidden"
                    showCaptions={false}
                  />
                </div>
                <div className={`sm:col-span-5 ${flipped ? "sm:order-1" : ""}`}>
                  <p className="text-[13.5px] font-medium text-(--ink-muted)">
                    {b.directionsNote}
                  </p>
                  <h3 className="mt-3 font-(family-name:--font-display) text-[clamp(2rem,4vw,2.7rem)] font-medium leading-none tracking-[-0.01em]">
                    {shortName(b.name)}
                  </h3>
                  <p className="mt-6 flex flex-wrap items-baseline gap-x-3.5">
                    <span className="text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold leading-none tracking-[-0.01em] tabular-nums">
                      {fromOf(b)}
                    </span>
                    <span className="text-[13px] text-(--ink-muted)">
                      {c.properties.from} · {c.properties.perYear}
                    </span>
                  </p>
                  <p
                    className={`mt-4 flex items-center gap-2.5 text-[14px] font-medium ${
                      bOpen > 0 ? "text-(--accent)" : "text-(--ink-soft)"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${bOpen > 0 ? "bg-(--accent)" : "bg-(--ink-soft)"}`}
                    />
                    {bOpen > 0 ? `${bOpen} ${c.properties.roomsOpen}` : c.properties.fullyBooked}
                  </p>
                  <Link
                    href={`/b/${b.slug}`}
                    className="mt-8 inline-flex min-h-12 items-center rounded-(--radius) bg-(--accent) px-7 text-[14px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
                  >
                    {c.properties.viewRooms}
                  </Link>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* At a glance */}
      <Reveal className="mt-24 sm:mt-32">
        <div className="max-w-3xl border-t border-(--line-strong) pt-12">
          <h3 className="font-(family-name:--font-display) text-[clamp(1.6rem,3vw,2rem)] font-medium tracking-[-0.01em]">
            {c.properties.compareTitle}
          </h3>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-(--line-strong)">
                  {[
                    c.properties.eyebrow.replace("Our ", ""),
                    c.sections.location,
                    c.properties.fromPrice,
                    c.rateCard.availability,
                  ].map((h) => (
                    <th
                      key={h}
                      className={`pb-3.5 pr-4 text-[12.5px] font-medium text-(--ink-muted) ${
                        h === c.sections.location ? "hidden sm:table-cell" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveBranches.map((b) => (
                  <tr key={b.id} className="border-b border-(--line)">
                    <td className="py-4.5 pr-4 text-[15px] font-medium">{shortName(b.name)}</td>
                    <td className="hidden py-4.5 pr-4 text-[14.5px] text-(--ink-soft) sm:table-cell">
                      {b.directionsNote}
                    </td>
                    <td className="py-4.5 pr-4 text-[1.05rem] font-semibold tabular-nums">
                      {fromOf(b)}
                    </td>
                    <td className="py-4.5 text-[13.5px] font-medium text-(--accent)">
                      {openRooms(b)} {c.properties.roomsOpen}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

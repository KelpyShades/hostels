"use client";

import { Fragment } from "react";
import Image from "next/image";
import {
  formatGhs,
  groupRooms,
  type Branch,
  type Hostel,
  type RoomCategory,
  type RoomType,
} from "@/lib/mock-hostel";
import { content, availabilityLabel } from "@/lib/content";
import { buildRoomChatLink, buildGeneralChatLink, type ChatContact } from "@/lib/wa";
import { RoomCheckCta, inquireRoomHref } from "@/components/room-cta";
import { Reveal } from "@/components/reveal";
import { SectionTitle, bathLabel } from "@/components/site/shared";
import { useLiveBranch } from "@/components/live-data";

/**
 * Rooms & rates — the section a student came for. Rooms are grouped into
 * occupancy categories ("Two in a room") so a branch with several price
 * variants under one category (Franco: TV / key / tier) stays scannable
 * (FR-A3): one editorial row per category — photo, blurb, shared
 * amenities, from-price — then every variant as a visible rate tile
 * beneath it: name, price, availability, what differs, and its own
 * "Check availability" that opens the inquiry page with that exact
 * variant pre-selected. Nothing hides behind an expander.
 */

const c = content;

export function RoomsSection({
  hostel,
  branch,
  contact,
  inquireHref,
}: {
  hostel: Hostel;
  branch: Branch;
  contact: ChatContact;
  /** The shareable inquiry page — room CTAs link here with ?room= preselected. */
  inquireHref: string;
}) {
  const liveBranch = useLiveBranch(branch);
  const categories = groupRooms(
    [...liveBranch.rooms].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  return (
    <section id="rooms" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <SectionTitle>{c.sections.rooms}</SectionTitle>
      <div className="mt-16 space-y-24 sm:space-y-32">
        {categories.map((category, i) => (
          <Reveal key={category.occupancy}>
            <CategoryRow
              hostel={hostel}
              contact={contact}
              category={category}
              index={i}
              inquireHref={inquireHref}
            />
          </Reveal>
        ))}
      </div>
      <RateCard hostel={hostel} categories={categories} />
    </section>
  );
}

function CategoryRow({
  hostel,
  contact,
  category,
  index,
  inquireHref,
}: {
  hostel: Hostel;
  contact: ChatContact;
  category: RoomCategory;
  index: number;
  inquireHref: string;
}) {
  const flipped = index % 2 === 1;
  const cover = category.rooms[0];
  const from = formatGhs(category.rooms[0].pricePerYear);
  // Amenities the whole category shares (variants differ by name/price).
  const amenities = [...new Set(category.rooms.flatMap((room) => room.amenities))];
  const multiple = category.rooms.length > 1;
  // Bath type only needs stating per tile when variants actually differ.
  const bathsDiffer = new Set(category.rooms.map((r) => r.bathType)).size > 1;
  // ONE stock image per category (2026-09-08): the shell's curated
  // room image for this occupancy — 4-in-1 rooms show the 4-in-1 photo,
  // 2-in-1 the 2-in-1 photo, and so on.
  const stockSrc = hostel.roomImages[category.occupancy];

  return (
    <article>
      <div className="grid items-start gap-10 sm:grid-cols-12 sm:gap-14">
        <div className={`sm:col-span-7 ${flipped ? "sm:order-2" : ""}`}>
            <div className="relative aspect-4/3 overflow-hidden sm:aspect-3/2">
              <Image
                src={stockSrc}
                alt={c.rooms.categories[category.occupancy]}
                fill
                sizes="(min-width: 640px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        <div className={`sm:col-span-5 ${flipped ? "sm:order-1" : ""} sm:pt-1`}>
          <p className="text-[13.5px] font-medium text-(--ink-muted)">
            {c.rooms.sleeps} {category.occupancy}, {bathLabel(cover)}
          </p>
          <h3 className="mt-3 font-(family-name:--font-display) text-[clamp(2rem,4vw,2.7rem)] font-medium leading-none tracking-[-0.01em]">
            {c.rooms.categories[category.occupancy]}
          </h3>
          <p className="mt-4 text-[15.5px] leading-[1.75] text-(--ink-soft)">{cover.blurb}</p>
          <ul className="mt-5 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {amenities.map((a) => (
              <li key={a} className="flex items-baseline gap-2.5 text-[13.5px] text-(--ink-soft)">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 -translate-y-px rounded-full bg-(--accent)" />
                {c.amenityLabels[a]}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-(--line-strong) pt-7">
            <p className="flex flex-wrap items-baseline gap-x-3.5">
              <span className="text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold leading-none tracking-[-0.01em] tabular-nums">
                {from}
              </span>
              <span className="text-[13px] text-(--ink-muted)">
                {c.rooms.from} · {c.sections.perYear}
                {multiple ? ` · ${c.rooms.optionCount(category.rooms.length)}` : ""}
              </span>
            </p>

            {!multiple && (
              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                <RoomCheckCta
                  href={inquireRoomHref(inquireHref, cover.name)}
                  className="inline-flex min-h-12 items-center rounded-(--radius) bg-(--accent) px-7 text-[14px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
                >
                  {cover.accepting ? c.cta : c.rooms.joinWaitlist}
                </RoomCheckCta>
                <a
                  href={buildRoomChatLink(contact, cover)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-medium text-(--ink-soft) underline decoration-(--line-strong) underline-offset-4 transition-colors hover:text-(--accent) hover:decoration-(--accent)"
                >
                  {c.rooms.chatAboutRoom}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {multiple && (
        <>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {category.rooms.map((room) => (
              <li key={room.id}>
                <VariantTile room={room} inquireHref={inquireHref} showBath={bathsDiffer} />
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <a
              href={buildGeneralChatLink(contact, category.rooms)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-(--ink-soft) underline decoration-(--line-strong) underline-offset-4 transition-colors hover:text-(--accent) hover:decoration-(--accent)"
            >
              {c.rooms.chatAboutThese}
            </a>
          </div>
        </>
      )}
    </article>
  );
}

/** One price variant under a category — a visible rate tile: what it's
 *  called, what it costs, whether it's open, what differs, and its own
 *  inquiry CTA. No expander: every option readable at a glance. */
function VariantTile({
  room,
  inquireHref,
  showBath,
}: {
  room: RoomType;
  inquireHref: string;
  showBath: boolean;
}) {
  return (
    <div className="flex h-full flex-col border border-(--line-strong) bg-(--bg-soft) p-6 sm:p-7">
      <h4 className="text-[15.5px] font-semibold leading-snug">{c.rooms.variantLabel(room.name)}</h4>
      {showBath && (
        <p className="mt-1 text-[13px] text-(--ink-muted)">{bathLabel(room)}</p>
      )}
      <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-[1.35rem] font-semibold leading-none tracking-[-0.01em] tabular-nums">
          {formatGhs(room.pricePerYear)}
        </span>
        <span className="text-[12.5px] text-(--ink-muted)">{c.sections.perYear}</span>
      </p>
      <p
        className={`mt-3 flex items-center gap-2 text-[13px] font-medium ${
          room.accepting ? "text-(--accent)" : "text-(--ink-soft)"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${room.accepting ? "bg-(--accent)" : "bg-(--ink-soft)"}`}
        />
        {availabilityLabel(room)}
      </p>
      <p className="mt-4 text-[13.5px] leading-[1.65] text-(--ink-soft)">{room.blurb}</p>
      <div className="mt-auto pt-6">
        <RoomCheckCta
          href={inquireRoomHref(inquireHref, room.name)}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-(--radius) bg-(--accent) px-5 text-[13.5px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
        >
          {room.accepting ? c.cta : c.rooms.joinWaitlist}
        </RoomCheckCta>
      </div>
    </div>
  );
}

function RateCard({ hostel, categories }: { hostel: Hostel; categories: RoomCategory[] }) {
  return (
    <Reveal className="mt-24 sm:mt-32">
      <div className="max-w-3xl border-t border-(--line-strong) pt-12">
        <h3 className="font-(family-name:--font-display) text-[clamp(1.6rem,3vw,2rem)] font-medium tracking-[-0.01em]">
          {c.rateCard.title}
        </h3>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left sm:min-w-135">
            <thead>
              <tr className="border-b border-(--line-strong)">
                {[c.rateCard.room, c.rateCard.sleeps, c.rateCard.bath, c.rateCard.price, c.rateCard.availability].map(
                  (h) => (
                    <th
                      key={h}
                      className={`pb-3.5 pr-4 text-[12.5px] font-medium text-(--ink-muted) ${
                        h === c.rateCard.sleeps || h === c.rateCard.bath
                          ? "hidden sm:table-cell"
                          : ""
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <Fragment key={category.occupancy}>
                  <tr className="border-b border-(--line-strong)">
                    <th
                      colSpan={5}
                      scope="colgroup"
                      className="pb-2 pt-6 text-left text-[12.5px] font-semibold tracking-[0.08em] text-(--ink-muted) uppercase first:pt-4"
                    >
                      {c.rooms.categories[category.occupancy]}
                      {category.rooms.length > 1
                        ? ` — ${c.rooms.optionCount(category.rooms.length)}`
                        : ""}
                    </th>
                  </tr>
                  {category.rooms.map((room) => (
                    <tr key={room.id} className="border-b border-(--line)">
                      <td className="py-4.5 pr-4 text-[15px] font-medium">{room.name}</td>
                      <td className="hidden py-4.5 pr-4 text-[15px] text-(--ink-soft) sm:table-cell">
                        {room.occupancy}
                      </td>
                      <td className="hidden py-4.5 pr-4 text-[15px] text-(--ink-soft) sm:table-cell">
                        {bathLabel(room)}
                      </td>
                      <td className="py-4.5 pr-4 text-[1.05rem] font-semibold tabular-nums">
                        {formatGhs(room.pricePerYear)}
                      </td>
                      <td className="py-4.5 text-[13.5px] font-medium">
                        <span
                          className={`inline-flex items-center gap-2 ${
                            room.accepting ? "text-(--accent)" : "text-(--ink-soft)"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              room.accepting ? "bg-(--accent)" : "bg-(--ink-soft)"
                            }`}
                          />
                          {room.accepting ? availabilityLabel(room) : c.rateCard.waitlist}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-[13.5px] leading-relaxed text-(--ink-muted)">
          {hostel.bookingFee
            ? `${c.booking.feeLabel} ${formatGhs(hostel.bookingFee)} — comes off your first payment. ${c.booking.payVia}: ${hostel.momoName}, ${hostel.momoNumber}.`
            : `${hostel.paymentNote} ${c.booking.payVia}: ${hostel.momoName}, ${hostel.momoNumber}.`}
        </p>
      </div>
    </Reveal>
  );
}

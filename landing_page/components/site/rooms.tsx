import {
  formatGhs,
  type Branch,
  type Hostel,
  type RoomType,
} from "@/lib/mock-hostel";
import { content, availabilityLabel } from "@/lib/content";
import { buildRoomChatLink, type ChatContact } from "@/lib/wa";
import { PhotoCarousel } from "@/components/photo-carousel";
import { RoomCheckCta } from "@/components/room-cta";
import { Reveal } from "@/components/reveal";
import { SectionTitle, bathLabel } from "@/components/site/shared";

/**
 * Rooms & rates — the section a student came for: editorial rows (photo
 * carousel, serif room name, blurb, amenities) with prices as sans
 * tabular figures, closed by the rate card. "Check availability" on a
 * row pre-selects that room in the inquiry form (FR-A3); "Chat about
 * this room" goes to the branch caretaker's WhatsApp (FR-A11).
 */

const c = content;

export function RoomsSection({
  hostel,
  branch,
  contact,
}: {
  hostel: Hostel;
  branch: Branch;
  contact: ChatContact;
}) {
  const rooms = [...branch.rooms].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section id="rooms" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <SectionTitle>{c.sections.rooms}</SectionTitle>
      <div className="mt-16 space-y-24 sm:space-y-32">
        {rooms.map((room, i) => (
          <Reveal key={room.id}>
            <RoomRow contact={contact} room={room} index={i} />
          </Reveal>
        ))}
      </div>
      <RateCard hostel={hostel} rooms={rooms} />
    </section>
  );
}

function RoomRow({ contact, room, index }: { contact: ChatContact; room: RoomType; index: number }) {
  const flipped = index % 2 === 1;
  return (
    <article className="grid items-start gap-10 sm:grid-cols-12 sm:gap-14">
      <div className={`sm:col-span-7 ${flipped ? "sm:order-2" : ""}`}>
        <PhotoCarousel
          photos={room.photos}
          sizes="(min-width: 640px) 58vw, 100vw"
          aspectClassName="aspect-4/3 sm:aspect-3/2"
          className="overflow-hidden"
          showCaptions={false}
        />
      </div>
      <div className={`sm:col-span-5 ${flipped ? "sm:order-1" : ""} sm:pt-1`}>
        <p className="text-[13.5px] font-medium text-(--ink-muted)">
          {c.rooms.sleeps} {room.occupancy}, {bathLabel(room)}
        </p>
        <h3 className="mt-3 font-(family-name:--font-display) text-[clamp(2rem,4vw,2.7rem)] font-medium leading-none tracking-[-0.01em]">
          {room.name}
        </h3>
        <p className="mt-4 text-[15.5px] leading-[1.75] text-(--ink-soft)">{room.blurb}</p>
        <ul className="mt-5 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {room.amenities.map((a) => (
            <li key={a} className="flex items-baseline gap-2.5 text-[13.5px] text-(--ink-soft)">
              <span aria-hidden="true" className="h-1 w-1 shrink-0 -translate-y-px rounded-full bg-(--accent)" />
              {c.amenityLabels[a]}
            </li>
          ))}
        </ul>
        <div className="mt-8 border-t border-(--line-strong) pt-7">
          <p className="flex flex-wrap items-baseline gap-x-3.5">
            <span className="text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold leading-none tracking-[-0.01em] tabular-nums">
              {formatGhs(room.pricePerSemester)}
            </span>
            <span className="text-[13px] text-(--ink-muted)">{c.sections.perSemester}</span>
          </p>
          <p
            className={`mt-3.5 flex items-center gap-2.5 text-[14px] font-medium ${
              room.accepting ? "text-(--accent)" : "text-(--ink-soft)"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${room.accepting ? "bg-(--accent)" : "bg-(--ink-soft)"}`}
            />
            {availabilityLabel(room)}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
            <RoomCheckCta
              roomName={room.name}
              className="inline-flex min-h-12 items-center rounded-(--radius) bg-(--accent) px-7 text-[14px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
            >
              {room.accepting ? c.cta : c.rooms.joinWaitlist}
            </RoomCheckCta>
            <a
              href={buildRoomChatLink(contact, room)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-(--ink-soft) underline decoration-(--line-strong) underline-offset-4 transition-colors hover:text-(--accent) hover:decoration-(--accent)"
            >
              {c.rooms.chatAboutRoom}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function RateCard({ hostel, rooms }: { hostel: Hostel; rooms: RoomType[] }) {
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
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-(--line)">
                  <td className="py-4.5 pr-4 text-[15px] font-medium">{room.name}</td>
                  <td className="hidden py-4.5 pr-4 text-[15px] text-(--ink-soft) sm:table-cell">
                    {room.occupancy}
                  </td>
                  <td className="hidden py-4.5 pr-4 text-[15px] text-(--ink-soft) sm:table-cell">
                    {bathLabel(room)}
                  </td>
                  <td className="py-4.5 pr-4 text-[1.05rem] font-semibold tabular-nums">
                    {formatGhs(room.pricePerSemester)}
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
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-[13.5px] leading-relaxed text-(--ink-muted)">
          {c.booking.feeLabel} {formatGhs(hostel.bookingFee)} — comes off your first
          semester payment. {c.booking.payVia}: {hostel.momoName}, {hostel.momoNumber}.
        </p>
      </div>
    </Reveal>
  );
}

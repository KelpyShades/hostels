"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatGhs,
  minFrom,
  openRooms,
  type Branch,
  type Hostel,
  type RoomType,
} from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { useLiveBranch, useLiveOpen, useLiveRooms } from "@/components/live-data";
import { heroNameLines, shortName } from "@/components/site/shared";

/**
 * Hero — the page's signature moment: the name stacked at signage scale
 * in the display serif, one italic line of voice, and the promise as
 * figures on a hairline, over a slow Ken Burns crossfade.
 *
 * Two variants share the frame (scrims, crossfade, folio-rise entrance):
 * - OrgHero — the hostel as a whole (unit site at `/`, org landing):
 *   org name, org tagline, from-price / walk / open rooms.
 * - BranchHero — one branch of a multi-branch org: the branch's name,
 *   its directions note, its photos, its from-price / open rooms / the
 *   booking fee, and a clear "All locations" chip back to the org view.
 *
 * Scrims are layered so the ivory copy holds even on a bright,
 * white-themed photo (see globals.css contrast notes).
 */

const c = content;

interface HeroFact {
  label: string;
  value: string;
  note?: string;
  dot?: boolean;
}

function HeroFrame({
  images,
  alt,
  eyebrow,
  name,
  tagline,
  facts,
}: {
  images: string[];
  alt: string;
  eyebrow: React.ReactNode;
  name: string;
  tagline: string;
  facts: HeroFact[];
}) {
  const [nameLine1, nameLine2] = heroNameLines(name);
  return (
    <header id="hero" className="relative h-svh min-h-160 overflow-hidden bg-(--deep)">
      <div className="folio-hero absolute inset-0">
        <Image src={images[0]} alt={alt} fill priority sizes="100vw" className="object-cover" />
        {images.slice(1).map((src, i) => (
          <div
            key={src}
            className="folio-fade absolute inset-0"
            style={i === 1 ? { animationDelay: "12s" } : undefined}
          >
            <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        ))}
      </div>
      {/* Crossfade: 24s cycle over a static base; base-only under reduced motion. */}
      <style>{`
        @keyframes folio-fade {
          0%, 24% { opacity: 0; } 32%, 58% { opacity: 1; }
          66%, 100% { opacity: 0; }
        }
        .folio-fade { opacity: 0; animation: folio-fade 24s ease-in-out infinite; }
        @keyframes folio-zoom { from { transform: scale(1); } to { transform: scale(1.07); } }
        .folio-hero img { animation: folio-zoom 70s ease-out forwards; }
        @keyframes folio-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: none; }
        }
        .folio-rise { opacity: 0; animation: folio-rise 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .folio-fade, .folio-hero img, .folio-rise { animation: none; }
          .folio-rise { opacity: 1; }
        }
      `}</style>
      <div aria-hidden="true" className="absolute inset-0 bg-black/15" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/60 to-black/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-black/55 to-transparent"
      />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-5 pb-9 pt-32 sm:px-8 sm:pb-12">
        {eyebrow}
        <h1
          className="folio-rise mt-5 font-(family-name:--font-display) text-[clamp(4rem,13vw,9.5rem)] font-medium leading-[0.92] tracking-[-0.01em] text-(--deep-ink)"
          style={{ animationDelay: "0.12s" }}
        >
          {nameLine1}
          {nameLine2 && (
            <>
              <br />
              {nameLine2}
            </>
          )}
        </h1>
        <p
          className="folio-rise mt-6 max-w-xl font-(family-name:--font-display) text-[clamp(1.3rem,2.8vw,1.75rem)] font-semibold italic leading-[1.4] text-white/95"
          style={{ animationDelay: "0.24s" }}
        >
          {tagline}
        </p>

        {/* Facts bar — the promise in numbers, on a hairline */}
        <dl
          className="folio-rise mt-12 grid grid-cols-3 gap-4 border-t border-white/25 pt-6 sm:gap-10"
          style={{ animationDelay: "0.38s" }}
        >
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[12px] font-medium text-white/80">{fact.label}</dt>
              <dd className="mt-2 flex items-center gap-2.5 text-[clamp(1.1rem,2.6vw,1.6rem)] font-semibold leading-none tracking-[-0.01em] tabular-nums text-(--deep-ink)">
                {fact.dot && (
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-(--brass-bright)" />
                )}
                {fact.value}
              </dd>
              {fact.note && <p className="mt-1.5 text-[11.5px] text-white/75">{fact.note}</p>}
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

/** The hostel as a whole — unit site at `/` and the multi-branch org landing. */
export function OrgHero({
  hostel,
  open,
  rooms,
}: {
  hostel: Hostel;
  open: number;
  rooms: RoomType[];
}) {
  const liveRooms = useLiveRooms(rooms);
  const liveOpen = useLiveOpen(open);
  const from = minFrom(liveRooms);
  return (
    <HeroFrame
      images={hostel.heroImages}
      alt={hostel.name}
      eyebrow={
        <p className="folio-rise text-[13px] font-medium tracking-[0.14em] text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">
          {c.hero.kicker} {hostel.city}
        </p>
      }
      name={hostel.name}
      tagline={hostel.tagline}
      facts={[
        {
          label: c.hero.facts.fromLabel,
          value: from ? formatGhs(from) : c.hero.facts.fromEmpty,
          note: c.sections.perYear,
        },
        {
          label: c.hero.facts.walkLabel,
          value: hostel.walkToCampus,
          note: c.hero.facts.onFoot,
        },
        {
          label: liveOpen > 0 ? c.hero.facts.openLabel : c.properties.fullyBooked,
          value: liveOpen > 0 ? `${liveOpen} rooms` : c.rooms.waitListShort,
          note: liveOpen > 0 ? c.hero.availableNow : undefined,
          dot: liveOpen > 0,
        },
      ]}
    />
  );
}

/** One branch of a multi-branch org — this branch's identity and numbers. */
export function BranchHero({ hostel, branch }: { hostel: Hostel; branch: Branch }) {
  const liveBranch = useLiveBranch(branch);
  const open = openRooms(liveBranch);
  const from = minFrom(liveBranch.rooms);
  return (
    <HeroFrame
      images={liveBranch.photos.map((p) => p.src)}
      alt={liveBranch.name}
      eyebrow={
        <Link
          href="/"
          className="folio-rise inline-flex max-w-max min-h-10 items-center gap-2 rounded-(--radius) border border-(--deep-ink)/40 px-4 text-[12.5px] font-semibold text-(--deep-ink) transition-colors hover:bg-(--deep-ink)/10"
        >
          <span aria-hidden="true">←</span>
          {c.nav.allLocations}
        </Link>
      }
      name={shortName(liveBranch.name)}
      tagline={`${liveBranch.directionsNote}.`}
      facts={[
        {
          label: c.hero.facts.fromLabel,
          value: from ? formatGhs(from) : c.hero.facts.fromEmpty,
          note: c.sections.perYear,
        },
        {
          label: open > 0 ? c.hero.facts.openLabel : c.properties.fullyBooked,
          value: open > 0 ? `${open} rooms` : c.rooms.waitListShort,
          note: open > 0 ? c.hero.availableNow : undefined,
          dot: open > 0,
        },
        hostel.bookingFee
          ? {
              label: c.booking.feeLabel,
              value: formatGhs(hostel.bookingFee),
              note: c.hero.facts.feeNote,
            }
          : {
              label: c.hero.facts.walkLabel,
              value: hostel.walkToCampus,
              note: c.hero.facts.onFoot,
            },
      ]}
    />
  );
}

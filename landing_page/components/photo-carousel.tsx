"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Photo } from "@/lib/mock-hostel";

/**
 * Shared photo carousel — every room and branch is multi-photo (SPEC.md §5).
 * Mobile: horizontal swipe (scroll-snap, no library). Desktop: arrows on hover.
 * First image may load eagerly (hero/above-fold); the rest are lazy (NFR-4).
 * Dots scroll with container.scrollTo — never scrollIntoView (huashu rule:
 * it breaks container scrolling).
 */

export function PhotoCarousel({
  photos,
  sizes,
  aspectClassName = "aspect-4/3",
  className = "",
  priority = false,
  showCaptions = true,
  showCount = true,
  showDots = true,
}: {
  photos: Photo[];
  sizes: string; // next/image sizes prop — caller knows layout context
  aspectClassName?: string;
  className?: string;
  priority?: boolean; // first image above the fold?
  showCaptions?: boolean;
  showCount?: boolean;
  showDots?: boolean; // false when a glass card overlaps the photo's bottom edge
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const multiple = photos.length > 1;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  const step = (delta: number) => {
    const next = Math.min(Math.max(active + delta, 0), photos.length - 1);
    goTo(next);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== active) setActive(next);
  };

  return (
    <div className={`group/car relative ${className}`}>
      <section
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-none"
        aria-roledescription="carousel"
        aria-label="Photo carousel"
      >
        {photos.map((photo, i) => (
          <figure
            key={photo.src}
            className={`relative w-full shrink-0 snap-center ${aspectClassName}`}
          >
            <Image
              src={photo.src}
              alt={photo.caption ?? ""}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              loading={priority && i === 0 ? "eager" : "lazy"}
              className="object-cover"
            />
            {showCaptions && photo.caption && (
              <figcaption className="absolute bottom-2 left-2 max-w-[85%] truncate bg-black/40 px-2 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-[2px]">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </section>

      {multiple && (
        <>
          {showCount && (
            <span
              aria-live="polite"
              className="absolute right-2.5 top-2.5 rounded-sm bg-black/45 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
            >
              {active + 1}/{photos.length}
            </span>
          )}

          {showDots && (
            <>
              {/* Dot scrim — keeps the dots readable on bright photos */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/35 to-transparent"
              />
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {photos.map((photo, i) => (
                  <button
                    key={`dot-${photo.src}`}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    aria-current={active === i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      active === i ? "bg-white" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 transition-opacity duration-200 group-hover/car:opacity-100 focus-visible:opacity-100 sm:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 transition-opacity duration-200 group-hover/car:opacity-100 focus-visible:opacity-100 sm:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

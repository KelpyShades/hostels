import Image from "next/image";
import { content } from "@/lib/content";
import type { Hostel } from "@/lib/mock-hostel";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/site/shared";

/**
 * Around the house — one wide frame, then a row of portraits, captions in
 * the italic display face. Slow zoom on hover (reduced-motion safe).
 */

const c = content;

export function GallerySection({ hostel }: { hostel: Hostel }) {
  return (
    <section id="gallery" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <SectionTitle>{c.sections.gallery}</SectionTitle>
      <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-12">
        {hostel.gallery.map((photo, i) => {
          const wide = i === 0;
          return (
            <Reveal key={photo.src} className={wide ? "sm:col-span-12" : "sm:col-span-4"}>
              <figure>
                <div
                  className={`group relative overflow-hidden ${wide ? "aspect-video" : "aspect-4/5"}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    sizes={wide ? "100vw" : "(min-width: 640px) 33vw, 100vw"}
                    className="object-cover transition-transform duration-1200 ease-out motion-safe:group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-3 font-(family-name:--font-display) text-[15px] font-semibold italic text-(--ink-soft)">
                  {photo.caption}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WhatsAppGlyph } from "@/components/inquiry-form";

/**
 * Scroll-aware nav: transparent over the hero photo, then a deep-green
 * glass bar once the visitor scrolls — so the way out (and the CTA)
 * stays reachable at every scroll position.
 *
 * - `switcher` slot: the branch switcher on multi-branch sites; nothing
 *   on a unit hostel or the org view.
 * - Links hide below lg (a switcher + sections would overflow a tablet
 *   navbar); the text CTA hides below sm, replaced by a compact
 *   WhatsApp button so a chat action exists on every screen (FR-A11).
 */

export interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({
  wordmark,
  wordmarkHref,
  links,
  ctaLabel,
  ctaHref,
  chatHref,
  chatLabel,
  switcher,
}: {
  wordmark: string;
  wordmarkHref: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  chatHref: string;
  chatLabel: string;
  switcher?: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Site"
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-white/10 bg-(--deep)/85"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href={wordmarkHref}
            className="min-w-0 truncate text-[12px] font-semibold uppercase tracking-[0.18em] text-(--deep-ink) sm:text-[13.5px] sm:tracking-[0.22em]"
          >
            {wordmark}
          </Link>
          {switcher}
        </div>
        <div className="hidden items-center gap-8 text-[13.5px] font-medium text-(--deep-ink)/75 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-(--deep-ink)"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={ctaHref}
            className="hidden min-h-10 items-center border border-(--deep-ink)/35 px-4 text-[13px] font-semibold text-(--deep-ink) transition-colors hover:bg-(--deep-ink)/10 sm:inline-flex sm:px-5"
          >
            {ctaLabel}
          </a>
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={chatLabel}
            className="flex h-10 w-10 items-center justify-center border border-(--deep-ink)/35 text-(--deep-ink) transition-colors hover:bg-(--deep-ink)/10 sm:hidden"
          >
            <WhatsAppGlyph className="h-4.5 w-4.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

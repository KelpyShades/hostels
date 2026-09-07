"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";

/**
 * Branch switcher for multi-branch orgs: one nav slot regardless of
 * branch count. The trigger shows the current branch (just "Locations"
 * on small screens, where the hero carries the identity); the menu
 * leads with "All locations" back to the org view, then every branch
 * with its open-room count. Closes on Escape, outside click, and after
 * choosing.
 */

const c = content;

export interface BranchOption {
  slug: string;
  name: string;
  open: number;
}

export function BranchSwitcher({
  currentSlug,
  currentName,
  options,
}: {
  currentSlug: string;
  currentName: string;
  options: BranchOption[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-10 items-center gap-2 border border-(--deep-ink)/35 px-3.5 text-[13px] font-semibold text-(--deep-ink) transition-colors hover:bg-(--deep-ink)/10 sm:px-4"
      >
        <span className="sm:hidden">{c.nav.locations}</span>
        <span className="hidden sm:inline">{currentName}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={c.nav.locations}
          className="fixed inset-x-5 top-18 z-50 max-h-100 overflow-y-auto border border-white/10 bg-(--deep) text-(--deep-ink) shadow-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:w-72"
        >
          <Link
            href="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block border-b border-white/10 px-5 py-4 text-[13px] font-semibold transition-colors hover:bg-white/5"
          >
            {c.nav.allLocations}
          </Link>
          <ul>
            {options.map((o) => {
              const current = o.slug === currentSlug;
              return (
                <li key={o.slug}>
                  <Link
                    href={`/b/${o.slug}`}
                    role="menuitem"
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 text-[13.5px] transition-colors hover:bg-white/5 ${
                      current ? "font-semibold text-(--brass-bright)" : "text-(--deep-ink)/85"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {current && (
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-(--brass-bright)"
                        />
                      )}
                      {o.name}
                    </span>
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-(--deep-ink)/60">
                      {o.open > 0 ? `${o.open} ${c.properties.roomsOpen}` : c.properties.fullyBooked}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

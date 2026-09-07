"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Visibility logic for the mobile sticky availability bar (hotel
 * booking-bar pattern). Appears after the visitor scrolls past ~85% of
 * the viewport; hides when the inquiry section is on screen so it never
 * covers the form's submit button. Styling/positioning classes are the
 * direction's (className prop) — this component only toggles visibility.
 *
 * All setState calls happen in async callbacks (rAF / scroll / IO),
 * never synchronously inside the effect body.
 */

export function ScrollAppear({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let inquireVisible = false;
    const update = () =>
      setShown(!inquireVisible && window.scrollY > window.innerHeight * 0.85);

    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });

    // Hide while the inquiry form is in view (don't cover its submit).
    const inquire = document.getElementById("inquire");
    let observer: IntersectionObserver | null = null;
    if (inquire) {
      observer = new IntersectionObserver(
        ([entry]) => {
          inquireVisible = entry.isIntersecting;
          update();
        },
        { threshold: 0.08 },
      );
      observer.observe(inquire);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!shown}
      className={`${className} transition-transform duration-300 ease-out ${
        shown ? "translate-y-0" : "translate-y-[130%]"
      }`}
    >
      {children}
    </div>
  );
}

import Link from "next/link";
import { content } from "@/lib/content";

/**
 * Branded 404 (SPEC.md §6.2) — never the default Next.js page.
 * Wrong branch slug lands here, on the Folio design system.
 */
export default function NotFound() {
  const t = content.notFound;
  return (
    <main className="dir-folio flex min-h-screen flex-col items-center justify-center bg-(--bg) px-6 text-center font-(family-name:--font-body) text-(--ink) antialiased">
      <p className="text-[13px] font-medium tracking-[0.14em] text-(--ink-muted)">
        {t.eyebrow}
      </p>
      <h1 className="mt-4 max-w-md font-(family-name:--font-display) text-[clamp(2rem,5vw,3rem)] font-medium leading-tight tracking-[-0.01em]">
        {t.title}
      </h1>
      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-(--ink-soft)">{t.body}</p>
      <Link
        href="/"
        className="mt-9 inline-flex min-h-12 items-center rounded-(--radius) bg-(--accent) px-7 text-[14.5px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
      >
        {t.backHome}
      </Link>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  formatGhs,
  minFrom,
  openRooms,
  type Branch,
  type Hostel,
} from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { branchContact, buildGeneralChatLink, orgContact } from "@/lib/wa";
import { SiteNav, type NavLink } from "@/components/site/site-nav";
import { InquiryForm } from "@/components/inquiry-form";
import { ClosingFooter } from "@/components/site/closing-footer";
import { StickyBar } from "@/components/site/sticky-bar";
import { useLiveBranches } from "@/components/live-data";

/**
 * The dedicated inquiry page (shareable — SPEC.md FR-A8, elevated to a
 * route 2026-09-08): the whole page's job is one form.
 *
 * Surfaces:
 * - Unit hostel (/inquire) — the form for the single implicit branch.
 * - One branch (/b/[slug]/inquire) — the form, caretaker-addressed.
 * - Multi-branch org (/inquire with no branch) — FR-A0's picker pattern
 *   first ("Which location are you asking about?"), then the form scoped
 *   to the chosen branch: its rooms, its caretaker's WhatsApp.
 *
 * A ?room=… param pre-selects that room (FR-A3) when it exists in the
 * branch being rendered; on the org page it auto-picks the first branch
 * carrying that room.
 */

const c = content;

export function InquiryPage({
  hostel,
  branches,
  fixedBranch,
  links,
  preselectedRoom,
}: {
  hostel: Hostel;
  /** All branches (multi) — drives the org-level picker. */
  branches: Branch[];
  /** The branch to render for, when the page is already branch-scoped. */
  fixedBranch?: Branch;
  links: NavLink[];
  preselectedRoom?: string;
}) {
  const chatHref = buildGeneralChatLink(
    fixedBranch ? branchContact(hostel, fixedBranch) : orgContact(hostel),
    fixedBranch ? fixedBranch.rooms : branches.flatMap((b) => b.rooms),
  );
  const open = fixedBranch
    ? openRooms(fixedBranch)
    : branches.reduce((n, b) => n + openRooms(b), 0);
  const backHref = fixedBranch
    ? hostel.mode === "unit"
      ? "/#rooms"
      : `/b/${fixedBranch.slug}#rooms`
    : "/#properties";

  return (
    <div className="dir-folio flex min-h-screen flex-col bg-(--bg) font-(family-name:--font-body) text-(--ink) antialiased">
      <SiteNav
        wordmark={hostel.name.replace(/ Hostel$/, "")}
        wordmarkHref="/"
        links={links}
        ctaLabel={c.nav.rooms}
        ctaHref={backHref}
        chatHref={chatHref}
        chatLabel={c.chat.floatingAction}
      />

      {/* The dark band — a calm registration-desk moment on --deep, no
          photo: the page's one job is the form, not the sales pitch. */}
      <header className="bg-(--deep) text-(--deep-ink)">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36">
          <Link
            href={backHref}
            className="inline-flex min-h-10 items-center gap-2 rounded-(--radius) border border-(--deep-ink)/40 px-4 text-[12.5px] font-semibold text-(--deep-ink) transition-colors hover:bg-(--deep-ink)/10"
          >
            <span aria-hidden="true">←</span>
            {c.inquirePage.backToRooms}
          </Link>
          <p className="mt-9 text-[13px] font-medium tracking-[0.14em] text-white/80">
            {hostel.name}
          </p>
          <h1 className="mt-4 font-(family-name:--font-display) text-[clamp(3rem,8vw,5rem)] font-medium leading-[1.02] tracking-[-0.01em]">
            {c.sections.inquire}
          </h1>
          <p className="mt-5 max-w-xl font-(family-name:--font-display) text-[clamp(1.15rem,2.4vw,1.5rem)] font-semibold italic leading-[1.45] text-white/90">
            {fixedBranch?.directionsNote
              ? `${fixedBranch.directionsNote}.`
              : hostel.tagline}
          </p>
        </div>
      </header>

      {/* id="inquire" — the sticky bar stays out of the form's way
          (ScrollAppear hides while this is in view). */}
      <main id="inquire" className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
          {fixedBranch ? (
            <InquiryCard
              hostel={hostel}
              branch={fixedBranch}
              preselectedRoom={preselectedRoom}
            />
          ) : (
            <OrgInquiry
              hostel={hostel}
              branches={branches}
              preselectedRoom={preselectedRoom}
            />
          )}
        </div>
      </main>

      <ClosingFooter hostel={hostel} links={links} ctaHref={backHref} chatHref={chatHref} />
      <StickyBar open={open} ctaHref="#inquire" chatHref={chatHref} />
    </div>
  );
}

/** The form in its hairline "registration card". */
function InquiryCard({
  hostel,
  branch,
  preselectedRoom,
}: {
  hostel: Hostel;
  branch: Branch;
  preselectedRoom?: string;
}) {
  const contact = branchContact(hostel, branch);
  const room =
    preselectedRoom && branch.rooms.some((r) => r.name === preselectedRoom)
      ? preselectedRoom
      : undefined;
  return (
    <div className="border border-(--line-strong) bg-(--bg-soft) p-6 sm:p-10">
      <InquiryForm
        contact={contact}
        rooms={branch.rooms}
        branchId={branch.id}
        preselectedRoom={room}
      />
    </div>
  );
}

/** Org-level flow (multi-branch): pick the location, then the form —
 *  scoped to that branch's rooms and caretaker. */
function OrgInquiry({
  hostel,
  branches,
  preselectedRoom,
}: {
  hostel: Hostel;
  branches: Branch[];
  preselectedRoom?: string;
}) {
  const liveBranches = useLiveBranches(branches);
  // ?room=… may name the branch for us — the first one carrying that room.
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (!preselectedRoom) return null;
    const carrier = liveBranches.find((b) =>
      b.rooms.some((r) => r.name === preselectedRoom),
    );
    return carrier?.id ?? null;
  });

  const selected = liveBranches.find((b) => b.id === selectedId);

  if (!selected) {
    return (
      <section aria-label={c.inquirePage.branchQuestion}>
        <h2 className="font-(family-name:--font-display) text-[clamp(1.6rem,3.4vw,2.1rem)] font-medium tracking-[-0.01em]">
          {c.inquirePage.branchQuestion}
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-(--ink-soft)">
          {c.inquirePage.branchHint}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {liveBranches.map((branch) => (
            <li key={branch.id}>
              <BranchOption
                branch={branch}
                onSelect={() => setSelectedId(branch.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-3 text-[13.5px] text-(--ink-muted)">
        <span>
          {c.inquirePage.askingAt} <strong className="font-semibold text-(--ink)">{selected.name}</strong>
        </span>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="cursor-pointer font-medium text-(--ink-soft) underline decoration-(--line-strong) underline-offset-4 transition-colors hover:text-(--accent) hover:decoration-(--accent)"
        >
          {c.inquirePage.changeLocation}
        </button>
      </p>
      {/* key: switching branch remounts the form with its rooms */}
      <div className="mt-5">
        <InquiryCard
          hostel={hostel}
          branch={selected}
          preselectedRoom={preselectedRoom}
        />
      </div>
    </div>
  );
}

/** One selectable location — name, live availability, from-price. */
function BranchOption({
  branch,
  onSelect,
}: {
  branch: Branch;
  onSelect: () => void;
}) {
  const open = openRooms(branch);
  const from = minFrom(branch.rooms);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={false}
      className="flex h-full w-full cursor-pointer flex-col items-start border border-(--line-strong) bg-(--bg-soft) p-6 text-left transition-colors hover:border-(--accent)"
    >
      <span className="text-[16px] font-semibold">{branch.name}</span>
      <span className="mt-2 text-[13.5px] leading-relaxed text-(--ink-soft)">
        {branch.directionsNote}
      </span>
      <span className="mt-4 flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-[1.15rem] font-semibold leading-none tabular-nums">
          {from ? formatGhs(from) : c.hero.facts.fromEmpty}
        </span>
        <span className="text-[12.5px] text-(--ink-muted)">
          {c.rooms.from} · {c.sections.perYear}
        </span>
      </span>
      <span
        className={`mt-3 flex items-center gap-2 text-[13px] font-medium ${
          open > 0 ? "text-(--accent)" : "text-(--ink-soft)"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${open > 0 ? "bg-(--accent)" : "bg-(--ink-soft)"}`}
        />
        {open > 0 ? `${open} ${c.properties.roomsOpen}` : c.properties.fullyBooked}
      </span>
    </button>
  );
}

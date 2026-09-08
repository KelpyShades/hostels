import { content } from "@/lib/content";
import type { Branch, Hostel } from "@/lib/mock-hostel";
import { openRooms } from "@/lib/mock-hostel";
import { branchContact, buildGeneralChatLink } from "@/lib/wa";
import { SiteNav, type NavLink } from "@/components/site/site-nav";
import { BranchSwitcher } from "@/components/site/branch-switcher";
import { OrgHero, BranchHero } from "@/components/site/hero";
import { RoomsSection } from "@/components/site/rooms";
import { Ledger } from "@/components/site/ledger";
import { GuideSection } from "@/components/site/guide";
import { GoodToKnowSection } from "@/components/site/good-to-know";
import { FindingUsSection } from "@/components/site/finding-us";
import { ClosingFooter } from "@/components/site/closing-footer";
import { StickyBar } from "@/components/site/sticky-bar";
import { shortName, wordmarkText } from "@/components/site/shared";

/**
 * The hostel site — "Folio" design (2026-09-07).
 *
 * A hotel-folio reading of a student hostel: the premium here is calm
 * assurance, not marble. Cormorant display type at signage scale, a
 * bone-paper ground with deep-forest dark beats, brass figures reserved
 * for the dark, hairline rules everywhere pills used to be.
 *
 * One composition, two surfaces (SPEC.md §6.1): the unit hostel at `/`
 * (org hero, no switcher) and one branch of a multi-branch org at
 * `/b/[slug]` (branch hero with the branch's name, photos and figures,
 * plus the switcher). Chats and inquiries go to the branch caretaker
 * when the branch has its own line, the org otherwise (SPEC.md §5).
 *
 * All copy: lib/content.ts. All data: lib/mock-hostel.ts.
 */

const c = content;

export function HostelSite({
  hostel,
  branch,
  siblingBranches,
}: {
  hostel: Hostel;
  branch: Branch;
  siblingBranches?: Branch[];
}) {
  const open = openRooms(branch);
  const contact = branchContact(hostel, branch);
  const chatHref = buildGeneralChatLink(contact, branch.rooms);
  // The dedicated, shareable inquiry page (2026-09-08): every CTA on
  // this site leads there; room CTAs add ?room=… pre-selection.
  const inquireHref =
    hostel.mode === "unit" ? "/inquire" : `/b/${branch.slug}/inquire`;

  const sectionLinks: NavLink[] = [
    { href: "#rooms", label: c.nav.rooms },
    { href: "#location", label: c.nav.location },
  ];

  const switcher = siblingBranches ? (
    <BranchSwitcher
      currentSlug={branch.slug}
      currentName={shortName(branch.name)}
      branches={siblingBranches}
    />
  ) : undefined;

  return (
    <div className="dir-folio min-h-screen bg-(--bg) font-(family-name:--font-body) text-(--ink) antialiased">
      <SiteNav
        wordmark={wordmarkText(hostel.name)}
        wordmarkHref="/"
        links={sectionLinks}
        ctaLabel={c.cta}
        ctaHref={inquireHref}
        chatHref={chatHref}
        chatLabel={c.chat.floatingAction}
        switcher={switcher}
      />

      {siblingBranches ? (
        <BranchHero hostel={hostel} branch={branch} />
      ) : (
        <OrgHero hostel={hostel} open={open} rooms={branch.rooms} />
      )}

      <main>
        {/* Rooms & rates — first after the hero: it's what visitors came for */}
        <RoomsSection
          hostel={hostel}
          branch={branch}
          contact={contact}
          inquireHref={inquireHref}
        />
        <Ledger hostel={hostel} />
        <GuideSection hostel={hostel} />
        <GoodToKnowSection hostel={hostel} />
        <FindingUsSection hostel={hostel} branch={branch} />
      </main>

      <ClosingFooter hostel={hostel} links={sectionLinks} ctaHref={inquireHref} chatHref={chatHref} />
      <StickyBar open={open} branchId={branch.id} ctaHref={inquireHref} chatHref={chatHref} />
    </div>
  );
}

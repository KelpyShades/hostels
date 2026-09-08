import { content } from "@/lib/content";
import type { Branch, Hostel } from "@/lib/mock-hostel";
import { openRooms } from "@/lib/mock-hostel";
import { orgContact, buildGeneralChatLink } from "@/lib/wa";
import { SiteNav, type NavLink } from "@/components/site/site-nav";
import { OrgHero } from "@/components/site/hero";
import { PropertiesSection } from "@/components/site/properties";
import { Ledger } from "@/components/site/ledger";
import { ClosingFooter } from "@/components/site/closing-footer";
import { StickyBar } from "@/components/site/sticky-bar";
import { wordmarkText } from "@/components/site/shared";

/**
 * The org view — what `/` renders for a multi-branch hostel
 * (SPEC.md §6.1): the brand as a whole (hero with org-wide figures),
 * the branch picker leading into each branch's full site, and the
 * org-wide assurance ledger. No inquiry form here — conversations
 * happen on the branch sites, with each branch's own caretaker.
 */

const c = content;

export function OrgLanding({
  hostel,
  branches,
}: {
  hostel: Hostel;
  branches: Branch[];
}) {
  const totalOpen = branches.reduce((n, b) => n + openRooms(b), 0);
  const allRooms = branches.flatMap((b) => b.rooms);
  const chatHref = buildGeneralChatLink(orgContact(hostel), allRooms);

  const navLinks: NavLink[] = [
    { href: "#properties", label: c.nav.locations },
    { href: "#practical", label: c.nav.practical },
  ];

  return (
    <div className="dir-folio min-h-screen bg-(--bg) font-(family-name:--font-body) text-(--ink) antialiased">
      <SiteNav
        wordmark={wordmarkText(hostel.name)}
        wordmarkHref="/"
        links={navLinks}
        ctaLabel={c.cta}
        ctaHref="#properties"
        chatHref={chatHref}
        chatLabel={c.chat.floatingAction}
      />

      <OrgHero hostel={hostel} open={totalOpen} rooms={allRooms} />

      <main>
        {/* The picker is this page's job — it comes first */}
        <PropertiesSection branches={branches} />
        <Ledger hostel={hostel} />
      </main>

      <ClosingFooter hostel={hostel} links={navLinks} ctaHref="#properties" chatHref={chatHref} />
      <StickyBar open={totalOpen} ctaHref="#properties" chatHref={chatHref} />
    </div>
  );
}

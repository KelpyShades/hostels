import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/site-data";
import { content } from "@/lib/content";
import { metaDescription } from "@/lib/live";
import { InquiryPage } from "@/components/site/inquiry-page";
import type { NavLink } from "@/components/site/site-nav";

/**
 * The shareable inquiry page (FR-A8 as a route, 2026-09-08).
 * Unit hostel: the form for the single implicit branch, ?room=… allowed.
 * Multi-branch org: the location picker first ("Which location are you
 * asking about?"), then the form scoped to the chosen branch — so one
 * link serves the whole org while each inquiry still lands with the
 * right caretaker. Branch-scoped links (/b/[slug]/inquire) skip the
 * picker.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSite();
  return {
    title: `${content.sections.inquire} — ${site.hostel.name}`,
    description: metaDescription(site),
  };
}

export default async function InquirePage({
  searchParams,
}: PageProps<"/inquire">) {
  const { site } = await getSite();
  // ?room= can arrive as string[] if repeated — take the first.
  const roomParam = (await searchParams).room;
  const room = Array.isArray(roomParam) ? roomParam[0] : roomParam;

  const unitBranch = site.hostel.mode === "unit" ? site.branches[0] : undefined;
  if (site.hostel.mode === "unit" && !unitBranch) notFound();

  const links: NavLink[] =
    site.hostel.mode === "unit"
      ? [
          { href: "/#rooms", label: content.nav.rooms },
          { href: "/#location", label: content.nav.location },
        ]
      : [
          { href: "/#properties", label: content.nav.locations },
          { href: "/#practical", label: content.nav.practical },
        ];

  return (
    <InquiryPage
      hostel={site.hostel}
      branches={site.branches}
      fixedBranch={unitBranch}
      links={links}
      preselectedRoom={room}
    />
  );
}

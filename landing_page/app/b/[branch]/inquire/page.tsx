import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSite } from "@/lib/site-data";
import { content } from "@/lib/content";
import { metaDescription } from "@/lib/live";
import { InquiryPage } from "@/components/site/inquiry-page";
import type { NavLink } from "@/components/site/site-nav";

/**
 * Branch inquiry page (multi-branch hostels only): the dedicated inquiry
 * form pre-scoped to this branch — its rooms, its caretaker's WhatsApp,
 * and ?room=… pre-selection from that branch's room CTAs. Unit hostels
 * redirect to /inquire (structural mismatch, not an error); unknown
 * slugs get the branded 404 — same routing contract as /b/[branch].
 */

type Props = PageProps<"/b/[branch]/inquire">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: branchSlug } = await params;
  const { site } = await getSite();
  const branch = site.branches.find((b) => b.slug === branchSlug);
  if (!branch) return {};
  return {
    title: `${content.sections.inquire} — ${branch.name}, ${site.hostel.name}`,
    description: metaDescription(site),
  };
}

export default async function BranchInquirePage({
  params,
  searchParams,
}: Props) {
  const { site } = await getSite();

  // Unit hostel: the branch-scoped path is a mismatch → /inquire.
  if (site.hostel.mode === "unit") redirect("/inquire");

  const { branch: branchSlug } = await params;
  const branch = site.branches.find((b) => b.slug === branchSlug);
  if (!branch) notFound();

  // ?room= can arrive as string[] if repeated — take the first.
  const roomParam = (await searchParams).room;
  const room = Array.isArray(roomParam) ? roomParam[0] : roomParam;

  const links: NavLink[] = [
    { href: `/b/${branch.slug}#rooms`, label: content.nav.rooms },
    { href: `/b/${branch.slug}#location`, label: content.nav.location },
  ];

  return (
    <InquiryPage
      hostel={site.hostel}
      branches={site.branches}
      fixedBranch={branch}
      links={links}
      preselectedRoom={room}
    />
  );
}

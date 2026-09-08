import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSite } from "@/lib/site-data";
import { metaDescription } from "@/lib/live";
import { HostelSite } from "@/components/site/hostel-site";

/**
 * Branch site (multi-branch hostels only, SPEC.md §6.1/§6.2): the same
 * full site as a unit hostel, scoped to one branch, with sibling-branch
 * links in the nav. Any branch path on a unit hostel redirects home
 * (structural mismatch, not an error); unknown slugs get the branded 404.
 *
 * Branch slugs come from the merged site data: a branch whose name
 * matches the static shell keeps its curated slug; branches created in
 * the dashboard get a slug derived from their name (lib/live.ts).
 */

type Props = PageProps<"/b/[branch]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: branchSlug } = await params;
  const { site } = await getSite();
  const branch = site.branches.find((b) => b.slug === branchSlug);
  if (!branch) return {};
  return {
    title: `${branch.name} — ${site.hostel.name}`,
    description: branch.directionsNote
      ? `${branch.name}. ${branch.directionsNote}`
      : metaDescription(site),
  };
}

export default async function BranchPage({ params }: Props) {
  const { site } = await getSite();

  // Unit hostel: a branch path is a structural mismatch → redirect home.
  if (site.hostel.mode === "unit") redirect("/");

  const { branch: branchSlug } = await params;
  const branch = site.branches.find((b) => b.slug === branchSlug);
  if (!branch) notFound();

  return <HostelSite hostel={site.hostel} branch={branch} siblingBranches={site.branches} />;
}

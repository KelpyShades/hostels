import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getHostel, getBranches } from "@/lib/mock-hostel";
import { HostelSite } from "@/components/site/hostel-site";

/**
 * Branch site (multi-branch hostels only, SPEC.md §6.1/§6.2): the same
 * full site as a unit hostel, scoped to one branch, with sibling-branch
 * links in the nav. Any branch path on a unit hostel redirects home
 * (structural mismatch, not an error); unknown slugs get the branded 404.
 */

type Props = PageProps<"/b/[branch]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: branchSlug } = await params;
  const hostel = getHostel();
  const branch = getBranches().find((b) => b.slug === branchSlug);
  if (!branch) return {};
  return {
    title: `${branch.name} — ${hostel.name}`,
    description: `${branch.name}. ${hostel.tagline}`,
  };
}

export default async function BranchPage({ params }: Props) {
  const hostel = getHostel();

  // Unit hostel: a branch path is a structural mismatch → redirect home.
  if (hostel.mode === "unit") redirect("/");

  const { branch: branchSlug } = await params;
  const branches = getBranches();
  const branch = branches.find((b) => b.slug === branchSlug);
  if (!branch) notFound();

  return <HostelSite hostel={hostel} branch={branch} siblingBranches={branches} />;
}

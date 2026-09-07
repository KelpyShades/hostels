import type { Metadata } from "next";
import { getHostel, getBranches } from "@/lib/mock-hostel";
import { HostelSite } from "@/components/site/hostel-site";
import { OrgLanding } from "@/components/site/org-landing";

/**
 * Hostel entry (SPEC.md §6.1) — the deployment root IS the hostel
 * (HOSTEL_SLUG env var in production; demo default in dev).
 * Unit mode: this page is the whole site — next action: rooms & rates.
 * Multi mode: the org view — brand + branch picker, leading into each
 * branch's full site at /b/[branch].
 */

export async function generateMetadata(): Promise<Metadata> {
  const hostel = getHostel();
  return {
    title: `${hostel.name} — ${hostel.area}`,
    description: hostel.tagline,
  };
}

export default async function HostelEntryPage() {
  const hostel = getHostel();
  const branches = getBranches();

  return hostel.mode === "multi" ? (
    <OrgLanding hostel={hostel} branches={branches} />
  ) : (
    <HostelSite hostel={hostel} branch={branches[0]} />
  );
}

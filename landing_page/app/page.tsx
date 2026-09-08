import { notFound } from "next/navigation";
import { getSite } from "@/lib/site-data";
import { HostelSite } from "@/components/site/hostel-site";
import { OrgLanding } from "@/components/site/org-landing";

/**
 * Hostel entry (SPEC.md §6.1) — the deployment root IS the hostel
 * (HOSTEL_ID env var in production; demo default in dev).
 * Unit mode: this page is the whole site — next action: rooms & rates.
 * Multi mode: the org view — brand + branch picker, leading into each
 * branch's full site at /b/[branch].
 *
 * Server side this renders the ISR-fresh merge of the static shell and
 * live Convex data; the client subscription (components/live-data.tsx)
 * keeps rooms and prices current between revalidations.
 *
 * No page-level metadata: the root layout's live-data metadata (hostel
 * name + live room stats + OG image) applies to the homepage too.
 */

export default async function HostelEntryPage() {
  const { site } = await getSite();

  if (site.hostel.mode === "multi") {
    return <OrgLanding hostel={site.hostel} branches={site.branches} />;
  }

  // Unit hostels keep one implicit branch; if the hostel hasn't been set
  // up yet (no branch row), there is nothing to serve.
  const branch = site.branches[0];
  if (!branch) notFound();

  return <HostelSite hostel={site.hostel} branch={branch} />;
}

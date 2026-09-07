/**
 * Demo verification (no image reading — HTML/text assertions only).
 * Fetches the running site's server-rendered HTML and asserts: the
 * org → branch flow (multi-mode demo hostel), every section present,
 * carousels multi-photo, WhatsApp links, and routing behavior.
 *
 * Usage: node scripts/verify-site.mjs [baseUrl]
 * Requires: `next start` (or `pnpm dev`) already running.
 * Note: this checks SSR output (client components SSR their initial
 * markup too). Interaction-level checks (swipe, scroll) are a manual
 * pass in the browser. The unit-mode redirect (/b/* → /) is also manual:
 * flip MODE in lib/mock-hostel.ts — one mode per demo run (SPEC.md §6.1).
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";

async function getPage(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
  return { status: res.status, html: await res.text() };
}

let failures = 0;
function check(label, ok) {
  if (!ok) failures++;
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
}

console.log("\n=== org view (/) — multi-mode hostel ===");
const { status, html: org } = await getPage("/");
check(`page 200 (got ${status})`, status === 200);
check("hero", org.includes('id="hero"') && org.includes("<h1"));
check("hero top scrim", org.includes("from-black/55"));
check("hero full view height", org.includes("h-svh"));
check("org-wide from-price in hero", org.includes("Rooms from") && org.includes("GHS 1,750"));
check("branch picker", org.includes('id="properties"') && org.includes("Choose your location"));
check("branch links into branch sites", org.includes('href="/b/main"') && org.includes('href="/b/annex"'));
check("compare table", org.includes("At a glance"));
check("org ledger (practical things)", org.includes('id="practical"') && org.includes("The practical things"));
check("branch carousels", (org.match(/Photo carousel/g) ?? []).length >= 2);
check("no inquiry form on org view", !org.includes('id="inquire"'));
check("no house/about section", !org.includes('id="about"'));
check("org chat uses the org line", org.includes("https://wa.me/233550000000"));
check("no branch switcher on the org view", !org.includes('aria-haspopup="menu"'));
check("one h1", (org.match(/<h1/g) ?? []).length === 1);

console.log("\n=== branch site (/b/main) — the unit-hotel view ===");
const { html: main } = await getPage("/b/main");
check("nav + hero", main.includes('id="hero"') && main.includes("<h1"));
check("rooms section", main.includes('id="rooms"'));
check("rooms first after hero", main.indexOf('id="rooms"') < main.indexOf('id="guide"'));
check("rate card title", main.includes("Rates at a glance"));
check("guide section", main.includes('id="guide"') && main.includes("How to book"));
check("guide steps", main.includes("Come and see") && main.includes("Hold your room"));
check("gallery section", main.includes('id="gallery"'));
check("good to know (rules + faqs)", main.includes('id="good-to-know"') && main.includes("House rules"));
check("faqs render", main.includes("Is the booking fee part of the rent?"));
check("no testimonial section", !main.includes("From the people who live here"));
check("branch ledger (practical things)", main.includes('id="practical"'));
check("location section", main.includes('id="location"'));
check("inquiry form", main.includes('id="inquire"') && main.includes("Send on WhatsApp"));
check("honeypot present", main.includes('id="company"'));
check("wa.me links", main.includes("https://wa.me/233550000000"));
check("branch hero identity (h1 = branch name)", main.includes("Main<br/>Building"));
check("clear way back (All locations)", main.includes("All locations"));
check("branch switcher in nav", main.includes('aria-haspopup="menu"'));
check("chat falls back to the org line (main shares it)",
  main.includes("https://wa.me/233550000000") && !main.includes("wa.me/233550000002"));
check("sticky bar CTA", main.includes("Check availability"));
check("carousel markers (one per room)", (main.match(/Photo carousel/g) ?? []).length >= 3);
check("carousel dots (multi-photo rooms)", main.includes("Go to photo"));
check("prices present", main.includes("GHS 1,900") && main.includes("GHS 5,200"));
check("from-price in hero", main.includes("GHS 1,900"));
check("booking fee + momo", main.includes("GHS 300") && main.includes("055 000 0000"));
check("closing band", main.includes("Come and see the room before you decide."));
check("one h1", (main.match(/<h1/g) ?? []).length === 1);

console.log("\n=== second branch (/b/annex) — caretaker's own line ===");
const { html: annex } = await getPage("/b/annex");
check("annex hero identity (h1 = branch name)", annex.includes(">Annex</h1>"));
check("annex hero uses branch photos", annex.includes("/mock/annex.jpg"));
check("annex chat goes to the branch caretaker",
  annex.includes("https://wa.me/233550000002") && !annex.includes("wa.me/233550000000"));
check("annex walk override (12 min, not the org's 8)", annex.includes("12 min"));
check("renders annex rooms", annex.includes("GHS 1,750") && annex.includes("GHS 3,100"));
check("waitlist state (annex 2in1 is full)", annex.includes("Waiting list") || annex.includes("Waitlist"));
check("waitlist CTA (join waiting list)", annex.includes("Join the waiting list"));
check("clear way back (All locations)", annex.includes("All locations"));
check("branch switcher in nav", annex.includes('aria-haspopup="menu"'));

console.log("\n=== routing (SPEC.md §6.2) ===");
const badBranch = await getPage("/b/nonexistent");
check("unknown branch → branded 404", badBranch.status === 404 && badBranch.html.includes("404"));
// Unit-mode redirect (/b/* → /): flip MODE in lib/mock-hostel.ts to verify
// by hand — mode is data, one mode per demo run (SPEC.md §6.1).

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

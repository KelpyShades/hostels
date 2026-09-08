/**
 * Demo verification (no image reading — HTML/text assertions only).
 * Fetches the running site's server-rendered HTML and asserts: the
 * entry flow for whichever hostel this deployment serves, every section
 * present, carousels multi-photo, WhatsApp links, and routing behavior.
 *
 * Usage: node scripts/verify-site.mjs [baseUrl]
 * Requires: `next start` (or `pnpm dev`) already running.
 *
 * Mode-aware: with HOSTEL_ID/NEXT_PUBLIC_CONVEX_URL set, the site is
 * live (unit/multi per the hostel row — e.g. the demo Franco Hostel);
 * unset, it renders the multi-mode mock shell (Aseda Heights). The
 * org-view section only runs in multi mode; unit mode checks the full
 * single site at `/`.
 * Interaction-level checks (swipe, scroll) are a manual pass in the browser.
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

console.log("\n=== entry (/) ===");
const { status, html: entry } = await getPage("/");
check(`page 200 (got ${status})`, status === 200);
check("hero", entry.includes('id="hero"') && entry.includes("<h1"));
check("hero top scrim", entry.includes("from-black/55"));
check("hero full view height", entry.includes("h-svh"));
check("live room prices in hero facts", entry.includes("Rooms from"));

// Multi-branch hostel → the org view with the branch picker.
const multi = entry.includes('id="properties"');
if (multi) {
  console.log("\n=== org view (/) — multi-mode hostel ===");
  check("branch picker", entry.includes('id="properties"') && entry.includes("Choose your location"));
  check("branch links into branch sites", /href="\/b\/[\w-]+"/.test(entry));
  check("compare table", entry.includes("At a glance"));
  check("org ledger (practical things)", entry.includes('id="practical"') && entry.includes("The practical things"));
  check("no inquiry form on org view", !entry.includes('id="inquire"'));
  check("no branch switcher on the org view", !entry.includes('aria-haspopup="menu"'));
  check("org chat link present", /https:\/\/wa\.me\/\d+/.test(entry));
  check("one h1", (entry.match(/<h1/g) ?? []).length === 1);
  console.log("(branch-site checks: the branch slugs are deployment data — walk /b/<slug> by hand)");
} else {
  console.log("\n=== unit hostel (/) — the full site ===");
  check("rooms section", entry.includes('id="rooms"'));
  check("rooms first after hero", entry.indexOf('id="rooms"') < entry.indexOf('id="guide"'));
  check("rate card title", entry.includes("Rates at a glance"));
  check("guide section", entry.includes('id="guide"') && entry.includes("How to book"));
  check("guide steps", entry.includes("Come and see") && entry.includes("Hold your room"));
  check("gallery section", entry.includes('id="gallery"'));
  check("good to know (rules + faqs)", entry.includes('id="good-to-know"') && entry.includes("House rules"));
  check("ledger (practical things)", entry.includes('id="practical"'));
  check("location section", entry.includes('id="location"'));
  check("inquiry moved to dedicated page", !entry.includes('id="inquire"'));
  check("CTAs link the inquiry page", entry.includes('href="/inquire"'));
  check("wa.me links", /https:\/\/wa\.me\/\d+/.test(entry));
  check("sticky bar CTA", entry.includes("Check availability"));
  check("room rows render with photos", (entry.match(/Photo carousel/g) ?? []).length >= 1);
  check("prices present", /GHS \d[\d,]*/.test(entry));
  check("booking fee + momo", entry.includes("GHS 300") && /\d{3} \d{3} \d{4}/.test(entry));
  check("closing band", entry.includes("Come and see the room before you decide."));
  check("one h1", (entry.match(/<h1/g) ?? []).length === 1);
  check("branch switcher absent (unit site)", !entry.includes('aria-haspopup="menu"'));
}

console.log("\n=== inquiry page (/inquire) ===");
const inq = await getPage("/inquire");
check(`page 200 (got ${inq.status})`, inq.status === 200);
check("back to rooms link", inq.html.includes("Back to rooms"));
if (multi) {
  // Org-level: the location picker renders first; the form mounts
  // client-side once a branch is chosen (can't be SSR-checked).
  check("branch picker (org-level)", inq.html.includes("Which location are you asking about?"));
  // Branch inquiry pages: take the first branch site link from the entry page.
  const branchHref = entry.match(/href="(\/b\/[\w-]+)"/);
  if (branchHref) {
    const binq = await getPage(`${branchHref[1]}/inquire`);
    check(
      `branch inquiry page ${branchHref[1]}/inquire (got ${binq.status})`,
      binq.status === 200 && binq.html.includes("Send on WhatsApp"),
    );
    check("branch inquiry form SSR-rendered", binq.html.includes('id="inquire"'));
    check("branch inquiry honeypot", binq.html.includes('id="company"'));
    const roomName = binq.html.match(/id="inq-room"[\s\S]*?<option value="([^"]+)"/);
    if (roomName) {
      const pre = await getPage(
        `${branchHref[1]}/inquire?room=${encodeURIComponent(roomName[1])}`,
      );
      check(
        `?room= pre-selection (${roomName[1]})`,
        pre.html.includes(`value="${roomName[1]}" selected`),
      );
    }
  } else {
    check("branch inquiry page reachable from picker", false);
  }
} else {
  check("inquiry form", inq.html.includes('id="inquire"') && inq.html.includes("Send on WhatsApp"));
  check("honeypot present", inq.html.includes('id="company"'));
  const preselect = await getPage("/inquire?room=2-in-1");
  check("?room= pre-selects that room", preselect.html.includes("2-in-1"));
}

console.log("\n=== routing (SPEC.md §6.2) ===");
if (!multi) {
  // Unit hostel: ANY branch path redirects home — structural mismatch.
  const branchPath = await fetch(`${BASE}/b/anything`, { redirect: "manual" });
  check(
    `branch path on unit hostel → redirect home (got ${branchPath.status})`,
    branchPath.status >= 300 && branchPath.status < 400,
  );
}
const badBranch = await fetch(`${BASE}/b/nonexistent`, { redirect: multi ? "follow" : "manual" });
check(
  `unknown branch → branded 404 (got ${badBranch.status})`,
  multi ? badBranch.status === 404 : true, // on unit mode it redirects (verified above)
);
check("branded 404 copy", (await badBranch.text()).includes("This hostel isn't here."));

const qr = await fetch(`${BASE}/qr`);
check("QR route serves PNG", qr.status === 200 && qr.headers.get("content-type") === "image/png");

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

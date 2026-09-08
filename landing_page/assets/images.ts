/**
 * The site's imagery — static imports so Next.js bundles them with
 * content-hashed, immutable-cache URLs (`/_next/static/media/…`), and
 * next/image optimizes them (WebP/AVIF derivatives, right sizes). All
 * photos are curated by us in the per-client shell (lib/*-hostel.ts) —
 * there is no photo upload pipeline; the manager never touches imagery
 * (SPEC.md FR-B4). Swapping a client's photos = replacing these files.
 *
 * The discipline (2026-09-08): 5 images per client —
 *   exterior + annex    → the hero crossfade, one photo per branch
 *   room-4in1/2in1/1in1 → one stock image per room category
 */
import annex from "./annex.jpg";
import exterior from "./exterior.jpg";
import room1in1 from "./room-1in1.jpg";
import room2in1 from "./room-2in1.jpg";
import room4in1 from "./room-4in1.jpg";

export const img = {
  annex,
  exterior,
  room1in1,
  room2in1,
  room4in1,
};

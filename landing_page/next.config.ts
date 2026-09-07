import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /**
   * Pin Turbopack's root to this package. The app is its own deployable
   * (SPEC.md §4 — one build, deployed per hostel) but sits inside a pnpm
   * workspace folder whose pnpm-workspace.yaml lives outside this git
   * repo; without this, `next build` warns that it ignored the parent
   * workspace file. The explicit root keeps resolution local and the
   * build identical locally and on Vercel.
   */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

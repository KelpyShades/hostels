import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /**
   * Pin Turbopack's root to the repo parent so the shared `convex/`
   * folder (schema + generated API used by this app, SPEC.md §4) is
   * inside the compilation root. The app is still its own deployable
   * (one build, deployed per hostel) and the build is identical
   * locally and on Vercel.
   *
   * `convex/node_modules` is a committed symlink to this app's
   * node_modules: the shared `convex/` folder lives outside the
   * package that installs dependencies, so bare imports inside
   * `convex/_generated/*` (e.g. `convex/server`) need it to resolve —
   * both for the bundler and for `tsc`.
   *
   * All imagery is bundled static assets (assets/images.ts, imported by
   * the per-client shells) — same-origin, content-hashed, optimized by
   * next/image. No remote image hosts.
   */
  transpilePackages: ["convex"],
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
};

export default nextConfig;

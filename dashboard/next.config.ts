import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Pin Turbopack's root to the repo parent so the shared `convex/`
   * folder (schema + generated API used by this app, SPEC.md §4) is
   * inside the compilation root.
   */
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
};

export default nextConfig;

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable branch slug — must match the landing page's slugify
 *  (landing_page/lib/live.ts) so the Share view's branch URL opens the
 *  branch's public site at /b/[slug]. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[\u2019']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "branch"
  );
}

/** A caretaker deployment is branch-locked via NEXT_PUBLIC_BRANCH_ID:
 *  it sees only that branch's enquiries and rooms (FR-B6). */
export function branchLock(): string | undefined {
  return process.env.NEXT_PUBLIC_BRANCH_ID || undefined;
}

import type { MetadataRoute } from "next";

/** Owner inboxes expose real lead data — never crawled, never in sitemaps (FR-B2). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/inbox"],
      },
    ],
  };
}

import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { getSite } from "@/lib/site-data";
import { metaDescription, publicConfig } from "@/lib/live";
import { SiteDataProvider } from "@/components/live-data";

/**
 * Fonts live on the shell (not the direction file) so every surface —
 * the site, the 404, future owner pages — shares one type system:
 * Cormorant Garamond for display and the owner's voice (italic),
 * Instrument Sans for body, UI, and every value — prices, counts, times
 * — where a high-contrast serif loses legibility at data sizes.
 *
 * The layout also mounts the live-data provider: one Convex client and
 * one subscription shared by the whole site (client-side, SPEC.md §6.3),
 * seeded server-side so the first paint is already correct. Convex's
 * server fetch is uncached, so the shell renders per request — the
 * static copy still comes from the strings file; only the live values
 * hit the database.
 */

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSite();
  const title = site.hostel.name;
  const description = metaDescription(site);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.hostel.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { site } = await getSite();
  const config = publicConfig();
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteDataProvider
          convexUrl={config?.convexUrl}
          hostelId={config?.hostelId}
          seed={site}
        >
          {children}
        </SiteDataProvider>
      </body>
    </html>
  );
}

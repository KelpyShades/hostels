import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { getHostel } from "@/lib/mock-hostel";

/**
 * Fonts live on the shell (not the direction file) so every surface —
 * the site, the 404, future owner pages — shares one type system:
 * Cormorant Garamond for display and the owner's voice (italic),
 * Instrument Sans for body, UI, and every value — prices, counts, times
 * — where a high-contrast serif loses legibility at data sizes.
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

const hostel = getHostel();

export const metadata: Metadata = {
  title: `${hostel.name} — ${hostel.area}`,
  description: hostel.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

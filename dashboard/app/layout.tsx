import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hostel manager dashboard",
  description: "Manage inquiries and room availability for your hostel.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

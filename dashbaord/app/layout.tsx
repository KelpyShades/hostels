import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotel app — hostel/",
  description: "Internal hostel client management workspace.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

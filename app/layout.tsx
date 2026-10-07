import type { Metadata } from "next";
import "./globals.css";

import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Big Shanty Auction",
  description:
    "Big Shanty Auction serves Marietta and Georgia with online auctions, estate sales, antiques, and collectibles.",
  metadataBase: siteUrl ?? undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

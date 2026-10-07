import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return siteUrl
    ? [
        { url: siteUrl.href },
        { url: new URL("/about", siteUrl).href },
        { url: new URL("/contact", siteUrl).href },
        { url: new URL("/team", siteUrl).href },
      ]
    : [];
}

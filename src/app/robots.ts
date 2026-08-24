import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    // /studio is a login wall, not content — indexing it wastes crawl budget
    // and puts a sign-in screen in search results.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/studio"] }],
    sitemap: `${profile.siteUrl}/sitemap.xml`,
    host: profile.siteUrl,
  };
}

import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/api/",
        "/read/",
        "/account",
        "/setup",
        ...(process.env.CATALOG_SOURCE === "sharepoint" ? [] : ["/theses/"]),
      ],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}

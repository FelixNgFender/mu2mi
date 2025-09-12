import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [siteConfig.paths.studio.home],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";

function generateSitemapPaths(
  // biome-ignore lint/suspicious/noExplicitAny: cumbersome
  paths: any,
  baseUrl: string,
): MetadataRoute.Sitemap {
  const sitemapPaths: MetadataRoute.Sitemap = [];
  for (const key in paths) {
    if (typeof paths === "object") {
      sitemapPaths.push(...generateSitemapPaths(paths[key], baseUrl));
    } else {
      sitemapPaths.push({
        url: `${baseUrl}${paths[key]}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return sitemapPaths;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...generateSitemapPaths(siteConfig.paths, siteConfig.url),
  ];

  return sitemap;
}

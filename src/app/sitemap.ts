import type { MetadataRoute } from "next";
import {
  getCaseStudySlugs,
  getWritingPostSlugs,
} from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { caseStudyHref, writingHref } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudySlugs, writingSlugs] = await Promise.all([
    getCaseStudySlugs(),
    getWritingPostSlugs(),
  ]);

  const staticRoutes = ["/", "/case-studies", "/writing", "/studio"];
  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: new URL(path, siteUrl).toString(),
      lastModified: now,
    })),
    ...caseStudySlugs.map((slug) => ({
      url: new URL(caseStudyHref(slug), siteUrl).toString(),
      lastModified: now,
    })),
    ...writingSlugs.map((slug) => ({
      url: new URL(writingHref(slug), siteUrl).toString(),
      lastModified: now,
    })),
  ];
}

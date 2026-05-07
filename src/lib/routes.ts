import type { Route } from "next";
import { siteUrl } from "@/lib/env";

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
};

export const caseStudyHref = (slug: string): Route =>
  `/case-studies/${slug}` as Route;
export const writingHref = (slug: string): Route =>
  `/writing/${slug}` as Route;

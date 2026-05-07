import {
  caseStudies as fallbackCaseStudies,
  homePage as fallbackHomePage,
  siteSettings as fallbackSiteSettings,
  writingPosts as fallbackWritingPosts,
} from "@/data/site-content";
import { hasSanityConfig } from "@/lib/env";
import type {
  CaseStudy,
  HomePage,
  SiteSettings,
  WritingPost,
} from "@/types/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CASE_STUDIES_QUERY,
  CASE_STUDY_SLUGS_QUERY,
  CASE_STUDY_QUERY,
  HOME_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
  WRITING_POST_QUERY,
  WRITING_POST_SLUGS_QUERY,
  WRITING_POSTS_QUERY,
} from "@/sanity/lib/queries";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSanityConfig) {
    return fallbackSiteSettings;
  }

  const { data } = await sanityFetch<SiteSettings | null>({
    query: SITE_SETTINGS_QUERY,
    tags: ["siteSettings"],
  });

  return data || fallbackSiteSettings;
}

export async function getHomePage(): Promise<HomePage> {
  if (!hasSanityConfig) {
    return fallbackHomePage;
  }

  const { data } = await sanityFetch<HomePage | null>({
    query: HOME_PAGE_QUERY,
    tags: ["homePage"],
  });

  return data || fallbackHomePage;
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!hasSanityConfig) {
    return fallbackCaseStudies;
  }

  const { data } = await sanityFetch<CaseStudy[] | null>({
    query: CASE_STUDIES_QUERY,
    tags: ["caseStudy"],
  });

  return data?.length ? data : fallbackCaseStudies;
}

export async function getCaseStudyBySlug(
  slug: string
): Promise<CaseStudy | null> {
  if (!hasSanityConfig) {
    return fallbackCaseStudies.find((entry) => entry.slug === slug) || null;
  }

  const { data } = await sanityFetch<CaseStudy | null>({
    query: CASE_STUDY_QUERY,
    params: { slug },
    tags: [`caseStudy:${slug}`, "caseStudy"],
  });

  return data || fallbackCaseStudies.find((entry) => entry.slug === slug) || null;
}

export async function getCaseStudySlugs(): Promise<string[]> {
  if (!hasSanityConfig) {
    return fallbackCaseStudies.map((entry) => entry.slug);
  }

  const { data } = await sanityFetch<Array<{ slug: string }> | null>({
    query: CASE_STUDY_SLUGS_QUERY,
    tags: ["caseStudy"],
  });

  return data?.map((entry) => entry.slug) || fallbackCaseStudies.map((entry) => entry.slug);
}

export async function getWritingPosts(): Promise<WritingPost[]> {
  if (!hasSanityConfig) {
    return fallbackWritingPosts;
  }

  const { data } = await sanityFetch<WritingPost[] | null>({
    query: WRITING_POSTS_QUERY,
    tags: ["writing"],
  });

  return data?.length ? data : fallbackWritingPosts;
}

export async function getWritingPostBySlug(
  slug: string
): Promise<WritingPost | null> {
  if (!hasSanityConfig) {
    return fallbackWritingPosts.find((entry) => entry.slug === slug) || null;
  }

  const { data } = await sanityFetch<WritingPost | null>({
    query: WRITING_POST_QUERY,
    params: { slug },
    tags: [`writing:${slug}`, "writing"],
  });

  return (
    data || fallbackWritingPosts.find((entry) => entry.slug === slug) || null
  );
}

export async function getWritingPostSlugs(): Promise<string[]> {
  if (!hasSanityConfig) {
    return fallbackWritingPosts.map((entry) => entry.slug);
  }

  const { data } = await sanityFetch<Array<{ slug: string }> | null>({
    query: WRITING_POST_SLUGS_QUERY,
    tags: ["writing"],
  });

  return data?.map((entry) => entry.slug) || fallbackWritingPosts.map((entry) => entry.slug);
}

import {
  caseStudies as fallbackCaseStudies,
  homePage as fallbackHomePage,
  siteSettings as fallbackSiteSettings,
  writingPosts as fallbackWritingPosts,
} from "@/data/site-content";
import { hasSanityConfig, sanityEnv } from "@/lib/env";
import { client } from "@/sanity/lib/client";
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
    revalidate: 0,
    tags: [],
  });

  const hasDetailServices = Array.isArray(data?.detailServices) && data.detailServices.length > 0;

  let resolvedData = data;

  if (!hasDetailServices && sanityEnv.readToken) {
    const draftData = await client
      .withConfig({
        useCdn: false,
        stega: false,
      })
      .fetch<CaseStudy | null>(
        CASE_STUDY_QUERY,
        { slug },
        {
          perspective: "drafts",
          token: sanityEnv.readToken,
          next: { revalidate: 0, tags: [] },
        }
      );

    if (draftData) resolvedData = draftData;
  }

  if (resolvedData) {
    const existingTitles = Array.isArray(resolvedData.detailServiceTitles)
      ? resolvedData.detailServiceTitles.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    if (existingTitles.length === 0 && Array.isArray(resolvedData.detailServices) && resolvedData.detailServices.length > 0) {
      const rawRefs = resolvedData.detailServices
        .map((entry) => (entry && typeof entry === "object" && "_ref" in entry ? String(entry._ref || "") : ""))
        .filter((ref) => ref.length > 0);

      const normalizedRefs = Array.from(
        new Set(rawRefs.map((ref) => (ref.startsWith("drafts.") ? ref.slice("drafts.".length) : ref))),
      );

      if (normalizedRefs.length > 0) {
        const tagDocs = await client
          .withConfig({
            useCdn: false,
            stega: false,
          })
          .fetch<Array<{ title?: string }>>(
            `*[_type == "caseStudyTag" && _id in $ids]{title}`,
            { ids: normalizedRefs },
            {
              perspective: "published",
              next: { revalidate: 0, tags: [] },
            },
          );

        const tagTitles = tagDocs
          .map((tag) => tag.title?.trim() || "")
          .filter((title) => title.length > 0);

        if (tagTitles.length > 0) {
          resolvedData = {
            ...resolvedData,
            detailServiceTitles: tagTitles,
          };
        }
      }
    }
  }

  return resolvedData || fallbackCaseStudies.find((entry) => entry.slug === slug) || null;
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

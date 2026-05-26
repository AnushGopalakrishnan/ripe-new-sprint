import {
  caseStudies as fallbackCaseStudies,
  homePage as fallbackHomePage,
  siteSettings as fallbackSiteSettings,
  writingPosts as fallbackWritingPosts,
} from "@/data/site-content";
import { hasSanityConfig, sanityEnv } from "@/lib/env";
import { resolveVideoPoster } from "@/lib/video-poster";
import { client } from "@/sanity/lib/client";
import type {
  CaseStudy,
  HomePage,
  JobPosting,
  MediaAsset,
  SiteSettings,
  TeamMember,
  WritingPost,
} from "@/types/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CASE_STUDIES_QUERY,
  CASE_STUDY_SLUGS_QUERY,
  CASE_STUDY_QUERY,
  HOME_PAGE_QUERY,
  JOB_POSTINGS_QUERY,
  SITE_SETTINGS_QUERY,
  TEAM_MEMBER_QUERY,
  TEAM_MEMBER_SLUGS_QUERY,
  TEAM_MEMBERS_QUERY,
  WRITING_POST_QUERY,
  WRITING_POST_SLUGS_QUERY,
  WRITING_POSTS_QUERY,
} from "@/sanity/lib/queries";

const fallbackCaseStudyMedia: MediaAsset = {
  kind: "image",
  src: "/case-detail-media/hero.jpg",
  alt: "Case study media",
};

const fallbackJobPostings: JobPosting[] = [
  {
    title: "UX Designer",
    location: "Chicago",
    contractType: "Full Time",
    externalUrl: "/job-listings/ux-designer-chicago",
    order: 0,
  },
  {
    title: "Project Manager",
    location: "Remote",
    contractType: "Full Time",
    externalUrl: "/job-listings/project-manager-boston",
    order: 1,
  },
  {
    title: "Data Analyst",
    location: "San Francisco",
    contractType: "Full Time",
    externalUrl: "/job-listings/data-analyst-sf",
    order: 2,
  },
  {
    title: "Marketing Manager",
    location: "Los Angeles",
    contractType: "Contract",
    externalUrl: "/job-listings/marketing-manager-la",
    order: 3,
  },
];

function normalizeMediaPoster(media: MediaAsset): MediaAsset {
  const resolvedPoster = resolveVideoPoster({
    poster: media.poster,
    src: media.src,
    hlsUrl: media.longForm?.hlsUrl,
  });
  if (resolvedPoster === media.poster) return media;
  return { ...media, poster: resolvedPoster };
}

function normalizeCommentableEntry<T extends { media?: MediaAsset } | undefined>(entry: T): T {
  if (!entry?.media) return entry;
  const normalizedMedia = normalizeMediaPoster(entry.media);
  if (normalizedMedia === entry.media) return entry;
  return { ...entry, media: normalizedMedia } as T;
}

function normalizeCaseStudyMedia(study: CaseStudy): CaseStudy {
  const normalizedCoverMedia = normalizeMediaPoster(study.coverMedia);
  const normalizedDetailHero = normalizeCommentableEntry(study.detailHero);
  const normalizedDetailIntro = normalizeCommentableEntry(study.detailIntro);
  const normalizedDetailCarouselSlides = study.detailCarouselSlides?.map((entry) => normalizeCommentableEntry(entry));
  const normalizedDetailCarouselPoster = normalizeCommentableEntry(study.detailCarouselPoster);
  const normalizedDetailBlackFeature = normalizeCommentableEntry(study.detailBlackFeature);
  const normalizedDetailWideFeature = normalizeCommentableEntry(study.detailWideFeature);
  const normalizedDetailCta = normalizeCommentableEntry(study.detailCta);
  const normalizedDetailLayouts = study.detailLayouts?.map((block) => ({
    ...block,
    rows: block.rows?.map((row) => ({
      ...row,
      cells: row.cells?.map((cell) => ({
        ...cell,
        content: normalizeCommentableEntry(cell.content),
      })),
    })),
  }));
  const normalizedDetailLayoutEntries = study.detailLayoutEntries?.map((entry) => ({
    ...entry,
    content: entry.content?.map((content) => normalizeCommentableEntry(content)),
  }));
  const normalizedDetailMoreProjects = study.detailMoreProjects?.map((project) =>
    project.media
      ? {
          ...project,
          media: normalizeMediaPoster(project.media),
        }
      : project,
  );
  const normalizedTestimonial =
    study.testimonial?.avatar
      ? {
          ...study.testimonial,
          avatar: normalizeMediaPoster(study.testimonial.avatar),
        }
      : study.testimonial;

  return {
    ...study,
    coverMedia: normalizedCoverMedia,
    detailHero: normalizedDetailHero,
    detailIntro: normalizedDetailIntro,
    detailCarouselSlides: normalizedDetailCarouselSlides,
    detailCarouselPoster: normalizedDetailCarouselPoster,
    detailBlackFeature: normalizedDetailBlackFeature,
    detailWideFeature: normalizedDetailWideFeature,
    detailCta: normalizedDetailCta,
    detailLayouts: normalizedDetailLayouts,
    detailLayoutEntries: normalizedDetailLayoutEntries,
    detailMoreProjects: normalizedDetailMoreProjects,
    testimonial: normalizedTestimonial,
  };
}

function normalizeCaseStudy(study: CaseStudy): CaseStudy {
  const fallbackStudy = !study.coverMedia?.src
    ? fallbackCaseStudies.find((entry) => entry.slug === study.slug)
    : null;
  const fallbackMedia = fallbackStudy?.coverMedia?.src ? fallbackStudy.coverMedia : fallbackCaseStudyMedia;
  const baseCoverMedia = study.coverMedia?.src
    ? {
        ...study.coverMedia,
        kind: study.coverMedia.kind ?? "image",
        alt: study.coverMedia.alt || study.title,
      }
    : {
        ...fallbackMedia,
        alt: fallbackMedia.alt || study.title,
      };

  return normalizeCaseStudyMedia({
    ...study,
    coverMedia: baseCoverMedia,
  });
}

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

  return data?.length ? data.map(normalizeCaseStudy) : fallbackCaseStudies;
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
      const slugRefs = Array.from(
        new Set(
          normalizedRefs
            .filter((ref) => ref.startsWith("caseStudyTag."))
            .map((ref) => ref.slice("caseStudyTag.".length))
            .filter((slugValue) => slugValue.length > 0),
        ),
      );

      if (normalizedRefs.length > 0 || slugRefs.length > 0) {
        const tagDocs = await client
          .withConfig({
            useCdn: false,
            stega: false,
          })
          .fetch<Array<{ _id?: string; title?: string; slug?: { current?: string } }>>(
            `*[
              _type == "caseStudyTag" &&
              (
                _id in $ids ||
                slug.current in $slugs
              )
            ]{
              _id,
              title,
              slug
            }`,
            { ids: normalizedRefs, slugs: slugRefs },
            {
              perspective: "published",
              next: { revalidate: 0, tags: [] },
            },
          );

        const byId = new Map<string, string>();
        const bySlug = new Map<string, string>();
        for (const tag of tagDocs) {
          const title = tag.title?.trim();
          if (!title) continue;
          if (tag._id) byId.set(tag._id, title);
          const slugCurrent = tag.slug?.current?.trim();
          if (slugCurrent) bySlug.set(slugCurrent, title);
        }

        const tagTitles = rawRefs
          .map((ref) => (ref.startsWith("drafts.") ? ref.slice("drafts.".length) : ref))
          .map((ref) => {
            if (byId.has(ref)) return byId.get(ref) ?? "";
            if (ref.startsWith("caseStudyTag.")) {
              const refSlug = ref.slice("caseStudyTag.".length);
              if (bySlug.has(refSlug)) return bySlug.get(refSlug) ?? "";
              // Last-resort readability fallback for legacy slug-shaped refs.
              return refSlug
                .split("-")
                .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
                .join(" ");
            }
            return "";
          })
          .map((title) => title.trim())
          .filter((title) => title.length > 0);
        const uniqueTagTitles = Array.from(new Set(tagTitles));

        if (uniqueTagTitles.length > 0) {
          resolvedData = {
            ...resolvedData,
            detailServiceTitles: uniqueTagTitles,
          };
        }
      }
    }
  }

  if (resolvedData) return normalizeCaseStudy(resolvedData);

  return fallbackCaseStudies.find((entry) => entry.slug === slug) || null;
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

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!hasSanityConfig) {
    return [];
  }

  const { data } = await sanityFetch<TeamMember[] | null>({
    query: TEAM_MEMBERS_QUERY,
    revalidate: 0,
    tags: [],
  });

  const publishedMembers = data?.filter((member) => Boolean(member.slug && member.name)) ?? [];
  if (publishedMembers.length > 0) return publishedMembers;

  if (!sanityEnv.readToken) return publishedMembers;

  const draftMembers = await client
    .withConfig({
      useCdn: false,
      stega: false,
    })
    .fetch<TeamMember[]>(
      TEAM_MEMBERS_QUERY,
      {},
      {
        perspective: "drafts",
        token: sanityEnv.readToken,
        next: { revalidate: 0, tags: [] },
      },
    );

  return draftMembers?.filter((member) => Boolean(member.slug && member.name)) ?? [];
}

export async function getJobPostings(): Promise<JobPosting[]> {
  if (!hasSanityConfig) {
    return fallbackJobPostings;
  }

  const { data } = await sanityFetch<JobPosting[] | null>({
    query: JOB_POSTINGS_QUERY,
    revalidate: 0,
    tags: [],
  });

  const publishedJobs =
    data?.filter(
      (job) =>
        Boolean(
          job?.title?.trim() &&
            job?.location?.trim() &&
            job?.contractType?.trim() &&
            job?.externalUrl?.trim(),
        ),
    ) ?? [];
  if (publishedJobs.length > 0) return publishedJobs;
  if (!sanityEnv.readToken) return publishedJobs.length > 0 ? publishedJobs : fallbackJobPostings;

  const draftJobs = await client
    .withConfig({
      useCdn: false,
      stega: false,
    })
    .fetch<JobPosting[]>(
      JOB_POSTINGS_QUERY,
      {},
      {
        perspective: "drafts",
        token: sanityEnv.readToken,
        next: { revalidate: 0, tags: [] },
      },
    );

  const safeDraftJobs =
    draftJobs?.filter(
      (job) =>
        Boolean(
          job?.title?.trim() &&
            job?.location?.trim() &&
            job?.contractType?.trim() &&
            job?.externalUrl?.trim(),
        ),
    ) ?? [];

  if (safeDraftJobs.length > 0) return safeDraftJobs;
  return fallbackJobPostings;
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  if (!hasSanityConfig) {
    return null;
  }

  const { data } = await sanityFetch<TeamMember | null>({
    query: TEAM_MEMBER_QUERY,
    params: { slug },
    revalidate: 0,
    tags: [],
  });

  if (data) return data;
  if (!sanityEnv.readToken) return null;

  return client
    .withConfig({
      useCdn: false,
      stega: false,
    })
    .fetch<TeamMember | null>(
      TEAM_MEMBER_QUERY,
      { slug },
      {
        perspective: "drafts",
        token: sanityEnv.readToken,
        next: { revalidate: 0, tags: [] },
      },
    );
}

export async function getTeamMemberSlugs(): Promise<string[]> {
  if (!hasSanityConfig) {
    return [];
  }

  const { data } = await sanityFetch<Array<{ slug: string }> | null>({
    query: TEAM_MEMBER_SLUGS_QUERY,
    tags: ["teamMember"],
  });

  return data?.map((entry) => entry.slug).filter(Boolean) ?? [];
}

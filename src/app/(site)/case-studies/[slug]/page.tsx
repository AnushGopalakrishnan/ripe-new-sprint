import { notFound } from "next/navigation";
import { NativeRouteDocument } from "@/components/native-route-document";
import { workJournalItems, type WorkJournalItem } from "@/data/work-journal";
import { getCaseStudies, getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import type { CaseStudy, CommentableMedia, MediaAsset, PlacedComment } from "@/types/content";
import { CaseStudyClient } from "./case-study-client";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

type ClientComment = {
  id: string;
  author: string;
  avatar?: string;
  body: string;
  x: number;
  y: number;
  createdAt: string;
};

type ClientMedia = {
  src: string;
  alt: string;
  kind: "auto" | "image" | "video";
  poster?: string;
  comments: ClientComment[];
};

const fallbackMedia: MediaAsset = {
  kind: "image",
  src: "/case-detail-media/hero.jpg",
  alt: "Case study media",
};

async function loadLegacyCaseStudy(slug: string) {
  try {
    return await loadNativeMirrorDocument(`/case-studies/${slug}`);
  } catch {
    return null;
  }
}

function toClientComments(comments: PlacedComment[] | undefined) {
  if (!Array.isArray(comments)) return [];

  const mapped: ClientComment[] = [];

  for (const comment of comments) {
    const x = comment.position?.x;
    const y = comment.position?.y;

    if (typeof x !== "number" || typeof y !== "number") continue;

    mapped.push({
      id: comment._key ?? `${x}-${y}-${comment.author ?? "comment"}`,
      author: comment.commenter?.name?.trim() || comment.author?.trim() || "Anonymous",
      avatar: comment.commenter?.avatar,
      body: comment.body?.trim() || "",
      x,
      y,
      createdAt: "",
    });
  }

  return mapped;
}

function toClientMedia(entry: CommentableMedia | undefined, fallback: MediaAsset): ClientMedia {
  const media = entry?.media ?? fallback;

  return {
    src: media.src,
    alt: media.alt || "Case study media",
    kind: media.kind ?? "image",
    poster: media.poster,
    comments: toClientComments(entry?.comments),
  };
}

function normalizeServiceLabel(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value && typeof value === "object") {
    const maybeRecord = value as { title?: unknown; name?: unknown; label?: unknown };
    const candidates = [maybeRecord.title, maybeRecord.name, maybeRecord.label];
    for (const candidate of candidates) {
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (trimmed.length > 0) return trimmed;
      }
    }
  }

  return null;
}

function toClientReference(study: CaseStudy) {
  const detailServiceTitles = (study.detailServiceTitles ?? [])
    .map((service) => normalizeServiceLabel(service))
    .filter((service): service is string => Boolean(service));
  const detailServices = (study.detailServices ?? [])
    .map((service) => normalizeServiceLabel(service))
    .filter((service): service is string => Boolean(service));
  const uniqueDetailServices = Array.from(
    new Set(detailServiceTitles.length > 0 ? detailServiceTitles : detailServices),
  );
  const detailYear = study.year?.trim() || "";
  const baseMedia = study.coverMedia?.src ? study.coverMedia : fallbackMedia;
  const carouselSlides =
    study.detailCarouselSlides?.map((slide, index) =>
      toClientMedia(slide, {
        ...baseMedia,
        alt: `${study.title} carousel image ${index + 1}`,
      }),
    ) ?? [];
  const layoutsFromTemplates =
    study.detailLayoutEntries?.map((entry, entryIndex) => {
      const layout = entry.layout;
      const contentItems = Array.isArray(entry.content) ? entry.content : [];
      let contentPointer = 0;

      return {
        id: entry._key || `${study.slug}-layout-entry-${entryIndex}`,
        preset: layout?.preset || "layout1",
        designWidth: layout?.designWidth ?? 1440,
        gap: layout?.gap,
        rows:
          layout?.rows?.map((row) => ({
            height: row.height,
            cells:
              row.cells?.map((cell) => {
                const contentItem = contentItems[contentPointer];
                contentPointer += 1;
                return {
                  width: cell.width || 1,
                  media: toClientMedia(contentItem, baseMedia),
                };
              }) ?? [],
          })) ?? [],
      };
    }) ?? [];

  const legacyLayouts =
    study.detailLayouts?.map((block, blockIndex) => ({
      id: block._key || `${study.slug}-layout-${blockIndex}`,
      preset: block.preset || "layout1",
      designWidth: 1440,
      gap: block.gap,
      rows:
        block.rows?.map((row) => ({
          height: row.height,
          cells:
            row.cells?.map((cell) => ({
              width: cell.width || 1,
              media: toClientMedia(cell.content, baseMedia),
            })) ?? [],
        })) ?? [],
    })) ?? [];
  const layouts = layoutsFromTemplates.length > 0 ? layoutsFromTemplates : legacyLayouts;

  return {
    brand: study.client || study.title,
    title: study.title,
    heroNote: "Scroll to view more",
    eyebrow: study.detailEyebrow || study.summary,
    services: uniqueDetailServices,
    industry: study.detailIndustry || study.client,
    year: detailYear,
    information: study.detailInformation?.length ? study.detailInformation : [],
    media: {
      hero: toClientMedia(study.detailHero, baseMedia),
      intro: toClientMedia(study.detailIntro, baseMedia),
      carouselSlides: carouselSlides.length
        ? carouselSlides
        : [
            toClientMedia(undefined, {
              ...baseMedia,
              alt: `${study.title} carousel image`,
            }),
          ],
      carouselPoster: toClientMedia(study.detailCarouselPoster, baseMedia),
      blackFeature: toClientMedia(study.detailBlackFeature, baseMedia),
      wideFeature: toClientMedia(study.detailWideFeature, baseMedia),
      cta: toClientMedia(study.detailCta, baseMedia),
    },
    layouts,
  };
}

function toMoreProjects(study: CaseStudy, allStudies: CaseStudy[]) {
  const explicitProjects =
    study.detailMoreProjects
      ?.filter((project) => project.media?.src)
      .map((project) => ({
        image: project.media?.src ?? fallbackMedia.src,
        title: project.title?.trim() || "Project",
        year: project.year?.trim() || "",
        slug: project.slug?.trim(),
      })) ?? [];

  const existingSlugs = new Set(explicitProjects.map((project) => project.slug).filter(Boolean));

  const cmsFallbackProjects = allStudies
    .filter((entry) => entry.slug !== study.slug)
    .filter((entry) => !existingSlugs.has(entry.slug))
    .map((entry) => ({
      image: entry.coverMedia.poster || entry.coverMedia.src || fallbackMedia.src,
      title: entry.title,
      year: entry.year || "",
      slug: entry.slug,
    }));

  for (const project of cmsFallbackProjects) {
    if (project.slug) existingSlugs.add(project.slug);
  }

  const journalFallbackProjects = workJournalItems
    .filter((entry) => entry.slug !== study.slug)
    .filter((entry) => !existingSlugs.has(entry.slug))
    .map((entry) => ({
      image: entry.coverMedia?.poster || entry.coverMedia?.src || entry.image,
      title: entry.title,
      year: entry.year || "",
      slug: entry.slug,
    }));

  return [...explicitProjects, ...cmsFallbackProjects, ...journalFallbackProjects].slice(0, 4);
}

function toReferenceFromWorkJournal(item: WorkJournalItem) {
  const media = item.coverMedia ?? {
    kind: "image" as const,
    src: item.image,
    alt: item.title,
  };

  const description = item.description || item.title;

  return {
    brand: item.industry || "Ripe",
    title: item.title,
    heroNote: "Scroll to view more",
    eyebrow: description,
    services: item.tags.length ? item.tags : ["Brand"],
    industry: item.industry || "Work",
    year: item.year || "",
    information: [description],
    media: {
      hero: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
      intro: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
      carouselSlides: [
        {
          src: media.src,
          alt: media.alt || item.title,
          kind: media.kind,
          poster: media.poster,
          comments: [],
        },
      ],
      carouselPoster: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
      blackFeature: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
      wideFeature: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
      cta: {
        src: media.src,
        alt: media.alt || item.title,
        kind: media.kind,
        poster: media.poster,
        comments: [],
      },
    },
    layouts: [],
  };
}

function toMoreProjectsFromWorkJournal(item: WorkJournalItem, allStudies: CaseStudy[]) {
  const cmsProjects = allStudies
    .filter((entry) => entry.slug !== item.slug)
    .slice(0, 4)
    .map((entry) => ({
      image: entry.coverMedia.poster || entry.coverMedia.src || fallbackMedia.src,
      title: entry.title,
      year: entry.year || "",
      slug: entry.slug,
    }));

  const existingSlugs = new Set(cmsProjects.map((project) => project.slug));

  const journalProjects = workJournalItems
    .filter((entry) => entry.slug !== item.slug)
    .filter((entry) => !existingSlugs.has(entry.slug))
    .map((entry) => ({
      image: entry.coverMedia?.poster || entry.coverMedia?.src || entry.image,
      title: entry.title,
      year: entry.year,
      slug: entry.slug,
    }));

  return [...cmsProjects, ...journalProjects].slice(0, 4);
}

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  const journalSlugs = workJournalItems.map((item) => item.slug);
  const merged = Array.from(new Set([...slugs, ...journalSlugs]));
  return merged.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (caseStudy) {
    return createExactTitleMetadata({
      title: `${caseStudy.title} - Case Study`,
      description: caseStudy.seo?.description || caseStudy.summary,
      path: `/case-studies/${slug}`,
    });
  }

  const workItem = workJournalItems.find((item) => item.slug === slug);
  if (workItem) {
    return createExactTitleMetadata({
      title: `${workItem.title} - Case Study`,
      description: workItem.description,
      path: `/case-studies/${slug}`,
    });
  }

  const legacyCaseStudy = await loadLegacyCaseStudy(slug);
  if (legacyCaseStudy) {
    return createExactTitleMetadata({
      title: legacyCaseStudy.title,
      path: `/case-studies/${slug}`,
    });
  }

  return createExactTitleMetadata({
    title: "Case Study",
    path: `/case-studies/${slug}`,
  });
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);
  const allStudies = await getCaseStudies();

  if (caseStudy) {
    return (
      <CaseStudyClient
        reference={toClientReference(caseStudy)}
        moreProjects={toMoreProjects(caseStudy, allStudies)}
      />
    );
  }

  const workItem = workJournalItems.find((item) => item.slug === slug);
  if (workItem) {
    return (
      <CaseStudyClient
        reference={toReferenceFromWorkJournal(workItem)}
        moreProjects={toMoreProjectsFromWorkJournal(workItem, allStudies)}
      />
    );
  }

  const legacyCaseStudy = await loadLegacyCaseStudy(slug);
  if (legacyCaseStudy) {
    return <NativeRouteDocument document={withRipeLoaderStyles(legacyCaseStudy)} />;
  }

  notFound();
}

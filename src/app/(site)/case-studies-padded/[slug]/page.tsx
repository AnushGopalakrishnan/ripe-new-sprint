import { notFound } from "next/navigation";
import { NativeRouteDocument } from "@/components/native-route-document";
import { workJournalItems, type WorkJournalItem } from "@/data/work-journal";
import { getCaseStudies, getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import type { CaseStudy, CommentableMedia, MediaAsset, PlacedComment } from "@/types/content";
import { CaseStudyClient } from "./case-study-client-padded";

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
  longForm?: {
    enabled: boolean;
    hlsUrl?: string;
  };
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
    longForm: media.longForm,
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

function countVisibleTemplateCells(
  rows: NonNullable<NonNullable<CaseStudy["detailLayoutEntries"]>[number]["layout"]>["rows"] | undefined,
) {
  const sourceRows = Array.isArray(rows) ? rows : [];
  const coveredSlots = new Set<string>();
  let visibleCount = 0;

  for (let rowIndex = 0; rowIndex < sourceRows.length; rowIndex += 1) {
    const row = sourceRows[rowIndex];
    const cells = Array.isArray(row.cells) ? row.cells : [];

    for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
      const slotId = `${rowIndex}:${cellIndex}`;
      if (coveredSlots.has(slotId)) continue;

      visibleCount += 1;
      const cell = cells[cellIndex];
      const maxSpan = Math.max(sourceRows.length - rowIndex, 1);
      const rawSpan = typeof cell.rowSpan === "number" ? Math.floor(cell.rowSpan) : 1;
      const rowSpan = Math.max(1, Math.min(rawSpan || 1, maxSpan));
      for (let offset = 1; offset < rowSpan; offset += 1) {
        coveredSlots.add(`${rowIndex + offset}:${cellIndex}`);
      }
    }
  }

  return visibleCount;
}

function isCompleteLayoutEntry(entry: NonNullable<CaseStudy["detailLayoutEntries"]>[number] | undefined) {
  const expectedCount = countVisibleTemplateCells(entry?.layout?.rows);
  const contentItems = Array.isArray(entry?.content) ? entry.content : [];
  return expectedCount > 0 && contentItems.length === expectedCount && contentItems.every((item) => Boolean(item?.media?.src));
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
  const mapTemplateLayoutRows = (
    rows: NonNullable<NonNullable<CaseStudy["detailLayoutEntries"]>[number]["layout"]>["rows"] | undefined,
    contentItems: NonNullable<NonNullable<CaseStudy["detailLayoutEntries"]>[number]["content"]>,
  ) => {
    const sourceRows = Array.isArray(rows) ? rows : [];
    const coveredSlots = new Set<string>();
    let contentPointer = 0;

    return sourceRows.map((row, rowIndex) => ({
      height: row.height,
      cells:
        row.cells?.flatMap((cell, cellIndex) => {
          const slotId = `${rowIndex}:${cellIndex}`;
          const maxSpan = Math.max(sourceRows.length - rowIndex, 1);
          const rawSpan = typeof cell.rowSpan === "number" ? Math.floor(cell.rowSpan) : 1;
          const rowSpan = Math.max(1, Math.min(rawSpan || 1, maxSpan));
          const hiddenByRowSpan = coveredSlots.has(slotId);

          if (hiddenByRowSpan) return [];

          const contentItem = contentItems[contentPointer];
          contentPointer += 1;

          if (rowSpan > 1) {
            for (let offset = 1; offset < rowSpan; offset += 1) {
              coveredSlots.add(`${rowIndex + offset}:${cellIndex}`);
            }
          }

          return [
            {
              width: cell.width || 1,
              media: toClientMedia(contentItem, baseMedia),
            },
          ];
        }) ?? [],
    }));
  };
  const carouselSlides =
    study.detailCarouselSlides?.map((slide, index) =>
      toClientMedia(slide, {
        ...baseMedia,
        alt: `${study.title} carousel image ${index + 1}`,
      }),
    ) ?? [];
  const layoutsFromTemplates =
    study.detailLayoutEntries?.filter(isCompleteLayoutEntry).map((entry, entryIndex) => {
      const layout = entry.layout;
      const contentItems = Array.isArray(entry.content) ? entry.content : [];

      return {
        id: entry._key || `${study.slug}-layout-entry-${entryIndex}`,
        preset: layout?.preset || "layout1",
        designWidth: layout?.designWidth ?? 1440,
        gap: layout?.gap,
        rows: mapTemplateLayoutRows(layout?.rows, contentItems),
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
    accentColor: study.accentColor || undefined,
    heroNote: "Scroll to view more",
    eyebrow: study.detailEyebrow || study.summary,
    services: uniqueDetailServices,
    serviceDebug: {
      detailServices: study.detailServices,
      detailServiceTitles: study.detailServiceTitles,
      detailServiceRefs: study.detailServiceRefs,
      detailServiceItems: study.detailServiceItems,
    },
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
    accentColor: item.accentColor || undefined,
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
      path: `/case-studies-padded/${slug}`,
    });
  }

  const workItem = workJournalItems.find((item) => item.slug === slug);
  if (workItem) {
    return createExactTitleMetadata({
      title: `${workItem.title} - Case Study`,
      description: workItem.description,
      path: `/case-studies-padded/${slug}`,
    });
  }

  const legacyCaseStudy = await loadLegacyCaseStudy(slug);
  if (legacyCaseStudy) {
    return createExactTitleMetadata({
      title: legacyCaseStudy.title,
      path: `/case-studies-padded/${slug}`,
    });
  }

  return createExactTitleMetadata({
    title: "Case Study",
    path: `/case-studies-padded/${slug}`,
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

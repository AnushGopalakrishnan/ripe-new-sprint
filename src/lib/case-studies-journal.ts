import { workJournalFilters, workJournalItems, type WorkJournalItem } from "@/data/work-journal";
import type { CaseStudy } from "@/types/content";

function normalizeFilters(tags: string[]) {
  const cleanTags = tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  const preferred = workJournalFilters.filter((filter) => cleanTags.includes(filter));
  const extras = tags
    .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    .filter((tag) => !preferred.includes(tag))
    .sort((a, b) => a.localeCompare(b));
  return [...preferred, ...extras];
}

function chooseImage(study: CaseStudy) {
  if (study.coverMedia.kind === "image") return study.coverMedia.src;
  if (study.coverMedia.poster) return study.coverMedia.poster;
  return study.coverMedia.src;
}

export function mergeCaseStudiesAsJournalItems(studies: CaseStudy[]) {
  const itemMap = new Map<string, WorkJournalItem>();

  for (const study of studies) {
    itemMap.set(study.slug, {
      title: study.title,
      slug: study.slug,
      description: study.summary,
      industry: study.client || study.tags[0] || "Work",
      image: chooseImage(study),
      tags: Array.isArray(study.tags)
        ? study.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        : [],
      year: study.year || "",
      accentColor: study.accentColor,
      coverMedia: study.coverMedia,
    });
  }

  for (const item of workJournalItems) {
    if (itemMap.has(item.slug)) continue;
    itemMap.set(item.slug, item);
  }

  const items = Array.from(itemMap.values());
  const filters = normalizeFilters(Array.from(new Set(items.flatMap((item) => item.tags))));

  return { items, filters };
}

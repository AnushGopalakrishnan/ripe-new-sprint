import { notFound } from "next/navigation";
import { RipeNativeShell } from "@/components/ripe-native-shell";
import { WorkJournalSection } from "@/components/work-journal-section";
import { mergeCaseStudiesAsJournalItems } from "@/lib/case-studies-journal";
import { getCaseStudies } from "@/lib/content";
import { createExactTitleMetadata } from "@/lib/metadata";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

type CaseStudyTagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<WorkJournalSearchParams>;
};

function toTagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  const { filters } = mergeCaseStudiesAsJournalItems(studies);
  return filters.map((filter) => ({ slug: toTagSlug(filter) }));
}

export async function generateMetadata({ params }: CaseStudyTagPageProps) {
  const { slug } = await params;
  const studies = await getCaseStudies();
  const { filters } = mergeCaseStudiesAsJournalItems(studies);
  const activeTag = filters.find((tag) => toTagSlug(tag) === slug);

  if (!activeTag) {
    return createExactTitleMetadata({
      title: "Case Studies",
      path: `/case-studies/tags/${slug}`,
    });
  }

  return createExactTitleMetadata({
    title: `Case Studies - ${activeTag}`,
    path: `/case-studies/tags/${slug}`,
  });
}

export default async function CaseStudyTagPage({ params, searchParams }: CaseStudyTagPageProps) {
  const { slug } = await params;
  const studies = await getCaseStudies();
  const { items, filters } = mergeCaseStudiesAsJournalItems(studies);
  const activeTag = filters.find((tag) => toTagSlug(tag) === slug);

  if (!activeTag) {
    notFound();
  }

  const initialState = parseWorkJournalUrlState(await searchParams, filters);
  const initialFilters = initialState.initialFilters.includes(activeTag)
    ? initialState.initialFilters
    : [...initialState.initialFilters, activeTag];

  return (
    <RipeNativeShell>
      <main className="main">
        <WorkJournalSection
          filters={filters}
          items={items}
          layout="alternating"
          initialFilters={initialFilters}
          initialViewMode={initialState.initialViewMode}
        />
      </main>
    </RipeNativeShell>
  );
}

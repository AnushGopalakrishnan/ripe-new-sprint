import parse from "html-react-parser";
import { notFound } from "next/navigation";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { WorkJournalSection } from "@/components/work-journal-section";
import { getCaseStudies } from "@/lib/content";
import { mergeCaseStudiesAsJournalItems } from "@/lib/case-studies-journal";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

const sourceRoute = "/archive/work";
const title = "Case Studies";
const mainMarker = '<section class="main">';
const footerMarker = '<section class="footer-wrap">';

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

  const sourceDocument = await loadNativeMirrorDocument(sourceRoute);
  const document = prepareStaticMirrorDocument(withRipeLoaderStyles({ ...sourceDocument, title }));
  const split = splitWorkShell(document);

  if (!split) {
    return (
      <WorkJournalSection
        filters={filters}
        items={items}
        layout="alternating"
        initialFilters={initialFilters}
        initialViewMode={initialState.initialViewMode}
      />
    );
  }

  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={document.bodyAttributes}
        executeScripts={false}
        htmlAttributes={document.htmlAttributes}
        sourceRoute={document.sourceRoute}
        webflowRuntime={false}
      />
      {parse(document.headMarkup)}
      {parse(split.beforeMain)}
      <main className="main">
        <WorkJournalSection
          filters={filters}
          items={items}
          layout="alternating"
          initialFilters={initialFilters}
          initialViewMode={initialState.initialViewMode}
        />
      </main>
      {parse(split.footerAndScripts)}
    </>
  );
}

function splitWorkShell(document: NativeMirrorDocument) {
  const mainStart = document.bodyMarkup.indexOf(mainMarker);
  const footerStart = document.bodyMarkup.indexOf(footerMarker);

  if (mainStart === -1 || footerStart === -1 || footerStart <= mainStart) return null;

  return {
    beforeMain: document.bodyMarkup.slice(0, mainStart),
    footerAndScripts: document.bodyMarkup.slice(footerStart),
  };
}

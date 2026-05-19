import parse from "html-react-parser";
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
const canonicalPath = "/case-studies";
const title = "Case Studies";
const mainMarker = '<section class="main">';
const footerMarker = '<section class="footer-wrap">';

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

type CaseStudiesPageProps = {
  searchParams?: Promise<WorkJournalSearchParams>;
};

export default async function CaseStudiesPage({ searchParams }: CaseStudiesPageProps) {
  const studies = await getCaseStudies();
  const { items, filters } = mergeCaseStudiesAsJournalItems(studies);
  const initialState = parseWorkJournalUrlState(await searchParams, filters);
  const sourceDocument = await loadNativeMirrorDocument(sourceRoute);
  const document = prepareStaticMirrorDocument(withRipeLoaderStyles({ ...sourceDocument, title }));
  const split = splitWorkShell(document);

  if (!split) {
    return <WorkJournalSection filters={filters} items={items} layout="alternating" {...initialState} />;
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
        <WorkJournalSection filters={filters} items={items} layout="alternating" {...initialState} />
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

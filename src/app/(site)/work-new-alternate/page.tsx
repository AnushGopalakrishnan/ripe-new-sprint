import parse from "html-react-parser";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { WorkJournalSection } from "@/components/work-journal-section";
import { workJournalFilters, workJournalItems } from "@/data/work-journal";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";
import { parseWorkJournalUrlState, type WorkJournalSearchParams } from "@/lib/work-journal-url-state";

const sourceRoute = "/archive/work";
const canonicalPath = "/work-new-alternate";
const title = "Work (alternate journal)";
const mainMarker = '<section class="main">';
const footerMarker = '<section class="footer-wrap">';

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

type WorkNewPageProps = {
  searchParams?: Promise<WorkJournalSearchParams>;
};

export default async function WorkNewPage({ searchParams }: WorkNewPageProps) {
  const initialState = parseWorkJournalUrlState(await searchParams, workJournalFilters);
  const sourceDocument = await loadNativeMirrorDocument(sourceRoute);
  const document = prepareStaticMirrorDocument(withRipeLoaderStyles({ ...sourceDocument, title }));
  const split = splitWorkShell(document);

  if (!split) {
    return (
      <WorkJournalSection filters={workJournalFilters} items={workJournalItems} layout="alternating" {...initialState} />
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
          filters={workJournalFilters}
          items={workJournalItems}
          layout="alternating"
          {...initialState}
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

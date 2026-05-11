import parse from "html-react-parser";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { WorkJournalSection } from "@/components/work-journal-section";
import { workJournalFilters, workJournalItems } from "@/data/work-journal";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";

const sourceRoute = "/archive/work";
const canonicalPath = "/work-new";
const title = "Work (new journal)";
const mainMarker = '<section class="main">';
const footerMarker = '<section class="footer-wrap">';

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

export default async function WorkNewPage() {
  const sourceDocument = await loadNativeMirrorDocument(sourceRoute);
  const document = withRipeLoaderStyles({ ...sourceDocument, title });
  const split = splitWorkShell(document);

  if (!split) {
    return <WorkJournalSection filters={workJournalFilters} items={workJournalItems} />;
  }

  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={document.bodyAttributes}
        htmlAttributes={document.htmlAttributes}
        sourceRoute={document.sourceRoute}
      />
      {parse(document.headMarkup)}
      {parse(split.beforeMain)}
      <main className="main">
        <WorkJournalSection filters={workJournalFilters} items={workJournalItems} />
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

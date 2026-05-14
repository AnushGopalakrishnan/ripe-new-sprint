import parse from "html-react-parser";
import { HomeCopyFeed } from "@/components/home-copy-feed";
import { NativeRouteDocument } from "@/components/native-route-document";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { prepareHomeFirstPaintDocument } from "@/lib/home-first-paint";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";

const path = "/home-copy";
const title = "Home Copy";
const latestUpdatesMarker = '<section data-theme-section="light" class="latest-updates">';
const latestUpdatesEndMarker = '</section></section><div data-wf-target';

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path,
  });
}

export default async function HomeCopyPage() {
  const document = await loadNativeMirrorDocument("/");
  const nextDocument = prepareStaticMirrorDocument(
    prepareHomeFirstPaintDocument(withRipeLoaderStyles({ ...document, title })),
  );
  const split = splitHomeFeed(nextDocument);

  if (!split) {
    return <NativeRouteDocument document={nextDocument} executeScripts={false} webflowRuntime={false} />;
  }

  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={nextDocument.bodyAttributes}
        executeScripts={false}
        htmlAttributes={nextDocument.htmlAttributes}
        sourceRoute={nextDocument.sourceRoute}
        webflowRuntime={false}
      />
      {parse(nextDocument.headMarkup)}
      {parse(split.before)}
      <HomeCopyFeed />
      {parse(split.after)}
    </>
  );
}

function splitHomeFeed(document: NativeMirrorDocument) {
  const start = document.bodyMarkup.indexOf(latestUpdatesMarker);
  if (start === -1) return null;

  const end = document.bodyMarkup.indexOf(latestUpdatesEndMarker, start);
  if (end === -1) return null;

  return {
    before: document.bodyMarkup.slice(0, start),
    after: document.bodyMarkup.slice(end + "</section>".length),
  };
}

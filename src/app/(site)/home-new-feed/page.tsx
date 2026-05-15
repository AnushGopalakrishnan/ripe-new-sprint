import { NativeRouteDocument } from "@/components/native-route-document";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { HomeFeed } from "@/components/home-feed";
import { prepareHomeNewFeedFirstPaintDocument } from "@/lib/home-new-feed-first-paint";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";
import parse from "html-react-parser";

const sourceRoute = "/";
const canonicalPath = "/home-new-feed";
const title = "Home (new feed)";
const latestUpdatesMarker = '<section data-theme-section="light" class="latest-updates">';
const latestUpdatesEndMarkers = [
  '</section></section><div class="bg_color-overlay"',
  "</section></section><div data-wf-target",
];

export async function generateMetadata() {
  return createExactTitleMetadata({
    title,
    path: canonicalPath,
  });
}

export default async function HomeNewFeedPage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  const nextDocument = prepareStaticMirrorDocument(
    prepareHomeNewFeedFirstPaintDocument(withRipeLoaderStyles({ ...document, title })),
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
      <HomeFeed />
      {parse(split.after)}
    </>
  );
}

function splitHomeFeed(document: NativeMirrorDocument) {
  const start = document.bodyMarkup.indexOf(latestUpdatesMarker);
  if (start === -1) return null;

  const end = latestUpdatesEndMarkers
    .map((marker) => document.bodyMarkup.indexOf(marker, start))
    .find((index) => index !== -1);
  if (end === undefined) return null;

  return {
    before: document.bodyMarkup.slice(0, start),
    after: document.bodyMarkup.slice(end + "</section>".length),
  };
}

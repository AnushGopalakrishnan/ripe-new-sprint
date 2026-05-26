import parse from "html-react-parser";
import { HomeFeed } from "@/components/home-feed";
import { RipeNativeShell } from "@/components/ripe-native-shell";
import { prepareHomeNewFeedFirstPaintDocument } from "@/lib/home-new-feed-first-paint";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { getMirrorContentWithoutShell } from "@/lib/ripe-native-shell";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";

const sourceRoute = "/";
const canonicalPath = "/";
const title = "The Natural Outcome | Ripe Studios";
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

export default async function HomePage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  const nextDocument = prepareStaticMirrorDocument(
    prepareHomeNewFeedFirstPaintDocument(withRipeLoaderStyles({ ...document, title })),
  );
  const contentDocument = {
    ...nextDocument,
    bodyMarkup: getMirrorContentWithoutShell(nextDocument),
  };
  const split = splitHomeFeed(contentDocument);

  return (
    <>
      {parse(nextDocument.headMarkup)}
      <RipeNativeShell bodyAttributes={nextDocument.bodyAttributes}>
        {split ? (
          <>
            {parse(split.before)}
            <HomeFeed />
            {parse(split.after)}
          </>
        ) : (
          parse(contentDocument.bodyMarkup)
        )}
      </RipeNativeShell>
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

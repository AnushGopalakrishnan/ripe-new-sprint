import parse from "html-react-parser";
import { RipeNativeShell } from "@/components/ripe-native-shell";
import { prepareHomeFirstPaintDocument } from "@/lib/home-first-paint";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { getMirrorContentWithoutShell } from "@/lib/ripe-native-shell";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument("/");
  return createExactTitleMetadata({
    title: document.title,
    path: "/home-old-feed",
  });
}

export default async function HomeOldFeedPage() {
  const document = await loadNativeMirrorDocument("/");
  const nextDocument = prepareStaticMirrorDocument(prepareHomeFirstPaintDocument(withRipeLoaderStyles(document)));
  const contentMarkup = getMirrorContentWithoutShell(nextDocument);

  return (
    <>
      {parse(nextDocument.headMarkup)}
      <RipeNativeShell bodyAttributes={nextDocument.bodyAttributes}>{parse(contentMarkup)}</RipeNativeShell>
    </>
  );
}

import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { prepareHomeFirstPaintDocument } from "@/lib/home-first-paint";
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
  return (
    <NativeRouteDocument
      document={prepareStaticMirrorDocument(prepareHomeFirstPaintDocument(withRipeLoaderStyles(document)))}
      executeScripts={false}
      webflowRuntime={false}
    />
  );
}

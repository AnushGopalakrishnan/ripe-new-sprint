import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { prepareHomeFirstPaintDocument } from "@/lib/home-first-paint";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument("/");
  return createExactTitleMetadata({
    title: document.title,
    path: "/",
  });
}

export default async function HomePage() {
  const document = await loadNativeMirrorDocument("/");
  return <NativeRouteDocument document={prepareHomeFirstPaintDocument(withRipeLoaderStyles(document))} />;
}

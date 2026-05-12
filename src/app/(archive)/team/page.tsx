import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";

const sourceRoute = "/archive/team-new";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return createExactTitleMetadata({
    title: document.title,
    path: "/team",
  });
}

export default async function TeamIndexPage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return <NativeRouteDocument document={withRipeLoaderStyles(document)} />;
}

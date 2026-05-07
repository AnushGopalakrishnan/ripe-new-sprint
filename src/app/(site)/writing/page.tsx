import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";

const sourceRoute = "/archive/writing-new-copy";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return createExactTitleMetadata({
    title: document.title,
    path: "/writing",
  });
}

export default async function WritingIndexPage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return <NativeRouteDocument document={document} />;
}

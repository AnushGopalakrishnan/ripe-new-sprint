import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";

const sourceRoute = "/archive/work";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return createExactTitleMetadata({
    title: document.title,
    path: "/work",
  });
}

export default async function WorkPage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return <NativeRouteDocument document={document} />;
}

import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";

const sourceRoute = "/archive/careers";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return createExactTitleMetadata({
    title: document.title,
    path: "/careers",
  });
}

export default async function CareersPage() {
  const document = await loadNativeMirrorDocument(sourceRoute);
  return <NativeRouteDocument document={document} />;
}

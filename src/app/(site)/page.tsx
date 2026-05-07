import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument } from "@/lib/native-mirror";

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument("/");
  return createExactTitleMetadata({
    title: document.title,
    path: "/",
  });
}

export default async function HomePage() {
  const document = await loadNativeMirrorDocument("/");
  return <NativeRouteDocument document={document} />;
}

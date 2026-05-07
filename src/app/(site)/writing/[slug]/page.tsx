import { notFound } from "next/navigation";
import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { getNativeWritingSlugs, loadNativeMirrorDocument } from "@/lib/native-mirror";

type WritingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getNativeWritingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WritingPageProps) {
  const { slug } = await params;
  const document = await loadNativeMirrorDocument(`/writing/${slug}`);
  return createExactTitleMetadata({
    title: document.title,
    path: `/writing/${slug}`,
  });
}

export default async function WritingPostPage({ params }: WritingPageProps) {
  const { slug } = await params;
  let document;

  try {
    document = await loadNativeMirrorDocument(`/writing/${slug}`);
  } catch {
    notFound();
  }

  return <NativeRouteDocument document={document} />;
}

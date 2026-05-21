import { notFound } from "next/navigation";
import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import { getNativeTeamSlugs, loadNativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";

type TeamDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getNativeTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TeamDetailPageProps) {
  const { slug } = await params;
  const document = await loadNativeMirrorDocument(`/team/${slug}`);
  return createExactTitleMetadata({
    title: document.title,
    path: `/team/${slug}`,
  });
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slug } = await params;
  let document;

  try {
    document = await loadNativeMirrorDocument(`/team/${slug}`);
  } catch {
    notFound();
  }

  return <NativeRouteDocument document={withRipeLoaderStyles(document)} />;
}

import { notFound } from "next/navigation";
import { NativeRouteDocument } from "@/components/native-route-document";
import { createExactTitleMetadata } from "@/lib/metadata";
import {
  getNativeCaseStudyTagSlugs,
  loadNativeMirrorDocument,
  sourceRouteForCanonicalCaseStudyTag,
} from "@/lib/native-mirror";

type CaseStudyTagPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getNativeCaseStudyTagSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyTagPageProps) {
  const { slug } = await params;
  const document = await loadNativeMirrorDocument(sourceRouteForCanonicalCaseStudyTag(slug));
  return createExactTitleMetadata({
    title: document.title,
    path: `/case-studies/tags/${slug}`,
  });
}

export default async function CaseStudyTagPage({ params }: CaseStudyTagPageProps) {
  const { slug } = await params;
  let document;

  try {
    document = await loadNativeMirrorDocument(sourceRouteForCanonicalCaseStudyTag(slug));
  } catch {
    notFound();
  }

  return <NativeRouteDocument document={document} />;
}

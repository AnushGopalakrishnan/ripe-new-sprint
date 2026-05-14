import parse from "html-react-parser";
import { NativeRouteDocument } from "@/components/native-route-document";
import { NativeRouteRuntime } from "@/components/native-route-runtime";
import { prepareHomeFirstPaintDocument } from "@/lib/home-first-paint";
import { createExactTitleMetadata } from "@/lib/metadata";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { withRipeLoaderStyles } from "@/lib/ripe-loader-styles";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";
import { HomeMotionHero } from "./_components/home-motion-hero";

const path = "/home-motion-hero";
const title = "Home Motion Hero";
const heroMarker = '<section data-theme-section="light" class="hero_section section u-align-center">';
const heroEndMarker = '</section><section class="showreel_section static">';

export async function generateMetadata() {
  const document = await loadNativeMirrorDocument("/");

  return createExactTitleMetadata({
    path,
    title: `${title} | ${document.title}`,
  });
}

export default async function HomeMotionHeroPage() {
  const document = await loadNativeMirrorDocument("/");
  const nextDocument = prepareStaticMirrorDocument(
    prepareHomeFirstPaintDocument(withRipeLoaderStyles({ ...document, title })),
  );
  const split = splitHomeHero(nextDocument);

  if (!split) {
    return <NativeRouteDocument document={nextDocument} executeScripts={false} webflowRuntime={false} />;
  }

  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={nextDocument.bodyAttributes}
        executeScripts={false}
        htmlAttributes={nextDocument.htmlAttributes}
        sourceRoute={nextDocument.sourceRoute}
        webflowRuntime={false}
      />
      {parse(nextDocument.headMarkup)}
      {parse(split.before)}
      <HomeMotionHero />
      {parse(split.after)}
    </>
  );
}

function splitHomeHero(document: NativeMirrorDocument) {
  const start = document.bodyMarkup.indexOf(heroMarker);
  if (start === -1) return null;

  const end = document.bodyMarkup.indexOf(heroEndMarker, start);
  if (end === -1) return null;

  return {
    before: document.bodyMarkup.slice(0, start),
    after: document.bodyMarkup.slice(end + "</section>".length),
  };
}

import type { NativeMirrorDocument } from "@/lib/native-mirror";

const homeNewFeedFirstPaintStyles = `
<style data-ripe-home-new-feed-first-paint>
body[data-home-new-feed-ssr="true"] .article-cards-wrap.u-align-center {
  width: 100%;
}

body[data-home-new-feed-ssr="true"] .hero_feature,
body[data-home-new-feed-ssr="true"] .hero_articles-list {
  width: 100%;
}

body[data-home-new-feed-ssr="true"] .article-card {
  opacity: 1;
  transform: none;
}
</style>`;

export function prepareHomeNewFeedFirstPaintDocument(
  document: NativeMirrorDocument,
): NativeMirrorDocument {
  if (document.headMarkup.includes("data-ripe-home-new-feed-first-paint")) return document;

  return {
    ...document,
    bodyAttributes: {
      ...document.bodyAttributes,
      "data-home-new-feed-ssr": "true",
    },
    headMarkup: `${document.headMarkup}${homeNewFeedFirstPaintStyles}`,
  };
}

import type { NativeMirrorDocument } from "@/lib/native-mirror";

const homeNewFeedFirstPaintStyles = `
<style data-ripe-home-new-feed-first-paint>
.article-cards-wrap.u-align-center {
  width: 100%;
}

.hero_feature,
.hero_articles-list {
  width: 100%;
}

.article-card {
  border-radius: 10px;
  opacity: 1;
  overflow: hidden;
  transform: none;
}

.article-card-img-wrap {
  border-radius: inherit;
  overflow: hidden;
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

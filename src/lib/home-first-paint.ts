import type { NativeMirrorDocument } from "@/lib/native-mirror";

const homeFirstPaintStyles = `
<style data-ripe-home-first-paint>
.masonry-list.w-dyn-items {
  display: block !important;
}

.article-cards-wrap.u-align-center {
  width: 100% !important;
}

.hero_feature,
.hero_articles-list {
  width: 100% !important;
}

.article-card {
  opacity: 1 !important;
  transform: none !important;
}

.masonry-list {
  position: relative !important;
  width: 100% !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.masonry-item {
  width: calc((100% - 192px) / 3) !important;
  box-sizing: border-box !important;
  padding-bottom: 96px !important;
  min-width: 0 !important;
}

@media screen and (min-width: 992px) {
  .masonry-list:not(.is-ready) {
    height: 2964.5px !important;
  }

  .masonry-list:not(.is-ready) > .masonry-item {
    position: absolute !important;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(1) {
    left: 0;
    top: 0;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(2) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 0;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(3) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 0;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(4) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 730px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(5) {
    left: 0;
    top: 768.672px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(6) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 768.672px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(7) {
    left: 0;
    top: 1427.16px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(8) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 1509.98px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(9) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 1537.34px;
  }

  .masonry-list:not(.is-ready) > .masonry-item:nth-child(10) {
    left: 0;
    top: 2195.83px;
  }
}

@media screen and (max-width: 991px) {
  .masonry-item {
    width: calc((100% - 128px) / 2) !important;
  }
}

@media screen and (max-width: 767px) {
  .masonry-item {
    width: calc((100% - 64px) / 2) !important;
    padding-bottom: 64px !important;
  }
}

@media screen and (max-width: 479px) {
  .masonry-item {
    width: calc((100% - 24px) / 2) !important;
  }
}
</style>`;

export function prepareHomeFirstPaintDocument(document: NativeMirrorDocument): NativeMirrorDocument {
  if (document.headMarkup.includes("data-ripe-home-first-paint")) return document;

  return {
    ...document,
    bodyAttributes: {
      ...document.bodyAttributes,
      "data-home-masonry-ssr": "true",
    },
    headMarkup: `${document.headMarkup}${homeFirstPaintStyles}`,
  };
}

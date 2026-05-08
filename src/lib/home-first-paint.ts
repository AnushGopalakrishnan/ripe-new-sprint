import type { NativeMirrorDocument } from "@/lib/native-mirror";

const homeFirstPaintStyles = `
<style data-ripe-home-first-paint>
body[data-home-masonry-ssr="true"] .masonry-list.w-dyn-items {
  display: block !important;
}

body[data-home-masonry-ssr="true"] .masonry-list {
  position: relative !important;
  width: 100% !important;
  visibility: visible !important;
  opacity: 1 !important;
}

body[data-home-masonry-ssr="true"] .masonry-item {
  width: calc((100% - 192px) / 3) !important;
  box-sizing: border-box !important;
  padding-bottom: 96px !important;
  min-width: 0 !important;
}

@media screen and (min-width: 992px) {
  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) {
    height: 2964.5px !important;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item {
    position: absolute !important;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(1) {
    left: 0;
    top: 0;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(2) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 0;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(3) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 0;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(4) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 730px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(5) {
    left: 0;
    top: 768.672px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(6) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 768.672px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(7) {
    left: 0;
    top: 1427.16px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(8) {
    left: calc((100% - 192px) / 3 + 96px);
    top: 1509.98px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(9) {
    left: calc(((100% - 192px) / 3 + 96px) * 2);
    top: 1537.34px;
  }

  body[data-home-masonry-ssr="true"] .masonry-list:not(.is-ready) > .masonry-item:nth-child(10) {
    left: 0;
    top: 2195.83px;
  }
}

@media screen and (max-width: 991px) {
  body[data-home-masonry-ssr="true"] .masonry-item {
    width: calc((100% - 128px) / 2) !important;
  }
}

@media screen and (max-width: 767px) {
  body[data-home-masonry-ssr="true"] .masonry-item {
    width: calc((100% - 64px) / 2) !important;
    padding-bottom: 64px !important;
  }
}

@media screen and (max-width: 479px) {
  body[data-home-masonry-ssr="true"] .masonry-item {
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

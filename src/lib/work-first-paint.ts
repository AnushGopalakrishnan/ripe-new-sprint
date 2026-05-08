import type { NativeMirrorDocument } from "@/lib/native-mirror";

const workFirstPaintStyles = `
<style data-ripe-work-first-paint>
body[data-work-grid-ssr="true"] .case-studies-wrapper {
  width: 100% !important;
  max-width: none !important;
  display: block !important;
}

body[data-work-grid-ssr="true"] .case-studies-list {
  width: 100% !important;
  max-width: none !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

body[data-work-grid-ssr="true"] .masonry-item {
  width: auto !important;
  min-width: 0 !important;
}

@media screen and (max-width: 991px) {
  body[data-work-grid-ssr="true"] .case-studies-list {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media screen and (max-width: 479px) {
  body[data-work-grid-ssr="true"] .case-studies-list {
    grid-template-columns: 1fr !important;
  }
}
</style>`;

export function prepareWorkFirstPaintDocument(document: NativeMirrorDocument): NativeMirrorDocument {
  if (document.headMarkup.includes("data-ripe-work-first-paint")) return document;

  return {
    ...document,
    bodyAttributes: {
      ...document.bodyAttributes,
      "data-work-grid-ssr": "true",
    },
    headMarkup: `${document.headMarkup}${workFirstPaintStyles}`,
  };
}

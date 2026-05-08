import type { NativeMirrorDocument } from "@/lib/native-mirror";

type WritingFeedItem = {
  imageAlt: string;
  imageSrc: string;
  imageSrcset: string;
  imageSizes: string;
  link: string;
  summary: string;
  tag: string;
  title: string;
};

const tagsBySlug: Record<string, string> = {
  "developing-your-writing-voice": "Process",
  "the-art-of-storytelling": "Story",
  "the-power-of-words": "Language",
  "the-role-of-research-in-writing": "Research",
  "understanding-writing-techniques": "Craft",
  "writing-for-different-audiences": "Audience",
};

const fallbackTags: Record<string, string> = {
  "Understanding Writing Techniques": "Craft",
  "Writing for Different Audiences": "Audience",
  "The Power of Words": "Language",
  "The Role of Research in Writing": "Research",
  "The Art of Storytelling": "Story",
  "Developing Your Writing Voice": "Process",
};

const ssrStyles = `
<style data-ripe-writing-feed-ssr>
.writings-hidden-cms,
body.writing-feed-page .writings-hidden-cms {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"],
body.writing-feed-page [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] {
  width: 100%;
  height: 60vh;
  min-height: 0;
  max-height: 60vh;
  opacity: 1 !important;
  overflow-x: hidden;
  overflow-y: hidden;
  box-sizing: border-box;
}

[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] > [data-template],
body.writing-feed-page [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] > [data-template] {
  display: none !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .writing-feed-track {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: max-content;
  height: 100%;
  flex-shrink: 0;
  gap: 8rem;
  box-sizing: border-box;
}

[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .horizontal__panel {
  flex-shrink: 0;
}

[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .writing-feed-large-title,
[data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .writing-feed-stack-title {
  font-weight: 300 !important;
}

@media screen and (min-width: 992px) {
  [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] {
    padding-left: 4rem;
    padding-right: 4rem;
  }

  [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .horizontal__panel.is-small.writing-feed-stack-panel,
  [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .horizontal__panel-inner.u-flex-vertical.is-small.writing-feed-stack-inner {
    width: 500px !important;
    max-width: 500px;
  }

  [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .demo-card.is-small.writing-feed-stack-card.w-inline-block {
    --writing-feed-stack-card-height: 10rem;
    flex: 0 0 auto !important;
    width: 100% !important;
    height: var(--writing-feed-stack-card-height) !important;
    max-height: var(--writing-feed-stack-card-height) !important;
    grid-template-columns: calc(var(--writing-feed-stack-card-height) * 4 / 3) minmax(0, 1fr);
    align-items: stretch;
    max-width: 100%;
  }

  [data-horizontal-scroll-wrap][data-ssr-writing-feed="true"] .demo-card__bg-img.is-small-card-img.writing-feed-stack-image {
    width: 100% !important;
    height: 100% !important;
    max-width: none;
    align-self: stretch;
    justify-self: stretch;
  }
}
</style>`;

function getAttribute(markup: string, name: string) {
  const pattern = new RegExp(`${name}=(["'])(.*?)\\1`, "i");
  return markup.match(pattern)?.[2] ?? "";
}

function getField(markup: string, field: string, tagName: string) {
  const pattern = new RegExp(
    `<${tagName}\\b(?=[^>]*data-field=["']${field}["'])[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i",
  );
  return stripTags(markup.match(pattern)?.[1] ?? "");
}

function stripTags(markup: string) {
  return markup
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSlugFromHref(href: string) {
  const pathname = href.split("?")[0]?.replace(/\/+$/, "") ?? "";
  return pathname.split("/").filter(Boolean).pop() ?? "";
}

function getWritingFeedItems(bodyMarkup: string) {
  const listMatch = bodyMarkup.match(
    /<div fs-list-element="list"[^>]*class="w-dyn-items">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<section>/i,
  );
  const listMarkup = listMatch?.[1] ?? "";
  const itemChunks = listMarkup
    .split('<div role="listitem" class="w-dyn-item">')
    .slice(1)
    .map((chunk) => chunk.replace(/<\/div>\s*$/, ""));

  return itemChunks
    .map((itemMarkup) => {
      const image = itemMarkup.match(/<img\b(?=[^>]*data-field=["']image["'])[^>]*>/i)?.[0] ?? "";
      const linkMarkup = itemMarkup.match(/<a\b(?=[^>]*data-field=["']slug["'])[^>]*>/i)?.[0] ?? "";
      const title = getField(itemMarkup, "title", "h3");
      const link = getAttribute(linkMarkup, "href");
      const slug = getSlugFromHref(link);

      return {
        imageAlt: getAttribute(image, "alt") || title,
        imageSizes: getAttribute(image, "sizes"),
        imageSrc: getAttribute(image, "src"),
        imageSrcset: getAttribute(image, "srcset"),
        link,
        summary: getField(itemMarkup, "summary", "p"),
        tag: tagsBySlug[slug] || fallbackTags[title] || "",
        title,
      };
    })
    .filter((item) => item.title && item.link);
}

function renderImage(item: WritingFeedItem, className: string, removeDimensions = false) {
  const srcset = item.imageSrcset ? ` srcset="${escapeHtml(item.imageSrcset)}"` : "";
  const sizes = item.imageSizes ? ` sizes="${escapeHtml(item.imageSizes)}"` : "";
  const dimensions = removeDimensions ? "" : "";

  return `<img${sizes}${srcset} alt="${escapeHtml(item.imageAlt)}" src="${escapeHtml(
    item.imageSrc,
  )}" loading="lazy" class="${className}"${dimensions}/>`;
}

function renderLargePanel(item: WritingFeedItem) {
  return `<div data-horizontal-scroll-panel="" class="horizontal__panel"><div class="horizontal__panel-inner"><a href="${escapeHtml(
    item.link,
  )}" class="demo-card is-large w-inline-block"><div class="w-layout-vflex writing_img-wrap writing-feed-large-image-wrap">${renderImage(
    item,
    "demo-card__bg-img writing-feed-large-image",
  )}</div><div class="w-layout-vflex writing_content-block u-flex-horizontal writing-feed-large-content-block"><div class="w-layout-vflex tag-wrap writing-feed-tag-wrap"><div class="w-layout-vflex tag-content"><div fs-list-field="feed-tag" class="tag-text writing-feed-tag-text">${escapeHtml(
    item.tag,
  )}</div></div></div><div class="w-layout-hflex writing_content-wrap u-flex-vertical writing-feed-large-content"><h3 class="writing_item-title h3 writing-feed-large-title">${escapeHtml(
    item.title,
  )}</h3><div class="writing_item-description text writing-feed-large-description">${escapeHtml(
    item.summary,
  )}</div></div></div></a></div></div>`;
}

function renderSmallCard(item: WritingFeedItem) {
  return `<a href="${escapeHtml(
    item.link,
  )}" class="demo-card is-small writing-feed-stack-card w-inline-block">${renderImage(
    item,
    "demo-card__bg-img is-small-card-img writing-feed-stack-image",
    true,
  )}<div class="w-layout-hflex content-wrap u-flex-vertical writing-feed-stack-content"><div class="w-layout-vflex tag-wrap writing-feed-tag-wrap"><div class="w-layout-vflex tag-content"><div fs-list-field="feed-tag" class="tag-text writing-feed-tag-text">${escapeHtml(
    item.tag,
  )}</div><div class="w-layout-vflex icon-wrap writing-feed-hide-icon"></div></div></div><h3 class="writing_item-title h3 is-small writing-feed-stack-title">${escapeHtml(
    item.title,
  )}</h3><div class="writing_item-description text writing-feed-description">${escapeHtml(
    item.summary,
  )}</div></div></a>`;
}

function renderSmallPanel(items: WritingFeedItem[]) {
  return `<div data-horizontal-scroll-panel="" class="horizontal__panel is-small writing-feed-stack-panel"><div class="horizontal__panel-inner u-flex-vertical is-small writing-feed-stack-inner">${items
    .map((item) => renderSmallCard(item))
    .join("")}</div></div>`;
}

function renderPanels(items: WritingFeedItem[]) {
  const panels: string[] = [];
  let index = 0;

  while (index < items.length) {
    panels.push(renderLargePanel(items[index]));
    index += 1;

    const smallItems = items.slice(index, index + 3);
    if (smallItems.length) {
      panels.push(renderSmallPanel(smallItems));
      index += smallItems.length;
    }
  }

  return panels.join("");
}

function addBodyClass(document: NativeMirrorDocument, className: string) {
  const current = document.bodyAttributes.class ?? "";
  const classes = new Set(current.split(/\s+/).filter(Boolean));
  classes.add(className);
  return { ...document.bodyAttributes, class: Array.from(classes).join(" ") };
}

function getTemplateMarkup(wrapInner: string) {
  const largeStart = wrapInner.indexOf('<div data-template="large"');
  const smallStart = wrapInner.indexOf('<div data-template="small"', largeStart + 1);
  const renderedStart = wrapInner.indexOf(
    '<div data-horizontal-scroll-panel="" class="horizontal__panel">',
    smallStart + 1,
  );

  if (largeStart === -1 || smallStart === -1 || renderedStart === -1) return "";
  return `${wrapInner.slice(largeStart, smallStart)}${wrapInner.slice(smallStart, renderedStart)}`;
}

export function prepareWritingIndexDocument(document: NativeMirrorDocument): NativeMirrorDocument {
  const items = getWritingFeedItems(document.bodyMarkup);
  if (!items.length) return document;

  const bodyMarkup = document.bodyMarkup.replace(
    /<section\b(?=[^>]*data-horizontal-scroll-wrap)[^>]*>([\s\S]*?)<\/section>/i,
    (wrapMarkup, wrapInner: string) => {
      const openTag = wrapMarkup.match(/^<section\b[^>]*>/i)?.[0] ?? "";
      const preparedOpenTag = openTag.replace(
        /^<section\b/i,
        '<section data-ssr-writing-feed="true"',
      );
      const templates = getTemplateMarkup(wrapInner);
      return `${preparedOpenTag}<div class="writing-feed-track">${renderPanels(
        items,
      )}</div>${templates}</section>`;
    },
  );

  return {
    ...document,
    bodyAttributes: addBodyClass(document, "writing-feed-page"),
    bodyMarkup,
    headMarkup: document.headMarkup.includes("data-ripe-writing-feed-ssr")
      ? document.headMarkup
      : `${document.headMarkup}${ssrStyles}`,
  };
}

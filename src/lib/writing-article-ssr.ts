import type { NativeMirrorDocument } from "@/lib/native-mirror";

type RichBlock = {
  markup: string;
  type: "image" | "quote" | "text";
};

const articleSsrStyles = `
<style data-ripe-writing-article-ssr>
[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] {
  opacity: 1 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] [data-template] {
  display: none !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] > .writing-article-track {
  display: flex;
  flex-direction: row;
  height: 100%;
  flex-shrink: 0;
  gap: 8rem;
  will-change: transform;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel .article__panel-inner {
  max-height: 60vh;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-hero {
  flex: 0 0 600px !important;
  min-width: 600px !important;
  max-width: 600px !important;
  width: 600px !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;
  row-gap: 0 !important;
  column-gap: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-hero .u-flex-horizontal {
  height: 60vh !important;
  max-height: 60vh !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: stretch !important;
  gap: 0 !important;
  padding-left: 8rem !important;
  box-sizing: border-box !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__hero-image-wrap {
  display: none !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__hero-content {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  gap: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__hero-content > * {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-eyebrow {
  margin-bottom: 2.375rem !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__title {
  margin-top: 0 !important;
  margin-bottom: 0.5rem !important;
  font-size: 56px !important;
  line-height: 1.15 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__summary {
  margin-top: 0 !important;
  margin-bottom: 2.375rem !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-details {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-meta-row {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: auto !important;
  gap: 0.75rem !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-meta-text {
  width: auto !important;
  display: block !important;
  flex: 0 0 auto !important;
  align-self: auto !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-meta-divider {
  flex: 0 0 3rem !important;
  width: 3rem !important;
  min-width: 3rem !important;
  height: 1px !important;
  display: block !important;
  background: currentColor !important;
  opacity: 0.22 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .hero-author {
  margin-top: auto !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-text,
[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-heading,
[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-quote {
  width: 360px !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-image {
  width: auto !important;
  justify-content: center !important;
  align-items: center !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-image .article__panel-inner {
  height: 60vh !important;
  max-height: 60vh !important;
  display: flex !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-image .article__image-wrap {
  height: 100% !important;
  overflow: hidden !important;
  border-radius: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-image .article__image {
  height: 100% !important;
  width: auto !important;
  display: block !important;
  object-fit: cover !important;
  max-height: none !important;
  border-radius: 0 !important;
  position: static !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-image .article__caption {
  display: none !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.has-wide-image-gap {
  margin-left: 4rem !important;
  margin-right: 4rem !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel[data-valign="top"] .article__panel-inner {
  justify-content: flex-start !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel[data-valign="bottom"] .article__panel-inner {
  justify-content: flex-end !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel[data-valign="spread"] {
  justify-content: center !important;
  align-items: stretch !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel[data-valign="spread"] .article__panel-inner {
  justify-content: flex-start !important;
  align-items: stretch !important;
  gap: 1.75rem !important;
  height: 60vh !important;
  max-height: none !important;
  flex-shrink: 0 !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel-media {
  flex: 1 1 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.75rem !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel-media-item {
  flex: 1 1 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel-media-item img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__text-content {
  font-size: 0.9375rem !important;
  line-height: 1.65 !important;
  font-family: "Plantin MT Pro", "Plantin", Georgia, serif !important;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__text-content p {
  margin-bottom: 1.25rem;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__text-content h2 {
  font-size: 1.375rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

[data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__text-content h3 {
  font-size: 1.125rem !important;
  font-weight: 500;
  margin-top: 0 !important;
  margin-bottom: 0.625rem !important;
  line-height: 1.35;
}

@media screen and (max-width: 991px) {
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] > .writing-article-track {
    gap: 6rem;
  }

  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-text,
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-heading,
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-quote {
    width: 280px !important;
  }
}

@media screen and (max-width: 767px) {
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] > .writing-article-track {
    gap: 3rem;
  }

  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-text,
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-heading,
  [data-horizontal-scroll-wrap][data-ssr-writing-article="true"] .article__panel.is-quote {
    width: 260px !important;
  }
}
</style>`;

function addBodyClass(document: NativeMirrorDocument, className: string) {
  const current = document.bodyAttributes.class ?? "";
  const classes = new Set(current.split(/\s+/).filter(Boolean));
  classes.add(className);
  return { ...document.bodyAttributes, class: Array.from(classes).join(" ") };
}

function stripTags(markup: string) {
  return markup
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTemplate(wrapInner: string, name: string) {
  const pattern = new RegExp(`<div\\b(?=[^>]*data-template=["']${name}["'])[^>]*>`, "i");
  const match = pattern.exec(wrapInner);
  if (!match || match.index === undefined) return "";
  return extractBalancedDiv(wrapInner, match.index);
}

function extractBalancedDiv(markup: string, start: number) {
  const divPattern = /<\/?div\b[^>]*>/gi;
  divPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null = null;

  while ((match = divPattern.exec(markup))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return markup.slice(start, divPattern.lastIndex);
      continue;
    }

    depth += 1;
  }

  return "";
}

function getRichTextMarkup(bodyMarkup: string) {
  return (
    bodyMarkup.match(
      /<div data-article-richtext=["']true["'][^>]*>\s*<div class=["']w-richtext["']>([\s\S]*?)<\/div>\s*<\/div>/i,
    )?.[1] ?? ""
  );
}

function splitRichBlocks(richTextMarkup: string): RichBlock[] {
  const blockPattern =
    /<(h1|h2|h3|p|figure|blockquote)\b[\s\S]*?<\/\1>|<img\b[^>]*>/gi;
  const blocks: RichBlock[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = blockPattern.exec(richTextMarkup))) {
    const markup = match[0];
    const tag = (match[1] ?? "img").toLowerCase();
    const text = stripTags(markup).replace(/[\u200B\u00AD\uFEFF\u200D]+/g, "").trim();

    if (tag === "h1") continue;
    if (tag === "p" && !text && !/<img\b/i.test(markup)) continue;

    if (tag === "figure" || tag === "img" || /<img\b/i.test(markup)) {
      blocks.push({ markup, type: "image" });
    } else if (tag === "blockquote") {
      blocks.push({ markup, type: "quote" });
    } else {
      blocks.push({ markup, type: "text" });
    }
  }

  return blocks;
}

function setReadTime(heroMarkup: string, richTextMarkup: string) {
  const words = stripTags(richTextMarkup).split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(words / 200))} Min Read`;
  return heroMarkup.replace(/>\s*\d+\s+Min Read\s*</i, `>${readTime}<`);
}

function renderTextPanel(template: string, blocks: RichBlock[], valign = "bottom") {
  if (!template || !blocks.length) return "";
  const content = blocks.map((block) => block.markup).join("");
  return template
    .replace(/\sdata-template=(["'])text\1/i, ` data-valign="${valign}"`)
    .replace(/<div data-content-slot=["']true["'] class=["']article__text-content["']><\/div>/i, `<div data-content-slot="true" class="article__text-content">${content}</div>`);
}

function renderImagePanel(template: string, block: RichBlock) {
  const image = block.markup.match(/<img\b[^>]*>/i)?.[0] ?? "";
  if (!template || !image) return "";
  const src = image.match(/\ssrc=(["'])(.*?)\1/i)?.[2] ?? "";
  const alt = image.match(/\salt=(["'])(.*?)\1/i)?.[2] ?? "";
  return template
    .replace(/\sdata-template=(["'])image\1/i, ' data-valign="top"')
    .replace(/\sclass=(["'])article__panel is-image\1/i, ' class="article__panel is-image has-wide-image-gap"')
    .replace(/<img\b[^>]*class=(["'])article__image\1[^>]*>/i, `<img src="${src}" alt="${alt}" loading="lazy" class="article__image"/>`)
    .replace(/<p class=(["'])article__caption\1>[\s\S]*?<\/p>/i, "");
}

function renderMixedPanel(template: string, textBlocks: RichBlock[], imageBlock: RichBlock) {
  const image = imageBlock.markup.match(/<img\b[^>]*>/i)?.[0] ?? "";
  if (!template || !image) return renderTextPanel(template, textBlocks, "top");
  const src = image.match(/\ssrc=(["'])(.*?)\1/i)?.[2] ?? "";
  const alt = image.match(/\salt=(["'])(.*?)\1/i)?.[2] ?? "";
  const text = textBlocks.map((block) => block.markup).join("");
  const content = `<div class="article__text-content" style="flex:0 0 auto">${text}</div><div class="article__panel-media"><div class="article__panel-media-item"><img src="${src}" alt="${alt}" loading="lazy"/></div></div>`;
  return template
    .replace(/\sdata-template=(["'])text\1/i, ' data-valign="spread"')
    .replace(
      /<div class=(["'])article__panel-inner\1>[\s\S]*<\/div>\s*<\/div>$/i,
      `<div class="article__panel-inner">${content}</div></div>`,
    );
}

function renderArticlePanels(wrapInner: string, richTextMarkup: string) {
  const heroTemplate = getTemplate(wrapInner, "hero");
  const textTemplate = getTemplate(wrapInner, "text");
  const imageTemplate = getTemplate(wrapInner, "image");
  const blocks = splitRichBlocks(richTextMarkup);
  const panels: string[] = [];
  const hero = setReadTime(heroTemplate.replace(/\sdata-template=(["'])hero\1/i, ""), richTextMarkup);

  if (hero) panels.push(hero);

  const hasImages = blocks.some((block) => block.type === "image");
  if (!hasImages) {
    panels.push(renderTextPanel(textTemplate, blocks.filter((block) => block.type === "text"), "top"));
    return panels.join("");
  }

  let pendingText: RichBlock[] = [];
  let sawStandaloneImage = false;
  const remainingTextPanels: RichBlock[][] = [];

  for (const block of blocks) {
    if (block.type === "text") {
      pendingText.push(block);
      continue;
    }

    if (block.type !== "image") continue;

    if (!sawStandaloneImage) {
      panels.push(renderTextPanel(textTemplate, pendingText, "top"));
      panels.push(renderImagePanel(imageTemplate, block));
      pendingText = [];
      sawStandaloneImage = true;
      continue;
    }

    panels.push(renderMixedPanel(textTemplate, pendingText, block));
    pendingText = [];
  }

  for (let index = 0; index < pendingText.length; index += 2) {
    remainingTextPanels.push(pendingText.slice(index, index + 2));
  }

  for (const panelBlocks of remainingTextPanels) {
    panels.push(renderTextPanel(textTemplate, panelBlocks, "top"));
  }

  return panels.filter(Boolean).join("");
}

export function prepareWritingArticleDocument(document: NativeMirrorDocument): NativeMirrorDocument {
  const richTextMarkup = getRichTextMarkup(document.bodyMarkup);
  if (!richTextMarkup || document.bodyMarkup.includes('data-ssr-writing-article="true"')) {
    return document;
  }

  const bodyMarkup = document.bodyMarkup.replace(
    /<section\b(?=[^>]*data-horizontal-scroll-wrap)[^>]*>([\s\S]*?)<\/section>/i,
    (wrapMarkup, wrapInner: string) => {
      const openTag = wrapMarkup.match(/^<section\b[^>]*>/i)?.[0] ?? "";
      const preparedOpenTag = openTag.replace(
        /^<section\b/i,
        '<section data-ssr-writing-article="true"',
      );
      const renderedPanels = renderArticlePanels(wrapInner, richTextMarkup);
      const templates = ["hero", "heading", "text", "image", "quote"]
        .map((name) => getTemplate(wrapInner, name))
        .filter(Boolean)
        .join("");
      return `${preparedOpenTag}<div class="writing-article-track">${renderedPanels}<div data-writing-article-end-spacer="" aria-hidden="true" style="flex:0 0 4rem;width:4rem;height:1px;pointer-events:none;"></div></div>${templates}</section>`;
    },
  );

  return {
    ...document,
    bodyAttributes: addBodyClass(document, "writing-article-page"),
    bodyMarkup,
    headMarkup: document.headMarkup.includes("data-ripe-writing-article-ssr")
      ? document.headMarkup
      : `${document.headMarkup}${articleSsrStyles}`,
  };
}

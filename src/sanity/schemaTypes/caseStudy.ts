import { defineArrayMember, defineField, defineType } from "sanity";
import { ColorStringInput } from "@/sanity/components/color-string-input";

const CELL_WIDTH_TOTAL_TOLERANCE = 0.5;

type LayoutCellValue = { width?: number };
type LayoutReferenceValue = { _ref?: string };
type LayoutContentItemValue = { media?: { src?: string; image?: unknown; video?: unknown; upload?: unknown } };
type LayoutEntryValue = {
  layout?: LayoutReferenceValue;
  content?: LayoutContentItemValue[];
};
type LayoutTemplateValue = {
  rows?: Array<{
    cells?: Array<{
      rowSpan?: number;
    }>;
  }>;
};

function validateCellWidthTotal(value: unknown) {
  const cells = value as LayoutCellValue[] | undefined;
  if (!Array.isArray(cells) || cells.length === 0) {
    return "Add at least one cell.";
  }

  const total = cells.reduce((sum, cell) => sum + (typeof cell.width === "number" ? cell.width : 0), 0);
  if (Math.abs(total - 100) <= CELL_WIDTH_TOTAL_TOLERANCE) return true;
  return `Cell widths must total 100%. Current total is ${total.toFixed(2)}%.`;
}

function countVisibleLayoutCells(rows: LayoutTemplateValue["rows"]) {
  if (!Array.isArray(rows)) return 0;

  const coveredSlots = new Set<string>();
  let visibleCount = 0;

  rows.forEach((row, rowIndex) => {
    const cells = Array.isArray(row.cells) ? row.cells : [];
    cells.forEach((cell, cellIndex) => {
      const slotId = `${rowIndex}:${cellIndex}`;
      if (coveredSlots.has(slotId)) return;

      visibleCount += 1;
      const rawSpan = typeof cell.rowSpan === "number" ? Math.floor(cell.rowSpan) : 1;
      const maxSpan = Math.max(rows.length - rowIndex, 1);
      const rowSpan = Math.max(1, Math.min(rawSpan || 1, maxSpan));
      for (let offset = 1; offset < rowSpan; offset += 1) {
        coveredSlots.add(`${rowIndex + offset}:${cellIndex}`);
      }
    });
  });

  return visibleCount;
}

function hasMediaValue(item: LayoutContentItemValue) {
  const media = item.media;
  return Boolean(media && (media.src || media.image || media.video || media.upload));
}

async function validateLayoutEntry(
  value: unknown,
  context: {
    getClient?: (options: { apiVersion: string }) => {
      fetch<T>(query: string, params: Record<string, string>): Promise<T>;
    };
  },
) {
  const entry = value as LayoutEntryValue | undefined;
  const layoutRef = entry?.layout?._ref;
  if (!layoutRef) return "Select a layout template.";

  const content = Array.isArray(entry?.content) ? entry.content : [];
  if (content.length === 0) return "Add media content for this layout.";

  const emptyIndex = content.findIndex((item) => !hasMediaValue(item));
  if (emptyIndex >= 0) return `Content item ${emptyIndex + 1} is missing media.`;

  const client = context.getClient?.({ apiVersion: "2025-01-01" });
  if (!client) return true;

  const layout = await client.fetch<LayoutTemplateValue | null>(
    `*[_type == "caseStudyLayout" && _id == $id][0]{rows[]{cells[]{rowSpan}}}`,
    { id: layoutRef },
  );
  const expectedCount = countVisibleLayoutCells(layout?.rows);
  if (expectedCount === 0) return "Selected layout template has no visible cells.";
  if (content.length !== expectedCount) {
    return `Content item count must match the selected layout's visible cells. Expected ${expectedCount}, got ${content.length}.`;
  }

  return true;
}

const placedCommentFields = [
  defineField({
    name: "commenter",
    title: "Commenter",
    type: "reference",
    to: [{ type: "teamMember" }],
  }),
  defineField({
    name: "author",
    title: "Author",
    type: "string",
    description: "Legacy fallback. Prefer selecting a Commenter.",
  }),
  defineField({
    name: "body",
    title: "Comment",
    type: "text",
    rows: 3,
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "position",
    title: "Position on Media",
    description: "Click or drag the pin in Studio to set this comment position.",
    type: "commentPosition",
    validation: (rule) => rule.required(),
  }),
];

const commentableMediaField = (name: string, title: string, hidden = false) =>
  defineField({
    name,
    title,
    type: "object",
    ...(hidden ? { hidden: () => true } : {}),
    fields: [
      defineField({
        name: "media",
        title: "Media",
        type: "mediaBlock",
        ...(hidden ? {} : { validation: (rule) => rule.required() }),
      }),
      defineField({
        name: "comments",
        title: "Comments",
        description: "Figma-style pinned comments for this media block.",
        type: "array",
        of: [
          defineArrayMember({
            name: "placedComment",
            title: "Placed Comment",
            type: "object",
            fields: placedCommentFields,
          }),
        ],
      }),
    ],
  });

const placedCommentArrayField = defineField({
  name: "comments",
  title: "Comments",
  description: "Figma-style pinned comments for this media block.",
  type: "array",
  of: [
    defineArrayMember({
      name: "placedComment",
      title: "Placed Comment",
      type: "object",
      fields: placedCommentFields,
    }),
  ],
});

const layoutContentField = defineField({
  name: "content",
  title: "Content",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "mediaBlock",
      validation: (rule) => rule.required(),
    }),
    placedCommentArrayField,
  ],
});

const layoutRowField = defineField({
  name: "rows",
  title: "Rows",
  type: "array",
  of: [
    defineArrayMember({
      name: "layoutRow",
      title: "Row",
      type: "object",
      fields: [
        defineField({
          name: "height",
          title: "Row Height (px)",
          type: "number",
          initialValue: 600,
          validation: (rule) => rule.min(120).max(2400).required(),
        }),
        defineField({
          name: "cells",
          title: "Cells",
          description:
            "Define media count by adding/removing cells in this row. Cell widths should sum to 100%. Use Row Span to continue a cell into following rows.",
          type: "array",
          of: [
            defineArrayMember({
              name: "layoutCell",
              title: "Cell",
              type: "object",
              fields: [
                defineField({
                  name: "width",
                  title: "Width (%)",
                  type: "number",
                  initialValue: 50,
                  validation: (rule) => rule.min(1).max(100).required(),
                }),
                defineField({
                  name: "rowSpan",
                  title: "Row Span",
                  description: "Number of rows this cell should span downward.",
                  type: "number",
                  initialValue: 1,
                  validation: (rule) => rule.min(1).max(12),
                }),
                layoutContentField,
              ],
            }),
          ],
          validation: (rule) => rule.min(1).required().custom(validateCellWidthTotal),
        }),
      ],
    }),
  ],
  validation: (rule) => rule.min(1).required(),
});

const layoutEntryContentField = defineField({
  name: "content",
  title: "Layout Content Items",
  description:
    "Add media items in reading order (top-left to bottom-right). Row-spanned overlap slots are skipped automatically. Each item supports comments.",
  type: "array",
  of: [
    defineArrayMember({
      name: "layoutContentItem",
      title: "Content Item",
      type: "object",
      fields: [
        defineField({
          name: "media",
          title: "Media",
          type: "mediaBlock",
          validation: (rule) => rule.required(),
        }),
        placedCommentArrayField,
      ],
    }),
  ],
  validation: (rule) => rule.min(1).required(),
});

export const caseStudyType = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailEyebrow",
      title: "Detail Eyebrow",
      type: "string",
    }),
    defineField({
      name: "detailServices",
      title: "Detail Services",
      description: "Select from Case Study Tags. These are displayed as services on the detail page.",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "caseStudyTag" }],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "detailIndustry",
      title: "Detail Industry",
      type: "string",
    }),
    defineField({
      name: "detailInformation",
      title: "Detail Information Paragraphs",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
    }),
    defineField({
      name: "detailLayouts",
      title: "Legacy Detail Layouts (Deprecated)",
      description:
        "Deprecated legacy field. Use Detail Layout Entries instead.",
      hidden: () => true,
      type: "array",
      of: [
        defineArrayMember({
          name: "detailLayoutBlock",
          title: "Layout Block",
          type: "object",
          fields: [
            defineField({
              name: "preset",
              title: "Layout Preset",
              type: "string",
              options: {
                list: [
                  { title: "Layout 1", value: "layout1" },
                  { title: "Layout 2", value: "layout2" },
                  { title: "Layout 3", value: "layout3" },
                  { title: "Layout 4", value: "layout4" },
                  { title: "Layout 5", value: "layout5" },
                  { title: "Layout 6", value: "layout6" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "gap",
              title: "Cell Gap (px)",
              type: "number",
              initialValue: 20,
              validation: (rule) => rule.min(0).max(120),
            }),
            layoutRowField,
          ],
        }),
      ],
    }),
    defineField({
      name: "detailLayoutEntries",
      title: "Detail Layout Entries",
      description:
        "Pick a layout configured in the Case Study Layout collection, then attach content for that layout.",
      type: "array",
      of: [
        defineArrayMember({
          name: "detailLayoutEntry",
          title: "Layout Entry",
          type: "object",
          validation: (rule) => rule.custom(validateLayoutEntry),
          fields: [
            defineField({
              name: "layout",
              title: "Layout Template",
              type: "reference",
              to: [{ type: "caseStudyLayout" }],
              validation: (rule) => rule.required(),
            }),
            layoutEntryContentField,
          ],
          preview: {
            select: {
              layoutTitle: "layout.title",
              preset: "layout.preset",
            },
            prepare({ layoutTitle, preset }) {
              return {
                title: layoutTitle || "Layout Entry",
                subtitle: preset || "Case Study Layout",
              };
            },
          },
        }),
      ],
    }),
    commentableMediaField("detailHero", "Detail Hero Media"),
    commentableMediaField("detailIntro", "Detail Intro Media", true),
    defineField({
      name: "detailCarouselSlides",
      title: "Detail Carousel Slides",
      hidden: () => true,
      type: "array",
      of: [
        defineArrayMember({
          name: "commentableCarouselSlide",
          title: "Carousel Slide",
          type: "object",
          fields: [
            defineField({
              name: "media",
              title: "Media",
              type: "mediaBlock",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "comments",
              title: "Comments",
              type: "array",
              of: [
                defineArrayMember({
                  name: "placedComment",
                  title: "Placed Comment",
                  type: "object",
                  fields: placedCommentFields,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    commentableMediaField("detailCarouselPoster", "Detail Carousel Poster", true),
    commentableMediaField("detailBlackFeature", "Detail Black Feature Media", true),
    commentableMediaField("detailWideFeature", "Detail Wide Feature Media", true),
    commentableMediaField("detailCta", "Detail CTA Media", true),
    defineField({
      name: "detailMoreProjects",
      title: "Detail More Projects",
      hidden: () => true,
      type: "array",
      of: [
        defineArrayMember({
          name: "detailMoreProject",
          title: "More Project Card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "year",
              title: "Year",
              type: "string",
            }),
            defineField({
              name: "media",
              title: "Card Media",
              type: "mediaBlock",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "slug",
              title: "Target Slug",
              type: "string",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "caseStudyTag" }],
        }),
      ],
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "accentColor",
      title: "Accent Color",
      type: "string",
      components: {
        input: ColorStringInput,
      },
    }),
    defineField({
      name: "accentColorText",
      title: "Accent Color Text",
      hidden: () => true,
      type: "string",
    }),
    defineField({
      name: "theme",
      title: "Theme",
      hidden: () => true,
      type: "string",
      options: {
        list: [
          { title: "Ember", value: "ember" },
          { title: "Moss", value: "moss" },
        ],
      },
    }),
    defineField({ name: "coverMedia", title: "Cover Media", type: "mediaBlock" }),
    defineField({ name: "challenge", title: "Challenge", type: "text", rows: 4, hidden: () => true }),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 4, hidden: () => true }),
    defineField({
      name: "metrics",
      title: "Metrics",
      hidden: () => true,
      type: "array",
      of: [defineArrayMember({ type: "metric" })],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      hidden: () => true,
      type: "array",
      of: [defineArrayMember({ type: "storySection" })],
    }),
    defineField({
      name: "testimonial",
      title: "Testimonial",
      hidden: () => true,
      type: "testimonial",
    }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime", hidden: () => true }),
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string", hidden: () => true }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

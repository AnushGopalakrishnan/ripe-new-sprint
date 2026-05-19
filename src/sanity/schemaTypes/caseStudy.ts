import { defineArrayMember, defineField, defineType } from "sanity";

const CELL_WIDTH_TOTAL_TOLERANCE = 0.5;

type LayoutCellValue = { width?: number };

function validateCellWidthTotal(value: unknown) {
  const cells = value as LayoutCellValue[] | undefined;
  if (!Array.isArray(cells) || cells.length === 0) {
    return "Add at least one cell.";
  }

  const total = cells.reduce((sum, cell) => sum + (typeof cell.width === "number" ? cell.width : 0), 0);
  if (Math.abs(total - 100) <= CELL_WIDTH_TOTAL_TOLERANCE) return true;
  return `Cell widths must total 100%. Current total is ${total.toFixed(2)}%.`;
}

const placedCommentFields = [
  defineField({
    name: "commenter",
    title: "Commenter",
    type: "reference",
    to: [{ type: "caseStudyCommenter" }],
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

const commentableMediaField = (name: string, title: string) =>
  defineField({
    name,
    title,
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
            "Define media count by adding/removing cells in this row. Cell widths should sum to 100%.",
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
    "Add media items in reading order (top-left to bottom-right). Each item supports comments.",
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
    commentableMediaField("detailIntro", "Detail Intro Media"),
    defineField({
      name: "detailCarouselSlides",
      title: "Detail Carousel Slides",
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
    commentableMediaField("detailCarouselPoster", "Detail Carousel Poster"),
    commentableMediaField("detailBlackFeature", "Detail Black Feature Media"),
    commentableMediaField("detailWideFeature", "Detail Wide Feature Media"),
    commentableMediaField("detailCta", "Detail CTA Media"),
    defineField({
      name: "detailMoreProjects",
      title: "Detail More Projects",
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
    defineField({ name: "accentColor", title: "Accent Color", type: "string" }),
    defineField({
      name: "accentColorText",
      title: "Accent Color Text",
      type: "string",
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      options: {
        list: [
          { title: "Ember", value: "ember" },
          { title: "Moss", value: "moss" },
        ],
      },
    }),
    defineField({ name: "coverMedia", title: "Cover Media", type: "mediaBlock" }),
    defineField({ name: "challenge", title: "Challenge", type: "text", rows: 4 }),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 4 }),
    defineField({
      name: "metrics",
      title: "Metrics",
      type: "array",
      of: [defineArrayMember({ type: "metric" })],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [defineArrayMember({ type: "storySection" })],
    }),
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "testimonial",
    }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

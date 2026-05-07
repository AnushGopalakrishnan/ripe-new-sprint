import { defineArrayMember, defineField, defineType } from "sanity";

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
    defineField({ name: "year", title: "Year", type: "string" }),
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

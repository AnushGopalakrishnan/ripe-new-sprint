import { defineArrayMember, defineField, defineType } from "sanity";

export const writingType = defineType({
  name: "writing",
  title: "Writing",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "author", title: "Author", type: "string" }),
    defineField({ name: "authorRole", title: "Author Role", type: "string" }),
    defineField({ name: "authorBio", title: "Author Bio", type: "text", rows: 4 }),
    defineField({ name: "authorImage", title: "Author Image", type: "mediaBlock" }),
    defineField({ name: "publishDate", title: "Publish Date", type: "date" }),
    defineField({ name: "publishLabel", title: "Publish Label", type: "string" }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "readTime", title: "Read Time", type: "string" }),
    defineField({ name: "coverMedia", title: "Cover Media", type: "mediaBlock" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "writingTag" }],
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [defineArrayMember({ type: "storySection" })],
    }),
    defineField({
      name: "bodyHtml",
      title: "Body HTML",
      type: "text",
      rows: 20,
      description: "Imported fallback from the mirrored Webflow article body.",
    }),
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

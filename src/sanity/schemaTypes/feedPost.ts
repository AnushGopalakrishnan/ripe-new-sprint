import { defineArrayMember, defineField, defineType } from "sanity";

export const feedPostType = defineType({
  name: "feedPost",
  title: "Feed Post",
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
    defineField({ name: "excerpt", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "coverMedia", title: "Cover Media", type: "mediaBlock" }),
    defineField({ name: "postType", title: "Post Type", type: "string" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "feedTag" }],
        }),
      ],
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean" }),
    defineField({
      name: "associations",
      title: "Associated Team Members",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "teamMember" }],
        }),
      ],
    }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string" }),
  ],
});

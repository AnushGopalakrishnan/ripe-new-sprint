import { defineField, defineType } from "sanity";

export const caseStudyTagType = defineType({
  name: "caseStudyTag",
  title: "Case Study Tag",
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
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string" }),
  ],
});

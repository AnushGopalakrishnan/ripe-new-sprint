import { defineField, defineType } from "sanity";

export const caseStudyCommenterType = defineType({
  name: "caseStudyCommenter",
  title: "Case Study Commenter",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "avatar",
      subtitle: "role",
    },
  },
});

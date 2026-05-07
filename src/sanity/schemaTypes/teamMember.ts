import { defineArrayMember, defineField, defineType } from "sanity";

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "role", title: "Job Title", type: "string" }),
    defineField({ name: "group", title: "Group", type: "string" }),
    defineField({ name: "avatar", title: "Profile Picture", type: "mediaBlock" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 8 }),
    defineField({ name: "bioSummary", title: "Bio Summary", type: "text", rows: 4 }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone Number", type: "string" }),
    defineField({ name: "websiteUrl", title: "Website", type: "url" }),
    defineField({ name: "twitterUrl", title: "Twitter", type: "url" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "teamTag" }],
        }),
      ],
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "caseStudy" }],
        }),
      ],
    }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({ name: "legacyItemId", title: "Legacy Item ID", type: "string" }),
  ],
});

import { defineField, defineType } from "sanity";

export const jobPostingType = defineType({
  name: "jobPosting",
  title: "Job Posting",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contractType",
      title: "Contract Type",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "externalUrl",
      title: "External Job Link",
      type: "url",
      validation: (rule) => rule.required().uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (rule) => rule.integer().min(0),
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      location: "location",
      contractType: "contractType",
    },
    prepare({ title, location, contractType }) {
      return {
        title: title || "Untitled Job",
        subtitle: [location, contractType].filter(Boolean).join(" • "),
      };
    },
  },
});

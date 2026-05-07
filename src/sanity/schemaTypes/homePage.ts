import { defineArrayMember, defineField, defineType } from "sanity";

export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
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
      name: "supportingCopy",
      title: "Supporting Copy",
      type: "text",
      rows: 5,
    }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "link" }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "link",
    }),
    defineField({
      name: "heroMedia",
      title: "Hero Media",
      type: "mediaBlock",
    }),
    defineField({
      name: "featuredCaseStudies",
      title: "Featured Case Studies",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "caseStudy" }],
        }),
      ],
    }),
    defineField({
      name: "featuredWriting",
      title: "Featured Writing",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "writing" }],
        }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [defineArrayMember({ type: "homeStat" })],
    }),
    defineField({
      name: "marquee",
      title: "Marquee Items",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

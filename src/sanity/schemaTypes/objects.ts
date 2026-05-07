import { defineArrayMember, defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "ogTitle", title: "Open Graph Title", type: "string" }),
    defineField({
      name: "ogDescription",
      title: "Open Graph Description",
      type: "text",
      rows: 3,
    }),
  ],
});

export const linkType = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Href",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const socialLinkType = defineType({
  name: "socialLink",
  title: "Social Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Href",
      type: "url",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const mediaType = defineType({
  name: "mediaBlock",
  title: "Media Block",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      initialValue: "image",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "src",
      title: "Source URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster URL",
      type: "url",
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
  ],
});

export const metricType = defineType({
  name: "metric",
  title: "Metric",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const storySectionType = defineType({
  name: "storySection",
  title: "Story Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paragraphs",
      title: "Paragraphs",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "quote",
      title: "Optional Quote",
      type: "text",
      rows: 3,
    }),
  ],
});

export const homeStatType = defineType({
  name: "homeStat",
  title: "Home Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 4 }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "avatar", title: "Avatar", type: "mediaBlock" }),
    defineField({
      name: "insertAfterOrder",
      title: "Insert After Order",
      type: "number",
    }),
  ],
});

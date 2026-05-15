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
      name: "upload",
      title: "Upload (Image or Video)",
      description:
        "Recommended. Upload either an image or video directly. Kind is inferred automatically.",
      type: "file",
      options: {
        accept: "image/*,video/*",
      },
    }),
    defineField({
      name: "kind",
      title: "Kind",
      description: "Optional legacy override. Leave empty to auto-detect from upload/source.",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
    }),
    defineField({
      name: "src",
      title: "Source URL",
      type: "url",
    }),
    defineField({
      name: "image",
      title: "Uploaded Image (Legacy)",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind === "video",
    }),
    defineField({
      name: "video",
      title: "Uploaded Video (Legacy)",
      type: "file",
      options: {
        accept: "video/*",
      },
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
    defineField({
      name: "poster",
      title: "Poster URL",
      type: "url",
    }),
    defineField({
      name: "posterImage",
      title: "Uploaded Poster Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind !== "video",
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
  validation: (rule) =>
    rule.custom((value) => {
      if (!value || typeof value !== "object") return true;
      const media = value as {
        kind?: "image" | "video";
        src?: string;
        image?: unknown;
        video?: unknown;
        upload?: unknown;
      };

      if (media.upload) return true;

      if (media.kind === "video") {
        if (media.src || media.video) return true;
        return "Add Upload, Source URL, or Uploaded Video.";
      }

      if (media.src || media.image || media.video) return true;
      return "Add Upload, Source URL, or uploaded media.";
    }),
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

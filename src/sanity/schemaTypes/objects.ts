import { defineArrayMember, defineField, defineType } from "sanity";

const videoExtensions = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg", "m3u8"]);

type MediaBlockValue = {
  kind?: "image" | "video";
  src?: string;
  image?: unknown;
  video?: unknown;
  upload?: { asset?: { mimeType?: string } } | unknown;
  longFormEnabled?: boolean;
  longFormHlsUrl?: string;
};

function parseMediaPathname(src: string) {
  try {
    return new URL(src).pathname;
  } catch {
    return src;
  }
}

function srcLooksLikeVideo(src: string | undefined) {
  if (!src) return false;
  if (src.startsWith("data:video/")) return true;

  const pathname = parseMediaPathname(src).toLowerCase();
  const extension = pathname.split(".").pop() ?? "";
  return videoExtensions.has(extension);
}

function inferIsVideo(media: MediaBlockValue) {
  if (media.kind === "video") return true;
  if (media.video) return true;
  if (srcLooksLikeVideo(media.src)) return true;
  if (srcLooksLikeVideo(media.longFormHlsUrl)) return true;

  const mimeType =
    typeof media.upload === "object" &&
    media.upload !== null &&
    "asset" in media.upload &&
    typeof media.upload.asset === "object" &&
    media.upload.asset !== null &&
    "mimeType" in media.upload.asset &&
    typeof media.upload.asset.mimeType === "string"
      ? media.upload.asset.mimeType
      : undefined;

  return typeof mimeType === "string" && mimeType.startsWith("video/");
}

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
      description:
        "Optional override. If empty, supported providers (for example Mux/Cloudflare HLS) can auto-resolve a poster from the video source.",
      type: "url",
    }),
    defineField({
      name: "posterImage",
      title: "Uploaded Poster Image",
      description: "Optional custom poster upload for this video.",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind === "image",
    }),
    defineField({
      name: "longFormEnabled",
      title: "Enable Long Form Video",
      description:
        "Turn on for externally hosted long-form HLS playback with full player controls.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "longFormHlsUrl",
      title: "Long Form HLS URL",
      description: "Externally hosted HLS manifest URL (for example, .m3u8).",
      type: "url",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as MediaBlockValue | undefined;
          if (!parent?.longFormEnabled) return true;

          if (typeof value !== "string" || value.trim().length === 0) {
            return "Add a Long Form HLS URL when long form video is enabled.";
          }

          return true;
        }),
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
      const media = value as MediaBlockValue;

      if (media.longFormEnabled) {
        if (!inferIsVideo(media)) {
          return "Long form video requires video media (kind, video upload, or video source URL).";
        }
        if (!media.longFormHlsUrl || media.longFormHlsUrl.trim().length === 0) {
          return "Add a Long Form HLS URL when long form video is enabled.";
        }
      }

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

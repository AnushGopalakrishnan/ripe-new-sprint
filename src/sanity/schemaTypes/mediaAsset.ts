import { defineField, defineType } from "sanity";

export const mediaAssetType = defineType({
  name: "mediaAsset",
  title: "Media Asset",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
    }),
    defineField({ name: "sourceUrl", title: "Source URL", type: "url" }),
    defineField({ name: "posterUrl", title: "Poster URL", type: "url" }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 4 }),
  ],
});

import { defineField, defineType } from "sanity";

export const personType = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "avatar", title: "Avatar", type: "mediaBlock" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 4 }),
  ],
});

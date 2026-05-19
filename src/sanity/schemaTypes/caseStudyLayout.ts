import { defineArrayMember, defineField, defineType } from "sanity";

export const caseStudyLayoutType = defineType({
  name: "caseStudyLayout",
  title: "Case Study Layout",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "preset",
      title: "Preset Key",
      type: "string",
      options: {
        list: [
          { title: "Layout 1", value: "layout1" },
          { title: "Layout 2", value: "layout2" },
          { title: "Layout 3", value: "layout3" },
          { title: "Layout 4", value: "layout4" },
          { title: "Layout 5", value: "layout5" },
          { title: "Layout 6", value: "layout6" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gap",
      title: "Cell Gap (px)",
      type: "number",
      initialValue: 20,
      validation: (rule) => rule.min(0).max(120),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        defineArrayMember({
          name: "layoutRow",
          title: "Row",
          type: "object",
          fields: [
            defineField({
              name: "height",
              title: "Row Height (px)",
              type: "number",
              initialValue: 600,
              validation: (rule) => rule.min(120).max(2400).required(),
            }),
            defineField({
              name: "cells",
              title: "Cells",
              description: "Media count is based on how many cells are in the row.",
              type: "array",
              of: [
                defineArrayMember({
                  name: "layoutCell",
                  title: "Cell",
                  type: "object",
                  fields: [
                    defineField({
                      name: "width",
                      title: "Width (%)",
                      type: "number",
                      initialValue: 50,
                      validation: (rule) => rule.min(1).max(100).required(),
                    }),
                  ],
                }),
              ],
              validation: (rule) => rule.min(1).required(),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "preset",
    },
  },
});

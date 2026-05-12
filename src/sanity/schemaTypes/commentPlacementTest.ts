import { defineArrayMember, defineField, defineType } from "sanity";
import { CommentPositionInput } from "@/sanity/components/comment-position-input";

export const commentPositionType = defineType({
  name: "commentPosition",
  title: "Comment Position",
  type: "object",
  components: {
    input: CommentPositionInput,
  },
  fields: [
    defineField({
      name: "x",
      title: "X",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "y",
      title: "Y",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
    }),
  ],
  preview: {
    select: {
      x: "x",
      y: "y",
    },
    prepare({ x, y }) {
      const hasPosition = typeof x === "number" && typeof y === "number";

      return {
        title: hasPosition ? `${x.toFixed(1)}%, ${y.toFixed(1)}%` : "No position set",
      };
    },
  },
});

export const commentPlacementTestType = defineType({
  name: "commentPlacementTest",
  title: "Comment Placement Test",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Case Study Comment Placement Test",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageSections",
      title: "Image Sections",
      description:
        "Each image can have its own set of faux project comments. The position field is one visual control that stores x/y internally.",
      type: "array",
      of: [
        defineArrayMember({
          name: "imageCommentSection",
          title: "Image Comment Section",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Image Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "comments",
              title: "Comments",
              type: "array",
              of: [
                defineArrayMember({
                  name: "placedComment",
                  title: "Placed Comment",
                  type: "object",
                  fields: [
                    defineField({
                      name: "author",
                      title: "Author",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "role",
                      title: "Role",
                      type: "string",
                    }),
                    defineField({
                      name: "body",
                      title: "Comment",
                      type: "text",
                      rows: 3,
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "position",
                      title: "Position on Image",
                      description:
                        "Click or drag the pin. This is one editor control, saved as normalized percentages.",
                      type: "commentPosition",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      author: "author",
                      body: "body",
                      x: "position.x",
                      y: "position.y",
                    },
                    prepare({ author, body, x, y }) {
                      const hasPosition = typeof x === "number" && typeof y === "number";

                      return {
                        title: author || "Untitled comment",
                        subtitle: `${hasPosition ? `${x.toFixed(1)}%, ${y.toFixed(1)}%` : "No position"}${
                          body ? ` - ${body}` : ""
                        }`,
                      };
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              label: "label",
              comments: "comments",
              media: "image",
            },
            prepare({ comments, label, media }) {
              const count = Array.isArray(comments) ? comments.length : 0;

              return {
                media,
                title: label || "Untitled image section",
                subtitle: `${count} placed comment${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      sections: "imageSections",
    },
    prepare({ sections, title }) {
      const count = Array.isArray(sections) ? sections.length : 0;

      return {
        title,
        subtitle: `${count} image section${count === 1 ? "" : "s"}`,
      };
    },
  },
});

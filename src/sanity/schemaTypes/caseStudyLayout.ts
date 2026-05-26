import { defineArrayMember, defineField, defineType } from "sanity";

const DEFAULT_LAYOUT_DESIGN_WIDTH = 1440;
const DEFAULT_SIDE_PADDING = 20;
const DEFAULT_CELL_GAP = 20;
const WIDTH_TOTAL_TOLERANCE = 0.5;

type LayoutCell = {
  width?: number;
};

function validateCellWidthTotal(value: unknown) {
  const cells = value as LayoutCell[] | undefined;
  if (!Array.isArray(cells) || cells.length === 0) {
    return "Add at least one cell.";
  }

  const total = cells.reduce((sum, cell) => sum + (typeof cell.width === "number" ? cell.width : 0), 0);
  if (Math.abs(total - 100) <= WIDTH_TOTAL_TOLERANCE) return true;

  return `Cell widths must total 100%. Current total is ${total.toFixed(2)}%.`;
}

function buildRowDimensionsSubtitle(height: number | undefined, cellsValue: unknown) {
  const cells = cellsValue as LayoutCell[] | undefined;
  if (typeof height !== "number") return "Set row height in px.";
  if (!Array.isArray(cells) || cells.length === 0) return "Add cells to calculate target dimensions.";

  const gapTotal = Math.max(cells.length - 1, 0) * DEFAULT_CELL_GAP;
  const innerWidth = DEFAULT_LAYOUT_DESIGN_WIDTH - DEFAULT_SIDE_PADDING * 2;
  const rowContentWidth = Math.max(innerWidth - gapTotal, 1);

  const totalWidth = cells.reduce((sum, cell) => sum + (typeof cell.width === "number" ? cell.width : 0), 0) || 1;
  const cellTargets = cells
    .map((cell, index) => {
      const widthPercent = typeof cell.width === "number" ? cell.width : 0;
      const normalized = widthPercent / totalWidth;
      const widthPx = Math.round(rowContentWidth * normalized);
      return `C${index + 1}: ${widthPx}×${Math.round(height)}px`;
    })
    .join(" · ");

  return `Target row: ${Math.round(rowContentWidth)}×${Math.round(height)}px (1440 canvas, 20px side padding, 20px gap). ${cellTargets}`;
}

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
      name: "designWidth",
      title: "Design Canvas Width (px)",
      description: "Use 1440 for this system. Row and cell target dimensions are derived from this baseline.",
      type: "number",
      initialValue: DEFAULT_LAYOUT_DESIGN_WIDTH,
      validation: (rule) => rule.required().min(320).max(3840),
    }),
    defineField({
      name: "gap",
      title: "Cell Gap (px)",
      description: "Use 20px for the 1440 canvas model.",
      type: "number",
      initialValue: DEFAULT_CELL_GAP,
      validation: (rule) => rule.min(0).max(120),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      description:
        "Author row heights in px against the 1440 canvas model. For each row, cell widths must total 100%.",
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
              description:
                "Media count is based on how many visible cells are in the row. Use Row Span to let a cell continue into following rows.",
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
                      description:
                        "Percentage of the row content width. Cell widths in this row must sum to 100%.",
                      type: "number",
                      initialValue: 50,
                      validation: (rule) => rule.min(1).max(100).required(),
                    }),
                    defineField({
                      name: "rowSpan",
                      title: "Row Span",
                      description: "Number of rows this cell should span downward.",
                      type: "number",
                      initialValue: 1,
                      validation: (rule) => rule.min(1).max(12),
                    }),
                  ],
                }),
              ],
              validation: (rule) => rule.min(1).required().custom(validateCellWidthTotal),
            }),
          ],
          preview: {
            select: {
              height: "height",
              cells: "cells",
            },
            prepare({ height, cells }) {
              return {
                title: typeof height === "number" ? `Row · ${Math.round(height)}px height` : "Row",
                subtitle: buildRowDimensionsSubtitle(height, cells),
              };
            },
          },
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

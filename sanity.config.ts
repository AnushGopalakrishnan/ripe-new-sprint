"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  sanityFallbackDataset,
  sanityFallbackProjectId,
  siteUrl,
} from "./src/lib/env";
import { resolve } from "./src/sanity/presentation/resolve";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Ripe Studios",
  basePath: "/studio",
  projectId: sanityFallbackProjectId,
  dataset: sanityFallbackDataset,
  plugins: [
    structureTool(),
    presentationTool({
      resolve,
      previewUrl: {
        origin: siteUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

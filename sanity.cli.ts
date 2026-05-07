import { defineCliConfig } from "sanity/cli";
import { sanityFallbackDataset, sanityFallbackProjectId } from "./src/lib/env";

export default defineCliConfig({
  api: {
    dataset: sanityFallbackDataset,
    projectId: sanityFallbackProjectId,
  },
});

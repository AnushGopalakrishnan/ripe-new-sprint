import { createClient } from "next-sanity";
import {
  sanityEnv,
  sanityFallbackDataset,
  sanityFallbackProjectId,
} from "@/lib/env";

export const client = createClient({
  apiVersion: sanityEnv.apiVersion,
  dataset: sanityFallbackDataset,
  projectId: sanityFallbackProjectId,
  useCdn: true,
  stega: {
    studioUrl: sanityEnv.studioUrl,
  },
});

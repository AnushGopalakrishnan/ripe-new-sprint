const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const siteUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
);

export const sanityEnv = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-01",
  readToken: process.env.SANITY_API_READ_TOKEN || "",
  revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || "",
  studioUrl: `${siteUrl}/studio`,
};

export const hasSanityConfig = Boolean(
  sanityEnv.projectId && sanityEnv.dataset
);

export const sanityFallbackProjectId = sanityEnv.projectId || "replace-me";
export const sanityFallbackDataset = sanityEnv.dataset || "production";

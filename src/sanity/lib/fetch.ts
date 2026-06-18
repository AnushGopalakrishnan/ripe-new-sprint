import { draftMode } from "next/headers";
import { client } from "@/sanity/lib/client";
import { hasSanityConfig, sanityEnv } from "@/lib/env";

type SanityFetchOptions = {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
};

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 300,
  tags = [],
}: SanityFetchOptions): Promise<{ data: T }> {
  if (!hasSanityConfig) {
    return { data: null as T };
  }

  let isDraftMode = false;

  try {
    isDraftMode = (await draftMode()).isEnabled;
  } catch {
    // Static generation paths run without a request context.
    isDraftMode = false;
  }

  const perspective = isDraftMode ? "drafts" : "published";

  const data = await client
    .withConfig({
      stega: isDraftMode ? { studioUrl: sanityEnv.studioUrl } : false,
      useCdn: !isDraftMode && !sanityEnv.readToken,
    })
    .fetch<T>(query, params, {
      next: {
        revalidate: isDraftMode ? 0 : tags.length ? false : revalidate,
        tags: isDraftMode ? [] : tags,
      },
      perspective,
      token: sanityEnv.readToken || undefined,
    });

  return { data };
}

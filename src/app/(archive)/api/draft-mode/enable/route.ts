import { NextRequest, NextResponse } from "next/server";
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { hasSanityConfig, sanityEnv } from "@/lib/env";
import { client } from "@/sanity/lib/client";

const handler = defineEnableDraftMode({
  client: client.withConfig({
    token: sanityEnv.readToken || "",
  }),
});

export async function GET(request: NextRequest) {
  if (!hasSanityConfig || !sanityEnv.readToken) {
    return NextResponse.json(
      {
        message:
          "Configure NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_READ_TOKEN to enable Draft Mode.",
      },
      { status: 503 }
    );
  }

  return handler.GET(request);
}

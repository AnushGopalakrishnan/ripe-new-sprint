import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sanityEnv } from "@/lib/env";
import { caseStudyHref, writingHref } from "@/lib/routes";

type RevalidatePayload = {
  _type?: string;
  type?: string;
  slug?: string | { current?: string };
  secret?: string;
  paths?: string[];
  tags?: string[];
};

const slugValue = (slug: RevalidatePayload["slug"]) =>
  typeof slug === "string" ? slug : slug?.current;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as RevalidatePayload;
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-sanity-secret") ||
    body.secret;

  if (!sanityEnv.revalidateSecret || secret !== sanityEnv.revalidateSecret) {
    return NextResponse.json({ message: "Invalid revalidation secret." }, { status: 401 });
  }

  const type = body._type || body.type;
  const slug = slugValue(body.slug);
  const paths = new Set(body.paths || []);
  const tags = new Set(body.tags || []);

  switch (type) {
    case "homePage":
      paths.add("/");
      tags.add("homePage");
      break;
    case "siteSettings":
      paths.add("/");
      paths.add("/case-studies");
      paths.add("/writing");
      tags.add("siteSettings");
      break;
    case "caseStudy":
      paths.add("/case-studies");
      tags.add("caseStudy");
      if (slug) {
        paths.add(caseStudyHref(slug));
        tags.add(`caseStudy:${slug}`);
      }
      break;
    case "writing":
      paths.add("/writing");
      tags.add("writing");
      if (slug) {
        paths.add(writingHref(slug));
        tags.add(`writing:${slug}`);
      }
      break;
    default:
      paths.add("/");
      break;
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    ok: true,
    paths: [...paths],
    tags: [...tags],
  });
}

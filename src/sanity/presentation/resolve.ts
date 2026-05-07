import {
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";
import { caseStudyHref, writingHref } from "@/lib/routes";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    homePage: defineLocations({
      resolve: () => ({ locations: [{ title: "Home", href: "/" }] }),
      select: {},
    }),
    siteSettings: defineLocations({
      resolve: () => ({ locations: [{ title: "Site Settings", href: "/" }] }),
      select: {},
    }),
    caseStudy: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (document) =>
        document?.slug
          ? {
              locations: [
                {
                  title: document.title || "Case Study",
                  href: caseStudyHref(document.slug),
                },
              ],
            }
          : { locations: [] },
    }),
    writing: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (document) =>
        document?.slug
          ? {
              locations: [
                {
                  title: document.title || "Writing",
                  href: writingHref(document.slug),
                },
              ],
            }
          : { locations: [] },
    }),
  },
  mainDocuments: [
    {
      route: "/",
      filter: `_type == "homePage"`,
    },
    {
      route: "/case-studies/:slug",
      filter: `_type == "caseStudy" && slug.current == $slug`,
    },
    {
      route: "/writing/:slug",
      filter: `_type == "writing" && slug.current == $slug`,
    },
  ],
};

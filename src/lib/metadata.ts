import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/routes";

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
};

const siteName = "Ripe Studios";
const baseDescription =
  "Creative technology, visual systems, and content operations for ambitious editorial marketing sites.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: baseDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: baseDescription,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: baseDescription,
    images: [absoluteUrl("/twitter-image")],
  },
};

export const createMetadata = ({
  title,
  description = baseDescription,
  path = "/",
}: MetadataOptions): Metadata => ({
  title,
  description,
  alternates: {
    canonical: absoluteUrl(path),
  },
  openGraph: {
    title: title || siteName,
    description,
    url: absoluteUrl(path),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: title || siteName,
      },
    ],
  },
  twitter: {
    title: title || siteName,
    description,
    images: [absoluteUrl("/twitter-image")],
  },
});

export const createExactTitleMetadata = ({
  title = siteName,
  description = baseDescription,
  path = "/",
}: MetadataOptions): Metadata => ({
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: absoluteUrl(path),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl(path),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [absoluteUrl("/twitter-image")],
  },
});

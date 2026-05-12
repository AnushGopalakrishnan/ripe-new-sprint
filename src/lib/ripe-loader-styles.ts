import type { NativeMirrorDocument } from "@/lib/native-mirror";

const globalStyles = ["global/components", "global/theme", "global/card-hover"];

const exactStyles: Record<string, string[]> = {
  "/archive/writing-new-copy": ["writings/horizontal-feed"],
  "/case-studies-new": [
    "case-studies/list-view",
    "case-studies/grid-layout",
    "case-studies/hover-effects",
    "case-studies/mobile-filters",
    "case-studies/hover-theme",
  ],
  "/case-studies-new-copy": [
    "case-studies/list-view",
    "case-studies/grid-layout",
    "case-studies/hover-effects",
    "case-studies/mobile-filters",
    "case-studies/hover-theme",
  ],
};

const prefixStyles: Array<[string, string[]]> = [
  ["/writing/", ["writings/horizontal-blog"]],
  ["/case-studies/", ["case-studies/detail-builder"]],
];

function loaderStyleLinks(sourceRoute: string) {
  const names = new Set(globalStyles);

  for (const name of exactStyles[sourceRoute] ?? []) {
    names.add(name);
  }

  for (const [prefix, styles] of prefixStyles) {
    if (sourceRoute.startsWith(prefix)) {
      for (const name of styles) names.add(name);
      break;
    }
  }

  return Array.from(names)
    .map((name) => `<link data-ripe-loader-ssr href="/vendor/ripe/styles/${name}.css" rel="stylesheet"/>`)
    .join("");
}

export function withRipeLoaderStyles(document: NativeMirrorDocument): NativeMirrorDocument {
  if (document.headMarkup.includes("data-ripe-loader-ssr")) return document;

  const links = loaderStyleLinks(document.sourceRoute);
  if (!links) return document;

  return {
    ...document,
    headMarkup: `${document.headMarkup}${links}`,
  };
}

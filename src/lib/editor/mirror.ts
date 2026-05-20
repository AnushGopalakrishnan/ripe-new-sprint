import fs from "node:fs/promises";
import path from "node:path";
import { workJournalItems } from "@/data/work-journal";
import { bridgeScript } from "@/lib/editor/bridge-source";
import type { MirrorRoute } from "@/lib/editor/types";
import { getCaseStudies, getWritingPosts } from "@/lib/content";

const siteRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "site");

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function within(root: string, filePath: string) {
  const relative = path.relative(root, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function normalizeSegments(segments: string[] = []) {
  return segments
    .join("/")
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..");
}

function routeToHtmlPath(routePath: string) {
  if (!routePath || routePath === "/") return path.join(siteRoot, "index.html");
  return path.join(siteRoot, routePath.replace(/^\/+/, ""), "index.html");
}

const collectionDefinitions = [
  { prefix: "/case-studies/tags/", key: "case-study-tags", label: "Case study tags" },
  { prefix: "/case-studies/", key: "case-studies", label: "Case studies" },
  { prefix: "/feed-posts/", key: "feed-posts", label: "Feed posts" },
  { prefix: "/job-listings/", key: "job-listings", label: "Job listings" },
  { prefix: "/team/", key: "team", label: "Team" },
  { prefix: "/writing/", key: "writing", label: "Writing" },
];

function humanizeSlug(value: string) {
  return value
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .at(-1)
    ?.replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || value;
}

function collectionForPath(route: string, itemLabel = humanizeSlug(route)) {
  const collection = collectionDefinitions.find((definition) => {
    if (!route.startsWith(definition.prefix)) return false;
    return route.slice(definition.prefix.length).length > 0;
  });

  if (!collection) return undefined;

  return {
    key: collection.key,
    label: collection.label,
    itemLabel,
  };
}

function routeLabel(route: string) {
  if (route === "/") return "Home";
  return route.replace(/^\//, "");
}

function makeRoute(route: string, label = routeLabel(route), itemLabel?: string): MirrorRoute {
  return {
    path: route,
    label,
    collection: collectionForPath(route, itemLabel),
  };
}

function mergeRoutes(routes: MirrorRoute[]) {
  const byPath = new Map<string, MirrorRoute>();

  for (const route of routes) {
    const existing = byPath.get(route.path);
    byPath.set(route.path, {
      ...existing,
      ...route,
      collection: route.collection ?? existing?.collection,
    });
  }

  return Array.from(byPath.values());
}

async function getCmsCollectionRoutes() {
  try {
    const [caseStudies, writingPosts] = await Promise.all([
      getCaseStudies(),
      getWritingPosts(),
    ]);

    return [
      ...caseStudies
        .filter((study) => study.slug)
        .map((study) =>
          makeRoute(
            `/case-studies/${study.slug}`,
            study.title || routeLabel(`/case-studies/${study.slug}`),
            study.title || humanizeSlug(study.slug),
          ),
        ),
      ...writingPosts
        .filter((post) => post.slug)
        .map((post) =>
          makeRoute(
            `/writing/${post.slug}`,
            post.title || routeLabel(`/writing/${post.slug}`),
            post.title || humanizeSlug(post.slug),
          ),
        ),
    ];
  } catch {
    return [];
  }
}

async function firstExisting(paths: string[]) {
  for (const candidate of paths) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  return null;
}

function localAssetCandidates(assetPath: string) {
  const clean = assetPath.replace(/^\/+/, "");
  if (clean.startsWith("vendor/")) return [path.join(siteRoot, clean)];
  if (
    clean.startsWith("css/") ||
    clean.startsWith("fonts/") ||
    clean.startsWith("images/") ||
    clean.startsWith("js/")
  ) {
    return [path.join(siteRoot, clean)];
  }
  return [path.join(siteRoot, clean)];
}

function rewriteInternalAnchors(html: string) {
  return html.replace(
    /\s(href|src)=["']\/(?!\/|__mirror|__editor|api|studio|favicon\.ico)([^"']*)["']/g,
    (_match, attr: string, url: string) => {
      if (/^(?:vendor|css|fonts|images|js)\//.test(url)) {
        return ` ${attr}="/__mirror/${url}"`;
      }
      return ` ${attr}="/__mirror/${url}"`;
    },
  );
}

function rewriteExportRelativeAssets(html: string) {
  return html.replace(
    /\s(href|src)=["']((?:css|fonts|images|js)\/[^"']+)["']/g,
    (_match, attr: string, url: string) => ` ${attr}="/__mirror/${url}"`,
  );
}

function rewriteRemoteWebflowAssets(html: string) {
  let nextHtml = html;

  nextHtml = nextHtml.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/[^"']*\/css\/[^"']*ripe-studios[^"']*\.css/g,
    "/__mirror/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css",
  );

  nextHtml = nextHtml.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/[^"']*RIPE%20FAVIOCN\.svg/g,
    "/__mirror/images/favicon.svg",
  );

  nextHtml = nextHtml.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/[^"']*RIPE%20WEBCLIP\.svg/g,
    "/__mirror/images/webclip.svg",
  );

  return nextHtml;
}

function rewriteVendorPaths(source: string) {
  return source
    .replaceAll('"/vendor/', '"/__mirror/vendor/')
    .replaceAll("'/vendor/", "'/__mirror/vendor/")
    .replaceAll("=/vendor/", "=/__mirror/vendor/")
    .replaceAll("url(/vendor/", "url(/__mirror/vendor/");
}

function stripLocalIntegrity(html: string) {
  return html.replace(/<(link|script)\b[^>]*(?:href|src)=["']\/__mirror\/[^"']+["'][^>]*>/g, (tag) =>
    tag
      .replace(/\s+integrity=["'][^"']*["']/g, "")
      .replace(/\s+crossorigin=["'][^"']*["']/g, ""),
  );
}

function injectMirrorStyles(html: string) {
  const styles =
    "<style data-ripe-mirror-fixes>" +
    ".w-webflow-badge{display:none!important;visibility:hidden!important;}" +
    ".w-form-done,.w-form-fail{display:none!important;visibility:hidden!important;}" +
    "</style>";

  if (html.includes("data-ripe-mirror-fixes")) return html;
  if (html.includes("</head>")) return html.replace("</head>", `${styles}</head>`);
  return `${styles}${html}`;
}

function injectBridge(html: string) {
  const injected = `<script data-ripe-editor-bridge>${bridgeScript}</script>`;
  if (html.includes("data-ripe-editor-bridge")) return html;
  if (html.includes("</body>")) return html.replace("</body>", `${injected}</body>`);
  return `${html}${injected}`;
}

export function rewriteMirrorHtml(html: string) {
  return injectBridge(
    injectMirrorStyles(
      stripLocalIntegrity(
        rewriteVendorPaths(
          rewriteRemoteWebflowAssets(rewriteExportRelativeAssets(rewriteInternalAnchors(html))),
        ),
      ),
    ),
  );
}

export async function readMirrorResource(segments: string[] = []) {
  const cleanSegments = normalizeSegments(segments);
  const requestedPath = cleanSegments.join("/");
  const extension = path.extname(requestedPath);

  if (extension) {
    const assetPath = await firstExisting(localAssetCandidates(requestedPath));
    if (!assetPath) return null;
    if (!within(siteRoot, assetPath)) return null;
    const body = await fs.readFile(assetPath);
    const contentType = mimeTypes[extension.toLowerCase()] ?? "application/octet-stream";
    const source =
      extension === ".js" || extension === ".css"
        ? rewriteVendorPaths(body.toString("utf8"))
        : body;
    return { body: source, contentType };
  }

  const routePath = `/${requestedPath}`.replace(/\/$/, "") || "/";
  const htmlPath = await firstExisting([routeToHtmlPath(routePath)]);

  if (!htmlPath) return null;
  if (!within(siteRoot, htmlPath)) return null;

  const html = await fs.readFile(htmlPath, "utf8");
  return {
    body: rewriteMirrorHtml(html),
    contentType: mimeTypes[".html"],
  };
}

export async function getMirrorRoutes(): Promise<MirrorRoute[]> {
  try {
    const [manifest, cmsCollectionRoutes] = await Promise.all([
      fs.readFile(path.join(siteRoot, "routes.json"), "utf8"),
      getCmsCollectionRoutes(),
    ]);
    const routes = JSON.parse(manifest) as string[];
    const canonicalRoutes = routes.map((route) => {
      if (route === "/case-studies-new" || route === "/case-studies-new-copy") return "/case-studies";
      if (route.startsWith("/case-studies-tags/")) {
        return route.replace(/^\/case-studies-tags\//, "/case-studies/tags/");
      }
      if (route === "/archive/writing" || route === "/archive/writing-new-copy") return "/writing";
      if (route === "/archive/team" || route === "/archive/team-new") return "/team";
      if (route === "/archive/services") return "/services";
      if (route === "/archive/careers") return "/careers";
      if (route === "/archive/work") return "/work";
      return route;
    });
    const uniqueRoutes = [...new Set(canonicalRoutes)];
    const routesWithCustomPages = mergeRoutes([
      { path: "/home-new-feed", label: "Home (new feed)" },
      { path: "/work-new", label: "Work (new journal)" },
      { path: "/work-new-alternate", label: "Work (alternate journal)" },
      ...uniqueRoutes.map((route) => makeRoute(route)),
      ...workJournalItems.map((item) =>
        makeRoute(`/case-studies/${item.slug}`, item.title, item.title),
      ),
      ...cmsCollectionRoutes,
    ]);
    return routesWithCustomPages;
  } catch {
    return [{ path: "/", label: "Home" }];
  }
}

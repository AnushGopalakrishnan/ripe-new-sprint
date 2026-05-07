import fs from "node:fs/promises";
import path from "node:path";
import { bridgeScript } from "@/lib/editor/bridge-source";
import type { MirrorRoute } from "@/lib/editor/types";

const siteRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "site");
const exportRoot = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".context",
  "webflow-export",
);

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

function exportHtmlFallback(routePath: string) {
  const clean = routePath.replace(/^\/+/, "");
  if (!clean) return path.join(exportRoot, "index.html");
  return path.join(exportRoot, `${clean}.html`);
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

function localAssetPath(assetPath: string) {
  const clean = assetPath.replace(/^\/+/, "");
  if (clean.startsWith("vendor/")) return path.join(siteRoot, clean);
  if (
    clean.startsWith("css/") ||
    clean.startsWith("fonts/") ||
    clean.startsWith("images/") ||
    clean.startsWith("js/")
  ) {
    return path.join(exportRoot, clean);
  }
  return path.join(siteRoot, clean);
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

function injectBridge(html: string) {
  const injected = `<script data-ripe-editor-bridge>${bridgeScript}</script>`;
  if (html.includes("data-ripe-editor-bridge")) return html;
  if (html.includes("</body>")) return html.replace("</body>", `${injected}</body>`);
  return `${html}${injected}`;
}

export function rewriteMirrorHtml(html: string) {
  return injectBridge(
    stripLocalIntegrity(
      rewriteVendorPaths(
        rewriteRemoteWebflowAssets(rewriteExportRelativeAssets(rewriteInternalAnchors(html))),
      ),
    ),
  );
}

export async function readMirrorResource(segments: string[] = []) {
  const cleanSegments = normalizeSegments(segments);
  const requestedPath = cleanSegments.join("/");
  const extension = path.extname(requestedPath);

  if (extension) {
    const assetPath = localAssetPath(requestedPath);
    const assetRoot = requestedPath.startsWith("vendor/") ? siteRoot : exportRoot;
    if (!within(assetRoot, assetPath)) return null;
    const body = await fs.readFile(assetPath);
    const contentType = mimeTypes[extension.toLowerCase()] ?? "application/octet-stream";
    const source =
      extension === ".js" || extension === ".css"
        ? rewriteVendorPaths(body.toString("utf8"))
        : body;
    return { body: source, contentType };
  }

  const routePath = `/${requestedPath}`.replace(/\/$/, "") || "/";
  const htmlPath = await firstExisting([
    routeToHtmlPath(routePath),
    exportHtmlFallback(routePath),
  ]);

  if (!htmlPath) return null;
  if (!within(siteRoot, htmlPath) && !within(exportRoot, htmlPath)) return null;

  const html = await fs.readFile(htmlPath, "utf8");
  return {
    body: rewriteMirrorHtml(html),
    contentType: mimeTypes[".html"],
  };
}

export async function getMirrorRoutes(): Promise<MirrorRoute[]> {
  try {
    const manifest = await fs.readFile(path.join(siteRoot, "routes.json"), "utf8");
    const routes = JSON.parse(manifest) as string[];
    return routes.map((route) => ({
      path: route,
      label: route === "/" ? "Home" : route.replace(/^\//, ""),
    }));
  } catch {
    return [{ path: "/", label: "Home" }];
  }
}

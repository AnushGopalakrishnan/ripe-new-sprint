import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

const siteRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "site");
const routesManifestPath = path.join(siteRoot, "routes.json");

const localStylesheetBundle = [
  '<link href="/css/normalize.css" rel="stylesheet" type="text/css"/>',
  '<link href="/css/webflow.css" rel="stylesheet" type="text/css"/>',
  '<link href="/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css" rel="stylesheet" type="text/css"/>',
].join("");

const canonicalRedirects = new Map<string, string>([
  ["/case-studies-new", "/case-studies"],
  ["/case-studies-new-copy", "/case-studies"],
  ["/archive/writing", "/writing"],
  ["/archive/writing-new-copy", "/writing"],
  ["/archive/team", "/team"],
  ["/archive/team-new", "/team"],
  ["/archive/services", "/services"],
  ["/archive/careers", "/careers"],
  ["/archive/work", "/work"],
]);

const remoteScriptTagPattern =
  /<script\b(?=[^>]*\bsrc=["']https?:\/\/)[\s\S]*?<\/script>/gi;
const remoteLinkTagPattern = /<link\b(?=[^>]*\bhref=["']https?:\/\/)[^>]*>/gi;
const websiteFilesMediaUrlPattern =
  /https:\/\/cdn\.prod\.website-files\.com\/[^"'\s)<>]+(?:\.(?:png|jpe?g|webp|avif|svg|gif|mp4)|\/png)(?:\?[^"'\s)<>]*)?/gi;
const showreelScalingVideoUrl =
  "https://osmo.b-cdn.net/resource-media/scaling-element-resource-185787-876545918_tiny.mp4";
const localShowreelScalingVideoPath =
  "/mirror-media/scaling-element-resource-185787-876545918_tiny.mp4";

function localWebsiteFilesMediaPath(remoteUrl: string) {
  const cleanUrl = remoteUrl.replace(/&quot;.*/, "");
  const url = new URL(cleanUrl);
  let extension = path.extname(url.pathname).toLowerCase();

  if (!extension && url.pathname.endsWith("/png")) {
    extension = ".png";
  }

  const hash = crypto.createHash("sha1").update(cleanUrl).digest("hex").slice(0, 16);
  return `/images/remote/${hash}${extension || ".bin"}`;
}

function encodeScriptContent(content: string) {
  return Buffer.from(content, "utf8").toString("base64");
}

export type NativeMirrorDocument = {
  bodyAttributes: Record<string, string>;
  bodyMarkup: string;
  headMarkup: string;
  htmlAttributes: Record<string, string>;
  sourceRoute: string;
  title: string;
};

function routeToHtmlPath(routePath: string) {
  if (!routePath || routePath === "/") return path.join(siteRoot, "index.html");
  return path.join(siteRoot, routePath.replace(/^\/+/, ""), "index.html");
}

function parseAttributes(raw: string) {
  const attributes: Record<string, string> = {};
  const pattern = /([^\s=]+)(?:=(["'])(.*?)\2)?/g;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(raw))) {
    const [, name, , value = ""] = match;
    if (name) attributes[name] = value;
  }

  return attributes;
}

function canonicalizeHref(href: string) {
  if (!href || href.startsWith("#")) return href;
  if (/^(mailto:|tel:|javascript:)/i.test(href)) return href;

  let url: URL;
  try {
    url = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "https://ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.io");
  } catch {
    return href;
  }

  if (
    url.origin !== "https://ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.io" &&
    url.origin !== "null"
  ) {
    return href;
  }

  let pathname = url.pathname.replace(/\/$/, "") || "/";

  if (canonicalRedirects.has(pathname)) {
    pathname = canonicalRedirects.get(pathname) ?? pathname;
  } else if (pathname.startsWith("/case-studies-tags/")) {
    pathname = pathname.replace(/^\/case-studies-tags\//, "/case-studies/tags/");
  }

  return `${pathname}${url.search}${url.hash}`;
}

function rewriteLocalAssetUrls(html: string) {
  let next = html;

  next = next.replace(
    /<link\b[^>]*href=["']https:\/\/cdn\.prod\.website-files\.com\/[^"']*ripe-studios[^"']*\.css["'][^>]*>/g,
    localStylesheetBundle,
  );
  next = next.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/[^"']*RIPE%20FAVIOCN\.svg/g,
    "/images/favicon.svg",
  );
  next = next.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/[^"']*RIPE%20WEBCLIP\.svg/g,
    "/images/webclip.svg",
  );
  next = next.replace(
    /<script[^>]+src="https:\/\/cdn\.prod\.website-files\.com\/[^"]+\/js\/webflow[^"]+\.js"[^>]*><\/script>/g,
    '<script src="/js/webflow.js" type="text/javascript"></script>',
  );
  next = next.replace(
    /(?:<script src="\/js\/webflow\.js" type="text\/javascript"><\/script>\s*){2,}/g,
    '<script src="/js/webflow.js" type="text/javascript"></script>',
  );
  next = next.replace(websiteFilesMediaUrlPattern, (remoteUrl) =>
    localWebsiteFilesMediaPath(remoteUrl),
  );
  next = next.replaceAll(showreelScalingVideoUrl, localShowreelScalingVideoPath);
  next = next.replace(remoteScriptTagPattern, "").replace(remoteLinkTagPattern, "");

  next = next.replace(
    /\s(href|src)=["'](?:\.\.\/)+(css|fonts|images|js)\/([^"']+)["']/g,
    (_match, attr: string, folder: string, filePath: string) =>
      ` ${attr}="/${folder}/${filePath}"`,
  );
  next = next.replace(
    /\s(href|src)=["'](?:\.\/)?(css|fonts|images|js|vendor)\/([^"']+)["']/g,
    (_match, attr: string, folder: string, filePath: string) =>
      ` ${attr}="/${folder}/${filePath}"`,
  );
  next = next.replace(/href=["']([^"']+)["']/g, (match, href: string) => {
    if (/^(css|fonts|images|js|vendor)\//.test(href)) return `href="/${href}"`;
    const canonical = canonicalizeHref(href);
    return canonical === href ? match : `href="${canonical}"`;
  });

  next = next.replace(
    "</head>",
    '<style>.w-webflow-badge{display:none!important;visibility:hidden!important;}.w-form-done,.w-form-fail{display:none!important;visibility:hidden!important;}</style></head>',
  );
  next = next.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_match, attributes: string, content: string) => {
      const encodedContent = content.trim()
        ? ` data-ripe-native-script-content="${encodeScriptContent(content)}"`
        : "";
      return `<template data-ripe-native-script${encodedContent}${attributes}></template>`;
    },
  );

  return next;
}

function extractSection(html: string, tagName: "head" | "body") {
  const match = html.match(new RegExp(`<${tagName}([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? { attrs: parseAttributes(match[1] ?? ""), inner: match[2] ?? "" } : null;
}

function stripHeadNoise(headMarkup: string) {
  return headMarkup
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .replace(/<meta[\s\S]*?>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon|mask-icon)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']manifest["'][^>]*>/gi, "")
    .trim();
}

export async function loadNativeMirrorDocument(sourceRoute: string): Promise<NativeMirrorDocument> {
  const html = await fs.readFile(routeToHtmlPath(sourceRoute), "utf8");
  const rewritten = rewriteLocalAssetUrls(html);
  const htmlTag = rewritten.match(/<html([^>]*)>/i);
  const head = extractSection(rewritten, "head");
  const body = extractSection(rewritten, "body");
  const titleMatch = rewritten.match(/<title>([\s\S]*?)<\/title>/i);

  return {
    title: titleMatch?.[1]?.trim() ?? "Ripe Studios",
    htmlAttributes: parseAttributes(htmlTag?.[1] ?? ""),
    headMarkup: stripHeadNoise(head?.inner ?? ""),
    bodyAttributes: body?.attrs ?? {},
    bodyMarkup: body?.inner ?? "",
    sourceRoute,
  };
}

async function readRoutesManifest() {
  const manifest = JSON.parse(await fs.readFile(routesManifestPath, "utf8")) as string[];
  return manifest;
}

export async function getNativeWritingSlugs() {
  const routes = await readRoutesManifest();
  return routes
    .filter((route) => /^\/writing\/[^/]+$/.test(route))
    .map((route) => route.split("/").filter(Boolean).pop() ?? "")
    .filter(Boolean);
}

export async function getNativeTeamSlugs() {
  const routes = await readRoutesManifest();
  return routes
    .filter((route) => /^\/team\/[^/]+$/.test(route))
    .map((route) => route.split("/").filter(Boolean).pop() ?? "")
    .filter(Boolean);
}

export async function getNativeCaseStudyTagSlugs() {
  const routes = await readRoutesManifest();
  return routes
    .filter((route) => /^\/case-studies-tags\/[^/]+$/.test(route))
    .map((route) => route.split("/").filter(Boolean).pop() ?? "")
    .filter(Boolean);
}

export function sourceRouteForCanonicalCaseStudyTag(slug: string) {
  return `/case-studies-tags/${slug}`;
}

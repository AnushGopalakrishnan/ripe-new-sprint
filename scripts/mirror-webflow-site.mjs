import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL =
  "https://ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.io";
const OUTPUT_DIR = path.resolve("site");
const VENDOR_DIR = path.join(OUTPUT_DIR, "vendor");
const EXPORT_DIR = path.resolve(".context", "webflow-export");
const EXPORTED_ASSET_DIRS = ["css", "fonts", "images", "js"];

const seedRoutes = [
  "/",
  "/case-studies-new",
  "/case-studies-new-copy",
  "/archive/writing-new-copy",
  "/archive/team-new",
  "/archive/writing",
  "/archive/work",
  "/archive/team",
  "/archive/services",
  "/archive/careers",
];

const localAssetMap = new Map([
  ["https://ripe-studios.netlify.app/loader.js", "/vendor/loader.js"],
  [
    "https://assets.slater.app/slater/18806.js?v=1.0",
    "/vendor/slater-18806.js",
  ],
  ["https://slater.app/18806.js", "/vendor/slater-18806.js"],
  ["https://vxmgyv.csb.app/src/style.css", "/vendor/vxmgyv-style.css"],
  ["https://vxmgyv.csb.app/src/index.js", "/vendor/vxmgyv-index.js"],
  ["https://vxmgyv.csb.app/src/bunnjs.js", "/vendor/vxmgyv-bunnjs.js"],
]);

const ripeBase = "https://ripe-studios.netlify.app";
const ripeScriptModules = [
  "global/theme-detector",
  "global/media-player",
  "home/bunny-player",
  "writings/horizontal-feed",
  "writings/horizontal-blog",
  "case-studies/preview-follower",
  "case-studies/grid-list-toggle",
  "case-studies/mobile-filters",
  "case-studies/hover-theme",
  "case-studies/detail-builder",
];

const ripeStyleModules = [
  "global/components",
  "global/theme",
  "global/card-hover",
  "writings/horizontal-feed",
  "writings/horizontal-blog",
  "case-studies/list-view",
  "case-studies/grid-layout",
  "case-studies/hover-effects",
  "case-studies/mobile-filters",
  "case-studies/hover-theme",
  "case-studies/detail-builder",
];

function normalizeRoute(route) {
  if (!route) return "/";
  const url = new URL(route, BASE_URL);
  if (url.origin !== BASE_URL) return null;
  if (/\.(css|js|png|jpg|jpeg|svg|webp|avif|gif|ttf|otf|woff2?)$/i.test(url.pathname)) {
    return null;
  }
  if (url.pathname === "/404") return null;
  return url.pathname.replace(/\/$/, "") || "/";
}

function routeToFilePath(route) {
  if (route === "/") return path.join(OUTPUT_DIR, "index.html");
  const cleaned = route.replace(/^\//, "");
  return path.join(OUTPUT_DIR, cleaned, "index.html");
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 Codex Mirror Bot",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function extractRoutes(html) {
  const matches = [...html.matchAll(/href="([^"]+)"/g)];
  const routes = new Set();

  for (const [, href] of matches) {
    const route = normalizeRoute(href);
    if (route) routes.add(route);
  }

  return [...routes];
}

function rewriteHtml(html) {
  let nextHtml = html;

  for (const [remote, local] of localAssetMap.entries()) {
    nextHtml = nextHtml.split(remote).join(local);
  }

  nextHtml = nextHtml.replace(
    /let src=window\.location\.host\.includes\("webflow\.io"\)\?"https:\/\/slater\.app\/18806\.js":"https:\/\/assets\.slater\.app\/slater\/18806\.js\?v=1\.0";/g,
    'let src="/vendor/slater-18806.js";'
  );

  nextHtml = nextHtml.replace(
    "</head>",
    "<style>.w-webflow-badge{display:none!important;visibility:hidden!important;}.w-form-done,.w-form-fail{display:none!important;visibility:hidden!important;}</style></head>"
  );

  return nextHtml;
}

async function writeRoute(route, html) {
  const filePath = routeToFilePath(route);
  await ensureDir(filePath);
  await fs.writeFile(filePath, rewriteHtml(html), "utf8");
}

async function downloadVendorFile(url, relativePath) {
  const body = await fetchText(url);
  const filePath = path.join(OUTPUT_DIR, relativePath.replace(/^\//, ""));
  await ensureDir(filePath);
  await fs.writeFile(filePath, body, "utf8");
}

async function downloadVendorText(url, filePath, transform) {
  const body = await fetchText(url);
  await ensureDir(filePath);
  await fs.writeFile(filePath, transform ? transform(body) : body, "utf8");
}

async function copyExportAssets() {
  for (const directory of EXPORTED_ASSET_DIRS) {
    const source = path.join(EXPORT_DIR, directory);
    const destination = path.join(OUTPUT_DIR, directory);
    await fs.cp(source, destination, { recursive: true, force: true });
  }
}

function patchRipeScriptModule(moduleName, source) {
  if (moduleName === "case-studies/grid-list-toggle") {
    return source
      .replace(
        `  var gridList = document.querySelector('[fs-list-element="list"]');\n`,
        `  var gridView = document.querySelector('.case-studies-wrapper.is-grid');\n` +
          `  var gridList = gridView && (\n` +
          `    gridView.querySelector('.case-studies-list[fs-list-element="list"]') ||\n` +
          `    gridView.querySelector('#masonry1') ||\n` +
          `    gridView.querySelector('[fs-list-element="list"]')\n` +
          `  );\n`
      )
      .replace(
        `  var gridView = document.querySelector('.case-studies-wrapper.is-grid');\n`,
        ``
      )
      .replace(
        `[fs-list-element="list"] > * { opacity: 0 !important; }`,
        `.case-studies-list[fs-list-element="list"] > * { opacity: 0 !important; }`
      )
      .replace(
        `  gridList.querySelectorAll(':scope > *').forEach(function(item) {\n` +
          `    item.style.setProperty('opacity', '1', 'important');\n` +
          `  });\n`,
        `  Array.prototype.forEach.call(gridList.children, function(item) {\n` +
          `    item.style.setProperty('opacity', '1', 'important');\n` +
          `  });\n` +
          `  gridView.style.setProperty('opacity', '1', 'important');\n`
      );
  }

  if (moduleName === "case-studies/hover-theme") {
    return source.replace(
      `  // Store event listener references for cleanup\n`,
      `  function getCardAccentColor(card) {\n` +
        `    var accentNode = card.querySelector('[data-accent-color]');\n` +
        `    if (accentNode && accentNode.dataset.accentColor) {\n` +
        `      return accentNode.dataset.accentColor;\n` +
        `    }\n\n` +
        `    var cardColor = card.getAttribute('data-color');\n` +
        `    if (cardColor) return cardColor;\n\n` +
        `    var overlayNode = card.querySelector('.color_overlay');\n` +
        `    if (overlayNode) {\n` +
        `      var overlayColor = overlayNode.style.backgroundColor || window.getComputedStyle(overlayNode).backgroundColor;\n` +
        `      if (overlayColor) return overlayColor;\n` +
        `    }\n\n` +
        `    return null;\n` +
        `  }\n\n` +
        `  // Store event listener references for cleanup\n`
    ).replace(
      `      var colorEl = card.querySelector('[data-accent-color]');\n` +
        `      if (colorEl && colorEl.dataset.accentColor !== activeHex) {\n` +
        `        applyTheme(colorEl.dataset.accentColor);\n` +
        `      }\n`,
      `      var accentColor = getCardAccentColor(card);\n` +
        `      if (accentColor && accentColor !== activeHex) {\n` +
        `        applyTheme(accentColor);\n` +
        `      }\n`
    );
  }

  return source;
}

async function buildRouteSet() {
  const visited = new Set();
  const queue = [...seedRoutes];

  while (queue.length > 0) {
    const route = normalizeRoute(queue.shift());
    if (!route || visited.has(route)) continue;
    visited.add(route);

    try {
      const html = await fetchText(`${BASE_URL}${route}`);
      const linkedRoutes = extractRoutes(html);
      for (const linkedRoute of linkedRoutes) {
        if (!visited.has(linkedRoute)) queue.push(linkedRoute);
      }
    } catch (error) {
      console.warn(`[mirror] skip ${route}: ${error.message}`);
    }
  }

  return [...visited].sort();
}

async function mirrorRoute(route) {
  const html = await fetchText(`${BASE_URL}${route}`);
  await writeRoute(route, html);
}

async function main() {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(VENDOR_DIR, { recursive: true });
  await copyExportAssets();

  const routes = await buildRouteSet();
  for (const route of routes) {
    try {
      await mirrorRoute(route);
    } catch (error) {
      console.warn(`[mirror] route omitted ${route}: ${error.message}`);
    }
  }

  await downloadVendorText(
    "https://ripe-studios.netlify.app/loader.js",
    path.join(OUTPUT_DIR, "vendor", "loader.js"),
    (source) =>
      source.replace(
        "var PROD_BASE = 'https://ripe-studios.netlify.app';",
        "var PROD_BASE = '/vendor/ripe';"
      )
  );
  await downloadVendorFile(
    "https://slater.app/18806.js",
    "vendor/slater-18806.js"
  );
  await downloadVendorFile(
    "https://vxmgyv.csb.app/src/style.css",
    "vendor/vxmgyv-style.css"
  );
  await downloadVendorFile(
    "https://vxmgyv.csb.app/src/index.js",
    "vendor/vxmgyv-index.js"
  );
  await downloadVendorFile(
    "https://vxmgyv.csb.app/src/bunnjs.js",
    "vendor/vxmgyv-bunnjs.js"
  );

  for (const moduleName of ripeScriptModules) {
    const destination = path.join(
      OUTPUT_DIR,
      "vendor",
      "ripe",
      "scripts",
      `${moduleName}.js`
    );
    await downloadVendorText(
      `${ripeBase}/scripts/${moduleName}.js`,
      destination,
      (source) => patchRipeScriptModule(moduleName, source)
    );
  }

  for (const moduleName of ripeStyleModules) {
    const destination = path.join(
      OUTPUT_DIR,
      "vendor",
      "ripe",
      "styles",
      `${moduleName}.css`
    );
    await downloadVendorText(
      `${ripeBase}/styles/${moduleName}.css`,
      destination
    );
  }

  const routeManifestPath = path.join(OUTPUT_DIR, "routes.json");
  await fs.writeFile(routeManifestPath, JSON.stringify(routes, null, 2), "utf8");

  console.log(`[mirror] mirrored ${routes.length} routes`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

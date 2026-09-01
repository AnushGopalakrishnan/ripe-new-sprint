import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { publicComponentDefinitions, publicComponentIds } from "@/components/component-system/registry";

const sourceRoot = path.join(process.cwd(), "src");

function resolveSourceImport(fromFile: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? path.join(sourceRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(fromFile), specifier)
      : null;
  if (!base) return null;

  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function activePublicSourceFiles() {
  const siteRoot = path.join(sourceRoot, "app", "(site)");
  const routeFileNames = new Set([
    "page.tsx",
    "layout.tsx",
    "template.tsx",
    "head.tsx",
    "loading.tsx",
    "error.tsx",
    "not-found.tsx",
    "default.tsx",
    "route.ts",
  ]);
  const entryFiles: string[] = [];
  const visitDirectories = [siteRoot];

  while (visitDirectories.length) {
    const directory = visitDirectories.pop();
    if (!directory) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) visitDirectories.push(candidate);
      else if (routeFileNames.has(entry.name)) entryFiles.push(candidate);
    }
  }

  const reachable = new Set<string>();
  const pending = [...entryFiles];
  const importPattern = /(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;

  while (pending.length) {
    const file = pending.pop();
    if (!file || reachable.has(file)) continue;
    reachable.add(file);
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const importedFile = resolveSourceImport(file, match[1]);
      if (importedFile && !reachable.has(importedFile)) pending.push(importedFile);
    }
  }

  return reachable;
}

test.describe("component system", () => {
  test("registry contains unique components reached by active public routes", () => {
    expect(new Set(publicComponentIds).size).toBe(publicComponentIds.length);
    const reachable = activePublicSourceFiles();

    for (const definition of publicComponentDefinitions) {
      expect(reachable.has(path.join(process.cwd(), definition.sourcePath)), `${definition.id} must be used by an active public route`).toBe(true);
      expect(definition.controls?.config.Surface, `${definition.id} must expose shared specimen surface controls`).toBeTruthy();
    }
  });

  test("DialKit is query-gated inside each specimen and can resize its iframe surface", async ({ page }) => {
    await page.goto("/component-system/components", { waitUntil: "domcontentloaded" });

    const stage = page.locator('[data-component-specimen="work-journal"]');
    const frame = stage.locator('[data-component-frame="work-journal"]');
    await expect(frame).toHaveAttribute("src", "/component-system/specimens/work-journal");
    const untunedSurface = page.frameLocator('[data-component-frame="work-journal"]');
    await untunedSurface.locator("[data-specimen-ready]").waitFor({ state: "attached" });
    await untunedSurface.getByRole("button", { name: /Switch to list view/i }).click();
    await expect(untunedSurface.getByRole("region", { name: "Work journal", exact: true })).toHaveAttribute("data-view", "list");

    await stage.getByRole("button", { name: "Tune" }).click();
    await expect(frame).toHaveAttribute("src", "/component-system/specimens/work-journal");

    const tunedSurface = page.frameLocator('[data-component-frame="work-journal"]');
    await tunedSurface.locator("[data-specimen-ready]").waitFor({ state: "attached" });
    await expect(tunedSurface.getByText("Work journal", { exact: true }).last()).toBeVisible();
    await expect(tunedSurface.getByText("Surface", { exact: true })).toBeVisible();
    await expect(tunedSurface.getByText("Props", { exact: true })).toBeVisible();
    await expect(tunedSurface.getByRole("region", { name: "Work journal", exact: true })).toHaveAttribute("data-view", "list");

    await tunedSurface.locator("body").evaluate(() => {
      window.parent.postMessage(
        { type: "ripe:component-specimen-surface", id: "work-journal", viewport: "Mobile" },
        window.location.origin,
      );
    });
    await expect.poll(async () => frame.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(390);

    await stage.getByRole("button", { name: "Close controls" }).click();
    await expect(frame).toHaveAttribute("src", "/component-system/specimens/work-journal");
    await expect(tunedSurface.getByText("Props", { exact: true })).toHaveCount(0);
  });

  test("hub is unlisted and links only to styles and components", async ({ page }) => {
    await page.goto("/component-system", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Component System/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("heading", { name: "Component System" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Styles" }).first()).toHaveAttribute("href", "/component-system/styles");
    await expect(page.getByRole("link", { name: "Components" }).first()).toHaveAttribute("href", "/component-system/components");
    await expect(page.getByText("Basic Layouts")).toHaveCount(0);
    await expect(page.getByText("Inspired Layouts")).toHaveCount(0);
  });

  test("styles exposes deep-linked foundations", async ({ page }) => {
    await page.goto("/component-system/styles#motion", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Styles/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("#typography")).toBeVisible();
    await expect(page.locator("#color")).toBeVisible();
    await expect(page.locator("#motion")).toBeVisible();
    await expect(page.locator("#themes")).toBeVisible();
    await expect(page.getByRole("link", { name: "motion", exact: true })).toHaveAttribute("aria-current", "location");
  });

  test("category index preserves and updates its selected state", async ({ page }) => {
    await page.goto("/component-system/components", { waitUntil: "domcontentloaded" });
    const media = page.getByRole("link", { name: "Media", exact: true });
    await media.click();
    await expect(page).toHaveURL(/#media$/);
    await expect(media).toHaveAttribute("aria-current", "location");

    await page.locator("#people").scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: "People", exact: true })).toHaveAttribute("aria-current", "location");
  });

  test("components renders every registered production specimen", async ({ page }) => {
    await page.goto("/component-system/components", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Components/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("[data-component-specimen]")).toHaveCount(publicComponentIds.length);

    for (const id of publicComponentIds) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
      await expect(page.frameLocator(`[data-component-frame="${id}"]`).locator(`[data-component="${id}"]`)).toBeVisible();
    }
  });

  test("production interactions remain live inside specimens", async ({ page }) => {
    await page.goto("/component-system/components", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const navigationFrame = page.locator('[data-component-frame="public-navigation"]');
    await navigationFrame.scrollIntoViewIfNeeded();
    const navigationSurface = page.frameLocator('[data-component-frame="public-navigation"]');
    await navigationSurface.locator("[data-specimen-ready]").waitFor({ state: "attached" });
    const openNavigation = navigationSurface.getByRole("button", { name: "Open navigation" });
    await openNavigation.click();
    await expect(navigationSurface.getByRole("button", { name: "Close navigation" })).toBeVisible();
    await navigationSurface.getByRole("button", { name: "Close navigation" }).click();

    const workFrame = page.locator('[data-component-frame="work-journal"]');
    await workFrame.scrollIntoViewIfNeeded();
    const workSurface = page.frameLocator('[data-component-frame="work-journal"]');
    const viewToggle = workSurface.getByRole("button", { name: /Switch to list view/i }).first();
    await viewToggle.click();
    await expect(workSurface.getByRole("region", { name: "Work journal", exact: true })).toHaveAttribute("data-view", "list");

    await page.locator('[data-component-frame="directional-role"]').scrollIntoViewIfNeeded();
    const role = page.frameLocator('[data-component-frame="directional-role"]').locator("[data-directional-hover-item]").first();
    await role.hover();
    await expect(role.locator("[data-directional-hover-tile]")).toHaveCSS("transform", /matrix/);
  });

  test("fixed interactions stay inside their live component surfaces", async ({ page }) => {
    await page.goto("/component-system/components", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    await page.locator('[data-component-frame="public-navigation"]').scrollIntoViewIfNeeded();
    const navigationSurface = page.frameLocator('[data-component-frame="public-navigation"]');
    await navigationSurface.locator("[data-specimen-ready]").waitFor({ state: "attached" });
    await navigationSurface.getByRole("button", { name: "Open navigation" }).click();
    await expect(navigationSurface.getByRole("button", { name: "Close navigation" })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
    await navigationSurface.getByRole("button", { name: "Close navigation" }).click();

    const workFrame = page.locator('[data-component-frame="work-journal"]');
    await workFrame.scrollIntoViewIfNeeded();
    const workSurface = page.frameLocator('[data-component-frame="work-journal"]');
    await workSurface.getByRole("button", { name: /Switch to list view/i }).click();
    await expect(workSurface.getByRole("region", { name: "Work journal", exact: true })).toHaveAttribute("data-view", "list");
    await expect(workSurface.locator('[data-transition="idle"]')).toBeVisible();

    const firstRow = workSurface.locator('a[class*="card"]').first();
    await firstRow.hover();
    const preview = workSurface.locator('[class*="listPreview"]').first();
    await expect(preview).toHaveAttribute("data-visible", "true");

    const previewMetrics = await preview.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        isIsolatedDocument: window.top !== window,
        position: getComputedStyle(element).position,
        intersectsSurface: rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight,
      };
    });
    expect(previewMetrics).toEqual({
      isIsolatedDocument: true,
      position: "fixed",
      intersectsSurface: true,
    });
  });

  test("Careers open roles keeps the same intrinsic layout in production and its specimen", async ({ page }) => {
    for (const width of [1440, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const intrinsicStyles = async (pathName: string) => {
        await page.goto(pathName, { waitUntil: "domcontentloaded" });
        const content = page.locator(".join_us_content");
        await content.waitFor();
        return content.evaluate((element) => {
          const styles = getComputedStyle(element);
          const heading = getComputedStyle(element.querySelector("h2")!);
          const paragraph = getComputedStyle(element.querySelector("p")!);
          return {
            display: styles.display,
            columnCount: styles.gridTemplateColumns.split(" ").length,
            gap: styles.gap,
            headingMargin: heading.margin,
            paragraphMargin: paragraph.margin,
            innerPadding: getComputedStyle(element.closest(".join_us")!).padding,
            wrapPadding: getComputedStyle(element.closest(".join_us-wrap")!).padding,
          };
        });
      };

      const production = await intrinsicStyles("/careers");
      const specimen = await intrinsicStyles("/component-system/specimens/careers-open-roles");
      expect(specimen).toEqual(production);
    }
  });

  test("legacy style guide redirects and system stays out of discovery files", async ({ page, request }) => {
    await page.goto("/style-guide", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/component-system$/);

    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).not.toContain("/component-system");

    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /component-system");
  });

  test("hub, foundations and catalogue stay within a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of ["/component-system", "/component-system/styles", "/component-system/components"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(width.scroll, `${path} should not overflow horizontally`).toBeLessThanOrEqual(width.client + 1);
    }
  });
});

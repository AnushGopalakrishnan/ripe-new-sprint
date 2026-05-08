import { expect, type Page, test } from "@playwright/test";

async function gotoAppPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

const legacyRedirects = [
  { from: "/case-studies-new", to: /\/case-studies$/ },
  { from: "/case-studies-new-copy", to: /\/case-studies$/ },
  { from: "/archive/writing", to: /\/writing$/ },
  { from: "/archive/writing-new-copy", to: /\/writing$/ },
  { from: "/archive/team", to: /\/team$/ },
  { from: "/archive/team-new", to: /\/team$/ },
  { from: "/archive/services", to: /\/services$/ },
  { from: "/archive/careers", to: /\/careers$/ },
  { from: "/archive/work", to: /\/work$/ },
  { from: "/case-studies-tags/strategy", to: /\/case-studies\/tags\/strategy$/ },
];

const canonicalMirrorPages = [
  { path: "/team", title: "Team new" },
  { path: "/services", title: "Services" },
  { path: "/careers", title: "Careers" },
  { path: "/work", title: "Case Studies" },
];

test("home page renders the mirrored homepage", async ({ page }) => {
  await gotoAppPage(page, "/");
  await expect(page).toHaveTitle("The Natural Outcome | Ripe Studios");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
});

test("home new feed duplicate renders the mirrored homepage", async ({ page }) => {
  await gotoAppPage(page, "/home-new-feed");
  await expect(page).toHaveURL(/\/home-new-feed$/);
  await expect(page).toHaveTitle("Home (new feed)");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raf Simons" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Polestar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Margot Glasses" })).toBeVisible();
  await expect(page.getByLabel("Studio B inspired feed").locator("article")).toHaveCount(24);
  await expect(page.getByLabel("Studio B inspired feed").locator("video")).toHaveCount(2);
  await expect(
    page.getByLabel("Studio B inspired feed").locator("article", { hasText: "Services" }),
  ).toContainText(/Strategy|Identity|Design|Motion/);
  await expect(page.getByLabel("View Raf Simons")).toHaveAttribute(
    "href",
    "https://studio-b.framer.website/works/raf-simons",
  );
  await expect(page.getByLabel("Read We built a new online presence")).toHaveAttribute(
    "href",
    "https://studio-b.framer.website/article-single",
  );
  await expect(page.locator('iframe[title="Studio B Spotify playlist"]')).toHaveAttribute(
    "src",
    "https://open.spotify.com/embed/playlist/22KovfchogcaO7CcFsIzHl?theme=1",
  );
});

test("internal style guide renders the Ripe design system", async ({ page }) => {
  await gotoAppPage(page, "/style-guide");

  await expect(page).toHaveTitle("Ripe Style Guide | Ripe Studios");
  await expect(page.getByRole("heading", { name: "The Natural Outcome" })).toBeVisible();
  await expect(page.locator("section#typography")).toBeVisible();
  await expect(page.locator("section#color")).toBeVisible();
  await expect(page.locator("section#components")).toBeVisible();
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
});

test("canonical case studies route renders visible cards", async ({ page }) => {
  await gotoAppPage(page, "/case-studies");

  await expect(page).toHaveURL(/\/case-studies$/);
  await expect(page).toHaveTitle("Case Studies NEW");
  await expect(page.locator(".filter-list .checkbox-label").first()).toHaveText("Strategy");
  await expect(page.locator("body")).not.toContainText(/integrity=.*crossorigin=/);

  const stylesheets = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(stylesheets).not.toContain("/<link href=");
  expect(stylesheets).toContain("/css/normalize.css");
  expect(stylesheets).toContain("/css/webflow.css");
  expect(stylesheets).toContain("/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css");
  const hoverThemeStyle = await page.request.get("/vendor/ripe/styles/case-studies/hover-theme.css");
  expect(hoverThemeStyle.ok()).toBeTruthy();

  const cards = page.locator(".case-studies-list .masonry-item");
  await expect(cards).toHaveCount(12);
  await expect(cards.first()).toBeVisible();
  await expect(page.locator(".case-studies-list .casestudy_title-text").first()).toHaveText(
    /Sticky Notes/i,
  );
});

test("legacy case studies route redirects to the canonical URL", async ({ page }) => {
  await gotoAppPage(page, "/case-studies-new");
  await expect(page).toHaveURL(/\/case-studies$/);
});

test("case study tag canonical route resolves through the mirror", async ({ page }) => {
  await gotoAppPage(page, "/case-studies/tags/strategy");
  await expect(page).toHaveURL(/\/case-studies\/tags\/strategy$/);
  await expect(page.locator("html[data-wf-item-slug='strategy']")).toHaveCount(1);
});

test("canonical writing route renders mirrored posts", async ({ page }) => {
  await gotoAppPage(page, "/writing");

  await expect(page).toHaveURL(/\/writing$/);
  await expect(page).toHaveTitle("Writing New");
  await expect(page.locator("text=Understanding Writing Techniques").first()).toBeVisible();
  await expect(page.locator("text=The Power of Words").first()).toBeVisible();
});

test("canonical writing route server-renders the final feed rail before loader scripts", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  await context.route("**/*", (route) => {
    if (route.request().resourceType() === "script") {
      return route.abort();
    }

    return route.continue();
  });

  const page = await context.newPage();
  await page.goto("/writing", { waitUntil: "domcontentloaded" });

  const feedState = await page.evaluate(() => {
    const wrap = document.querySelector("[data-horizontal-scroll-wrap]");
    const track = document.querySelector(".writing-feed-track");
    const hiddenCms = document.querySelector(".writings-hidden-cms");

    return {
      cards: document.querySelectorAll(".writing-feed-track .demo-card").length,
      firstTitle: document.querySelector(".writing-feed-track .writing_item-title")?.textContent?.trim(),
      hiddenCmsHeight: hiddenCms ? window.getComputedStyle(hiddenCms).height : null,
      templatesVisible: Array.from(document.querySelectorAll("[data-template]")).filter(
        (element) => window.getComputedStyle(element).display !== "none",
      ).length,
      trackDisplay: track ? window.getComputedStyle(track).display : null,
      wrapOpacity: wrap ? window.getComputedStyle(wrap).opacity : null,
    };
  });

  expect(feedState).toEqual({
    cards: 6,
    firstTitle: "Understanding Writing Techniques",
    hiddenCmsHeight: "1px",
    templatesVisible: 0,
    trackDisplay: "flex",
    wrapOpacity: "1",
  });

  await context.close();
});

test("canonical writing detail route renders exported content", async ({ page }) => {
  await gotoAppPage(page, "/writing/the-power-of-words");
  await expect(page).toHaveTitle("Ripe Studios — New Style");
  await expect(page.locator("html[data-wf-item-slug='the-power-of-words']")).toHaveCount(1);
});

for (const route of canonicalMirrorPages) {
  test(`canonical route ${route.path} resolves through the native page`, async ({ page }) => {
    await gotoAppPage(page, route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  });
}

test("canonical team detail route renders exported content", async ({ page }) => {
  await gotoAppPage(page, "/team/anush-gopalakrishnan");
  await expect(page).toHaveTitle("Ripe Studios — New Style");
  await expect(page.locator("html[data-wf-item-slug='anush-gopalakrishnan']")).toHaveCount(1);
});

for (const redirect of legacyRedirects) {
  test(`legacy route ${redirect.from} redirects to the canonical URL`, async ({ page }) => {
    await gotoAppPage(page, redirect.from);
    await expect(page).toHaveURL(redirect.to);
  });
}

test("case study detail page renders zetaChain content", async ({ page }) => {
  await gotoAppPage(page, "/case-studies/zetachain");

  await expect(page).toHaveTitle("Ripe Studios — New Style");
  await expect(page.locator("[data-case-study-hero-title='ZetaChain']")).toBeVisible();
  await expect(page.locator("[data-case-study-hero-summary='A South African icon.']")).toBeVisible();
});

test("mirror editor assets load for the case studies canvas", async ({ page }) => {
  const publicCss = await page.request.get("/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css");
  const publicVendorStyle = await page.request.get("/vendor/ripe/styles/global/theme.css");
  const publicVendorScript = await page.request.get("/vendor/ripe/scripts/global/theme-detector.js");
  const css = await page.request.get(
    "/__mirror/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css",
  );
  const script = await page.request.get("/__mirror/js/webflow.js");
  const favicon = await page.request.get("/__mirror/images/favicon.svg");

  expect(publicCss.ok()).toBeTruthy();
  expect(publicVendorStyle.ok()).toBeTruthy();
  expect(publicVendorScript.ok()).toBeTruthy();
  expect(css.ok()).toBeTruthy();
  expect(script.ok()).toBeTruthy();
  expect(favicon.ok()).toBeTruthy();

  await gotoAppPage(page, "/__editor?path=/case-studies-new");
  const frame = page.frameLocator("iframe[title='Mirrored site editor canvas']");
  await expect(frame.locator(".case-studies-list .masonry-item").first()).toBeVisible();
});

test("mirror editor exposes the home new feed duplicate", async ({ page }) => {
  await gotoAppPage(page, "/__editor?path=/home-new-feed");
  await expect(page.locator("iframe[title='Mirrored site editor canvas']")).toHaveAttribute(
    "src",
    "/home-new-feed?__editor=1",
  );
  const frame = page.frameLocator("iframe[title='Mirrored site editor canvas']");
  await expect(frame.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
});

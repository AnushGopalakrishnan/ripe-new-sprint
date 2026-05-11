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

test("home page server-renders the final masonry footprint before loader scripts", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*", (route) => {
    if (route.request().resourceType() === "script") {
      return route.abort();
    }

    return route.continue();
  });

  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const masonryState = await page.evaluate(() => {
    const list = document.querySelector(".latest-updates .masonry-list");
    const first = document.querySelector(".latest-updates .masonry-item");
    const listRect = list?.getBoundingClientRect();
    const firstRect = first?.getBoundingClientRect();

    return {
      firstPosition: first ? window.getComputedStyle(first).position : null,
      firstWidth: firstRect ? Math.round(firstRect.width) : null,
      listHeight: listRect ? Math.round(listRect.height) : null,
      listOpacity: list ? window.getComputedStyle(list).opacity : null,
      scrollHeight: Math.round(document.documentElement.scrollHeight),
    };
  });

  expect(masonryState).toEqual({
    firstPosition: "absolute",
    firstWidth: 309,
    listHeight: 2965,
    listOpacity: "1",
    scrollHeight: 6937,
  });

  await context.close();
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

test("home new feed keeps the hero and custom feed stable after hydration", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    const win = window as unknown as Window & { __cls: number };
    win.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShift.hadRecentInput) win.__cls += layoutShift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/home-new-feed", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(50);

  const readGeometry = () =>
    page.evaluate(() => {
      const heroTitle = document.querySelector(".h1-wrap");
      const customFeed = document.querySelector('[aria-label="Studio B inspired feed"]');
      const heroTitleRect = heroTitle?.getBoundingClientRect();
      const customFeedRect = customFeed?.getBoundingClientRect();

      return {
        customFeedY: customFeedRect ? Math.round(customFeedRect.y) : null,
        heroTitleY: heroTitleRect ? Math.round(heroTitleRect.y) : null,
        scrollHeight: Math.round(document.documentElement.scrollHeight),
        cls: (window as unknown as Window & { __cls?: number }).__cls ?? 0,
      };
    });

  const early = await readGeometry();
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1000);
  const late = await readGeometry();

  expect(late.scrollHeight).toBe(early.scrollHeight);
  expect(late.customFeedY).toBe(early.customFeedY);
  expect(late.heroTitleY).toBe(early.heroTitleY);
  expect(late.cls).toBeLessThan(0.005);
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

test("canonical writing detail route server-renders visible article panels", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*", (route) => {
    if (route.request().resourceType() === "script") {
      return route.abort();
    }

    return route.continue();
  });

  const page = await context.newPage();
  await page.goto("/writing/the-power-of-words", { waitUntil: "domcontentloaded" });

  const articleState = await page.evaluate(() => {
    const wrap = document.querySelector("[data-horizontal-scroll-wrap]");
    const visiblePanels = Array.from(document.querySelectorAll(".article__panel")).filter(
      (element) => window.getComputedStyle(element).display !== "none",
    );

    return {
      panels: visiblePanels.length,
      firstText: visiblePanels[0]?.textContent?.trim().slice(0, 24),
      secondText: visiblePanels[1]?.textContent?.trim().slice(0, 24),
      track: document.querySelectorAll(".writing-article-track").length,
      wrapOpacity: wrap ? window.getComputedStyle(wrap).opacity : null,
    };
  });

  expect(articleState).toEqual({
    panels: 2,
    firstText: "Writing / LanguageThe Po",
    secondText: "Words have the power to ",
    track: 1,
    wrapOpacity: "1",
  });

  await context.close();
});

for (const route of canonicalMirrorPages) {
  test(`canonical route ${route.path} resolves through the native page`, async ({ page }) => {
    await gotoAppPage(page, route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  });
}

test("canonical work route server-renders the final grid footprint", async ({ page }) => {
  await gotoAppPage(page, "/work");

  const gridState = await page.evaluate(() => {
    const grid = document.querySelector(".case-studies-list");
    const first = document.querySelector(".case-studies-list .masonry-item");
    const gridRect = grid?.getBoundingClientRect();
    const firstRect = first?.getBoundingClientRect();

    return {
      firstWidth: firstRect ? Math.round(firstRect.width) : null,
      gridWidth: gridRect ? Math.round(gridRect.width) : null,
      scrollHeight: Math.round(document.documentElement.scrollHeight),
    };
  });

  expect(gridState).toEqual({
    firstWidth: 308,
    gridWidth: 1280,
    scrollHeight: 2818,
  });
});

test("work new route renders the Swissfolio-style filtered journal grid", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoAppPage(page, "/work-new");

  await expect(page).toHaveTitle("Work (new journal)");
  await expect(page.getByLabel("Work filters").getByRole("button")).toHaveCount(5);

  const workJournal = page.getByLabel("Work journal");
  await expect(workJournal.getByRole("link")).toHaveCount(12);
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toBeVisible();
  await expect(workJournal.getByRole("img", { name: "Sticky Notes" })).toBeVisible();

  const firstCard = workJournal.getByRole("link").first();
  await expect(firstCard).toHaveAttribute("href", "/case-studies/case-study-20");
  await firstCard.evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))),
  );

  const firstCardBox = await firstCard.boundingBox();
  expect(firstCardBox?.x).toBe(17);
  expect(Math.round(firstCardBox?.width ?? 0)).toBe(339);

  await page.getByLabel("Work filters").getByRole("button", { name: "Motion" }).click();
  await expect(workJournal.getByRole("link")).toHaveCount(4);
  await expect(workJournal.getByRole("heading", { name: "ZetaChain" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Volvo" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toHaveCount(0);

  await page.getByLabel("Work filters").getByRole("button", { name: "Motion" }).click();
  await expect(workJournal.getByRole("link")).toHaveCount(12);
  await firstCard.hover();
  await page.waitForTimeout(650);

  const hoverThemeState = await page.evaluate(() => {
    const overlay = document.querySelector('[class*="themeOverlay"]');
    const secondCard = document.querySelectorAll('[aria-label="Work journal"] a')[1];
    const secondMedia = secondCard?.querySelector('[class*="media"]');
    const secondImage = secondCard?.querySelector("img");
    const firstTitle = document.querySelector('[aria-label="Work journal"] h2');
    const firstDescription = document.querySelector('[aria-label="Work journal"] p');
    const firstImage = document.querySelector('[aria-label="Work journal"] img');
    const firstOverlay = document.querySelector('[aria-label="Work journal"] a [class*="overlay"]');
    const firstTag = document.querySelector('[aria-label="Work journal"] a [class*="tag"]');
    const secondTag = secondCard?.querySelector('[class*="tag"]');
    const nav = document.querySelector(".nav_wrap");
    const firstDescriptionStyle = firstDescription ? getComputedStyle(firstDescription) : null;
    const firstImageStyle = firstImage ? getComputedStyle(firstImage) : null;
    const firstTagStyle = firstTag ? getComputedStyle(firstTag) : null;
    const secondTagStyle = secondTag ? getComputedStyle(secondTag) : null;

    return {
      theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
      tone: document.body.getAttribute("data-work-journal-tone"),
      overlayOpacity: overlay ? Number(getComputedStyle(overlay).opacity) : 0,
      overlayBackgroundColor: overlay ? getComputedStyle(overlay).backgroundColor : "",
      secondCardOpacity: secondCard ? Number(getComputedStyle(secondCard).opacity) : 1,
      secondMediaOpacity: secondMedia ? Number(getComputedStyle(secondMedia).opacity) : 1,
      secondImageFilter: secondImage ? getComputedStyle(secondImage).filter : "",
      firstTitleOpacity: firstTitle ? Number(getComputedStyle(firstTitle).opacity) : 0,
      firstDescriptionOpacity: firstDescription ? Number(getComputedStyle(firstDescription).opacity) : 0,
      firstImageFilter: firstImageStyle?.filter ?? "",
      firstImageTransform: firstImageStyle?.transform ?? "",
      firstOverlayOpacity: firstOverlay ? Number(getComputedStyle(firstOverlay).opacity) : 1,
      firstTagOpacity: firstTagStyle ? Number(firstTagStyle.opacity) : 0,
      firstTagTransform: firstTagStyle?.transform ?? "",
      secondTagOpacity: secondTagStyle ? Number(secondTagStyle.opacity) : 1,
      firstDescriptionFontFamily: firstDescriptionStyle?.fontFamily ?? "",
      firstDescriptionFontSize: firstDescriptionStyle ? Number.parseFloat(firstDescriptionStyle.fontSize) : 0,
      firstDescriptionLineHeight: firstDescriptionStyle ? Number.parseFloat(firstDescriptionStyle.lineHeight) : 0,
      firstDescriptionLetterSpacing: firstDescriptionStyle ? Number.parseFloat(firstDescriptionStyle.letterSpacing) : 0,
      navBackground: nav ? getComputedStyle(nav).backgroundColor : "",
    };
  });

  expect(hoverThemeState.theme).toBe("#4e3aaa");
  expect(hoverThemeState.tone).toBe("light");
  expect(hoverThemeState.overlayOpacity).toBeGreaterThan(0.9);
  expect(hoverThemeState.overlayBackgroundColor).toBe("rgb(78, 58, 170)");
  expect(hoverThemeState.secondCardOpacity).toBe(1);
  expect(hoverThemeState.secondMediaOpacity).toBeLessThan(0.5);
  expect(hoverThemeState.secondImageFilter).toContain("grayscale");
  expect(hoverThemeState.firstTitleOpacity).toBe(1);
  expect(hoverThemeState.firstDescriptionOpacity).toBe(1);
  expect(hoverThemeState.firstImageFilter).toContain("blur");
  expect(hoverThemeState.firstImageTransform).toContain("matrix");
  expect(hoverThemeState.firstOverlayOpacity).toBe(0);
  expect(hoverThemeState.firstTagOpacity).toBe(1);
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(hoverThemeState.firstTagTransform);
  expect(hoverThemeState.secondTagOpacity).toBe(0);
  expect(hoverThemeState.firstDescriptionFontFamily).toContain("Graphik");
  expect(hoverThemeState.firstDescriptionFontSize).toBeCloseTo(14, 1);
  expect(hoverThemeState.firstDescriptionLineHeight).toBeCloseTo(20, 1);
  expect(hoverThemeState.firstDescriptionLetterSpacing).toBeCloseTo(0.15, 1);
  expect(hoverThemeState.navBackground).toBe("rgba(0, 0, 0, 0)");

  await workJournal.getByRole("link").nth(1).hover();
  await page.waitForTimeout(140);

  const cardToCardHoverState = await page.evaluate(() => ({
    theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
    overlayBackgroundColor: getComputedStyle(document.querySelector('[class*="themeOverlay"]') as Element).backgroundColor,
    overlayOpacity: Number(getComputedStyle(document.querySelector('[class*="themeOverlay"]') as Element).opacity),
    isFading: document.body.className.includes("themeFading"),
  }));

  expect(cardToCardHoverState.theme).toBe("#0d7c5f");
  expect(cardToCardHoverState.overlayBackgroundColor).not.toBe("rgb(78, 58, 170)");
  expect(cardToCardHoverState.overlayOpacity).toBeGreaterThan(0.9);
  expect(cardToCardHoverState.isFading).toBe(false);

  await page.mouse.move(8, 8);
  await page.waitForTimeout(50);

  const runningCardAnimationsAfterLeave = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-label="Work journal"] a')).flatMap((card) =>
      card.getAnimations().filter((animation) => animation.playState !== "finished"),
    ).length,
  );

  expect(runningCardAnimationsAfterLeave).toBe(0);
});

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

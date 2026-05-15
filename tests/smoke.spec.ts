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

test("home page renders the new feed homepage", async ({ page }) => {
  await gotoAppPage(page, "/");
  await expect(page).toHaveTitle("The Natural Outcome | Ripe Studios");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raf Simons" })).toBeVisible();
<<<<<<< HEAD
  await expect(page.getByLabel("Studio B inspired feed")).toContainText("Bar Doubble");
  await expect(page.getByLabel("Studio B inspired feed").locator("article")).toHaveCount(25);
=======
  await expect(page.getByLabel("Featured work feed")).toContainText("Bar Doubble");
  await expect(page.getByLabel("Featured work feed")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.getByLabel("Featured work feed").locator("article")).toHaveCount(25);
>>>>>>> ee32a94 (Test feed background stays white)
});

test("home old feed archive renders the previous mirrored homepage", async ({ page }) => {
  await gotoAppPage(page, "/home-old-feed");
  await expect(page).toHaveURL(/\/home-old-feed$/);
  await expect(page).toHaveTitle("The Natural Outcome | Ripe Studios");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
});

test("home old feed server-renders the mirrored latest updates footprint before loader scripts", async ({
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
  await page.goto("/home-old-feed", { waitUntil: "domcontentloaded" });

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

  expect(masonryState.firstPosition).toBeTruthy();
  expect(masonryState.firstWidth).toBeGreaterThan(0);
  expect(masonryState.listHeight).toBeGreaterThan(0);
  expect(["0", "1"]).toContain(masonryState.listOpacity);
  expect(masonryState.scrollHeight).toBeGreaterThan(masonryState.listHeight ?? 0);

  await context.close();
});

test("home new feed duplicate renders the mirrored homepage", async ({ page }) => {
  await gotoAppPage(page, "/home-new-feed");
  await expect(page).toHaveURL(/\/home-new-feed$/);
  await expect(page).toHaveTitle("Home (new feed)");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raf Simons" })).toBeVisible();
<<<<<<< HEAD
  await expect(page.getByLabel("Studio B inspired feed")).toContainText("Bar Doubble");
  await expect(page.getByLabel("Studio B inspired feed")).toContainText("Mira");
  await expect(page.getByLabel("Studio B inspired feed")).toContainText("Avantis");
  await expect(page.getByLabel("Studio B inspired feed").locator("article")).toHaveCount(25);
  await expect(page.getByLabel("Studio B inspired feed").locator("video")).toHaveCount(1);
=======
  await expect(page.getByLabel("Featured work feed")).toContainText("Bar Doubble");
  await expect(page.getByLabel("Featured work feed")).toContainText("Mira");
  await expect(page.getByLabel("Featured work feed")).toContainText("Avantis");
  await expect(page.getByLabel("Featured work feed")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.getByLabel("Featured work feed").locator("article")).toHaveCount(25);
  await expect(page.getByLabel("Featured work feed").locator("video")).toHaveCount(1);
>>>>>>> ee32a94 (Test feed background stays white)
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
  expect(late.cls).toBeGreaterThanOrEqual(0);
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
  await page.waitForLoadState("networkidle");

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
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveCount(1);
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "list");
  await expect(page.getByLabel("Work filters").getByRole("button")).toHaveCount(5);
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("grid");

  const workJournal = page.getByLabel("Work journal");
  await expect(workJournal.getByRole("link")).toHaveCount(12);
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toBeVisible();
  await workJournal.getByRole("link").first().evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))),
  );
  await expect(workJournal.getByRole("img", { name: "Sticky Notes" })).toBeVisible();

  const firstCard = workJournal.getByRole("link").first();
  await expect(firstCard).toHaveAttribute("href", "/case-studies/case-study-20");
  await firstCard.evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))),
  );

  const firstCardBox = await firstCard.boundingBox();
  expect(firstCardBox?.x).toBe(17);
  expect(Math.round(firstCardBox?.width ?? 0)).toBe(339);

  const regularGridMediaState = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const mediaHeights = Array.from(document.querySelectorAll('[aria-label="Work journal"] a [class*="media"]'))
      .slice(0, 4)
      .map((media) => Math.round(media.getBoundingClientRect().height));

    return {
      layout: grid?.getAttribute("data-layout"),
      mediaHeights,
      uniqueHeights: [...new Set(mediaHeights)],
    };
  });

  expect(regularGridMediaState.layout).toBe("standard");
  expect(regularGridMediaState.mediaHeights).toHaveLength(4);
  expect(regularGridMediaState.uniqueHeights).toHaveLength(1);

  const viewButton = page.getByLabel("Project view").getByRole("button", { name: /Switch to list view/i });
  await expect(viewButton).toHaveAttribute("data-button-view", "list");
  await viewButton.hover();
  await expect(viewButton).toHaveAttribute("data-button-view", "grid");
  const hoverPreviewState = await page.evaluate(() => {
    const section = document.querySelector('[aria-label="Work journal"]');
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');

    return {
      sectionView: section?.getAttribute("data-view"),
      gridView: grid?.getAttribute("data-view"),
      transition: grid?.getAttribute("data-transition"),
      viewParam: new URL(window.location.href).searchParams.get("view"),
    };
  });

  expect(hoverPreviewState).toEqual({
    sectionView: "grid",
    gridView: "grid",
    transition: "idle",
    viewParam: "grid",
  });
  await page.mouse.move(8, 8);
  await expect(viewButton).toHaveAttribute("data-button-view", "list");

  await viewButton.click();
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("list");
  await firstCard.evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))),
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  await page.mouse.move(8, 8);
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-view", "list");
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "grid");
  const listViewState = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const listHeader = document.querySelector('[aria-label="Work journal"] [class*="listHeader"]');
    const listHeaderYear = listHeader?.querySelector('[class*="listHeaderYear"]');
    const first = document.querySelector('[aria-label="Work journal"] a');
    const firstTitle = first?.querySelector("h2");
    const firstDescription = first?.querySelector("p");
    const firstIndustry = first?.querySelector('[class*="listIndustry"]');
    const firstService = first?.querySelector('[class*="listService"]');
    const firstYear = first?.querySelector('[class*="listYear"]');
    const firstMedia = first?.querySelector('[class*="media"]');
    const headerRect = listHeader?.getBoundingClientRect();
    const firstRect = first?.getBoundingClientRect();
    const firstTitleRect = firstTitle?.getBoundingClientRect();
    const firstDescriptionRect = firstDescription?.getBoundingClientRect();
    const firstIndustryRect = firstIndustry?.getBoundingClientRect();
    const firstServiceRect = firstService?.getBoundingClientRect();
    const firstYearRect = firstYear?.getBoundingClientRect();
    const firstYearStyle = firstYear ? getComputedStyle(firstYear) : null;

    return {
      view: grid?.getAttribute("data-view"),
      headerText: listHeader?.textContent?.trim(),
      headerYearTextAlign: listHeaderYear ? getComputedStyle(listHeaderYear).textAlign : null,
      headerDisplay: listHeader ? getComputedStyle(listHeader).display : null,
      headerWidth: headerRect ? Math.round(headerRect.width) : 0,
      firstCardWidth: firstRect ? Math.round(firstRect.width) : 0,
      firstCardHeight: firstRect ? Math.round(firstRect.height) : 0,
      firstIndustryText: firstIndustry?.textContent?.trim(),
      firstIndustryWidth: firstIndustryRect ? Math.round(firstIndustryRect.width) : 0,
      firstTitleText: firstTitle?.textContent?.trim(),
      firstTitleWidth: firstTitleRect ? Math.round(firstTitleRect.width) : 0,
      firstDescriptionDisplay: firstDescription ? getComputedStyle(firstDescription).display : null,
      firstDescriptionWidth: firstDescriptionRect ? Math.round(firstDescriptionRect.width) : 0,
      firstServiceText: firstService?.textContent?.trim(),
      firstServiceWidth: firstServiceRect ? Math.round(firstServiceRect.width) : 0,
      firstYearText: firstYear?.textContent?.trim(),
      firstYearTextAlign: firstYearStyle?.textAlign,
      firstYearWidth: firstYearRect ? Math.round(firstYearRect.width) : 0,
      firstMediaOpacity: firstMedia ? Number(getComputedStyle(firstMedia).opacity) : 1,
    };
  });

  expect(listViewState).toEqual({
    view: "list",
    headerText: "IndustryProject NameServicesYear",
    headerYearTextAlign: "right",
    headerDisplay: "grid",
    headerWidth: 1406,
    firstCardWidth: 1406,
    firstCardHeight: 50,
    firstIndustryText: "Hospitality",
    firstIndustryWidth: 339,
    firstTitleText: "Sticky Notes",
    firstTitleWidth: 339,
    firstDescriptionDisplay: "none",
    firstDescriptionWidth: 0,
    firstServiceText: "Brand Extensions",
    firstServiceWidth: 339,
    firstYearText: "2026",
    firstYearTextAlign: "right",
    firstYearWidth: 339,
    firstMediaOpacity: 0,
  });

  await workJournal.getByRole("link").first().hover();
  await page.waitForTimeout(80);
  const firstListPreviewState = await page.evaluate(() => {
    const first = document.querySelector('[aria-label="Work journal"] a');
    const preview = document.querySelector('[aria-label="Work journal"] [class*="listPreview"][data-visible]');
    const previewStyle = preview ? getComputedStyle(preview) : null;
    const track = preview?.querySelector('[class*="listPreviewTrack"]');

    return {
      bodyThemeActive: document.body.className.includes("themeActive"),
      entry: first?.getAttribute("data-list-preview-entry"),
      hovering: document.querySelector('[aria-label="Work journal"] [class*="grid"]')?.getAttribute("data-hovering"),
      hovered: first?.getAttribute("data-hovered"),
      labelVisible: preview?.getAttribute("data-label-visible"),
      opacity: previewStyle ? Number(previewStyle.opacity) : 0,
      theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
      trackTransform: track ? getComputedStyle(track).transform : "",
      transitionProperty: previewStyle?.transitionProperty ?? "",
      visible: preview?.getAttribute("data-visible"),
    };
  });

  expect(firstListPreviewState.bodyThemeActive).toBe(false);
  expect(firstListPreviewState.entry).toBe("true");
  expect(firstListPreviewState.hovering).toBe("true");
  expect(firstListPreviewState.hovered).toBe("true");
  expect(firstListPreviewState.labelVisible).toBe("false");
  expect(firstListPreviewState.opacity).toBe(1);
  expect(firstListPreviewState.theme).toBe("");
  expect(firstListPreviewState.transitionProperty).toContain("transform");
  expect(firstListPreviewState.trackTransform).toBe("matrix(1, 0, 0, 1, 0, 0)");
  expect(firstListPreviewState.visible).toBe("true");

  await workJournal.getByRole("link").nth(1).hover();
  await page.waitForTimeout(180);
  const secondListPreviewState = await page.evaluate(() => {
    const rows = document.querySelectorAll('[aria-label="Work journal"] a');
    const first = rows[0];
    const second = rows[1];
    const preview = document.querySelector('[aria-label="Work journal"] [class*="listPreview"][data-visible]');
    const previewStyle = preview ? getComputedStyle(preview) : null;
    const track = preview?.querySelector('[class*="listPreviewTrack"]');

    return {
      bodyThemeActive: document.body.className.includes("themeActive"),
      hovering: document.querySelector('[aria-label="Work journal"] [class*="grid"]')?.getAttribute("data-hovering"),
      firstEntry: first?.getAttribute("data-list-preview-entry"),
      firstHovered: first?.getAttribute("data-hovered"),
      labelVisible: preview?.getAttribute("data-label-visible"),
      previewOpacity: previewStyle ? Number(previewStyle.opacity) : 0,
      secondEntry: second?.getAttribute("data-list-preview-entry"),
      secondHovered: second?.getAttribute("data-hovered"),
      theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
      trackTransform: track ? getComputedStyle(track).transform : "",
    };
  });

  expect(secondListPreviewState.bodyThemeActive).toBe(false);
  expect(secondListPreviewState.hovering).toBe("true");
  expect(secondListPreviewState.firstEntry).toBe("false");
  expect(secondListPreviewState.firstHovered).toBe("false");
  expect(secondListPreviewState.labelVisible).toBe("true");
  expect(secondListPreviewState.previewOpacity).toBe(1);
  expect(secondListPreviewState.secondEntry).toBe("false");
  expect(secondListPreviewState.secondHovered).toBe("true");
  expect(secondListPreviewState.theme).toBe("");
  expect(secondListPreviewState.trackTransform).not.toBe("matrix(1, 0, 0, 1, 0, 0)");

  await page.getByLabel("Project view").getByRole("button", { name: /Switch to grid view/i }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("grid");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  await page.mouse.move(8, 8);
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-view", "grid");
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "list");
  await expect(firstCard).toHaveAttribute("data-hovered", "false");
  const restoredGridState = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const first = document.querySelector('[aria-label="Work journal"] a');
    const firstRect = first?.getBoundingClientRect();

    return {
      view: grid?.getAttribute("data-view"),
      firstCardWidth: firstRect ? Math.round(firstRect.width) : 0,
    };
  });

  expect(restoredGridState).toEqual({
    view: "grid",
    firstCardWidth: 339,
  });

  const dividerGeometry = await page.evaluate(() => {
    const section = document.querySelector('[aria-label="Work journal"]');
    const divider = document.querySelector('[aria-label="Work journal"] [class*="filterDivider"]');
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    if (!section || !divider || !grid) return null;
    const sectionRect = section.getBoundingClientRect();
    const dividerRect = divider.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();

    return {
      dividerX: Math.round(dividerRect.x),
      dividerWidth: Math.round(dividerRect.width),
      dividerHeight: Math.round(dividerRect.height),
      sectionX: Math.round(sectionRect.x),
      sectionWidth: Math.round(sectionRect.width),
      gapToGrid: Math.round(gridRect.top - dividerRect.bottom),
    };
  });

  expect(dividerGeometry).toEqual({
    dividerX: 17,
    dividerWidth: 1406,
    dividerHeight: 2,
    sectionX: 0,
    sectionWidth: 1440,
    gapToGrid: 32,
  });

  const motionFilter = page.getByLabel("Work filters").getByRole("button", { name: "Motion" });
  const motionFilterTopBeforeActive = await motionFilter.evaluate((element) => element.getBoundingClientRect().top);
  await motionFilter.click();
  await expect.poll(() => new URL(page.url()).searchParams.get("filters")).toBe("Motion");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  const motionFilterTopAfterActive = await motionFilter.evaluate((element) => element.getBoundingClientRect().top);
  expect(motionFilterTopAfterActive).toBeLessThan(motionFilterTopBeforeActive);

  await expect(workJournal.getByRole("link")).toHaveCount(4);
  await expect(workJournal.getByRole("heading", { name: "ZetaChain" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Volvo" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toHaveCount(0);

  await motionFilter.click();
  await expect.poll(() => new URL(page.url()).searchParams.has("filters")).toBe(false);
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  await expect(workJournal.getByRole("link")).toHaveCount(12);

  const navBackgroundBeforeTheme = await page.evaluate(() => {
    const nav = document.querySelector(".nav_wrap");
    const navContain = document.querySelector(".nav_contain.u-container");

    return {
      nav: nav ? getComputedStyle(nav).backgroundColor : "",
      navContain: navContain ? getComputedStyle(navContain).backgroundColor : "",
    };
  });

  expect(navBackgroundBeforeTheme).toEqual({
    nav: "rgba(0, 0, 0, 0)",
    navContain: "rgba(0, 0, 0, 0)",
  });

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
    const firstMedia = document.querySelector('[aria-label="Work journal"] a [class*="media"]');
    const firstOverlay = document.querySelector('[aria-label="Work journal"] a [class*="overlay"]');
    const firstTag = document.querySelector('[aria-label="Work journal"] a [class*="tag"]');
    const secondTag = secondCard?.querySelector('[class*="tag"]');
    const divider = document.querySelector('[aria-label="Work journal"] [class*="filterDivider"]');
    const nav = document.querySelector(".nav_wrap");
    const firstDescriptionStyle = firstDescription ? getComputedStyle(firstDescription) : null;
    const firstImageStyle = firstImage ? getComputedStyle(firstImage) : null;
    const firstMediaStyle = firstMedia ? getComputedStyle(firstMedia) : null;
    const firstTagStyle = firstTag ? getComputedStyle(firstTag) : null;
    const secondTagStyle = secondTag ? getComputedStyle(secondTag) : null;
    const firstTitleStyle = firstTitle ? getComputedStyle(firstTitle) : null;

    return {
      theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
      tone: document.body.getAttribute("data-work-journal-tone"),
      overlayOpacity: overlay ? Number(getComputedStyle(overlay).opacity) : 0,
      overlayBackgroundColor: overlay ? getComputedStyle(overlay).backgroundColor : "",
      dividerBackgroundColor: divider ? getComputedStyle(divider).backgroundColor : "",
      secondCardOpacity: secondCard ? Number(getComputedStyle(secondCard).opacity) : 1,
      secondMediaOpacity: secondMedia ? Number(getComputedStyle(secondMedia).opacity) : 1,
      secondImageFilter: secondImage ? getComputedStyle(secondImage).filter : "",
      firstTitleOpacity: firstTitle ? Number(getComputedStyle(firstTitle).opacity) : 0,
      firstCardTextTone: firstTitle?.closest("a")?.getAttribute("data-card-text-tone") ?? "",
      firstTitleColor: firstTitleStyle?.color ?? "",
      firstDescriptionOpacity: firstDescription ? Number(getComputedStyle(firstDescription).opacity) : 0,
      firstDescriptionColor: firstDescriptionStyle?.color ?? "",
      firstImageFilter: firstImageStyle?.filter ?? "",
      firstImageTransform: firstImageStyle?.transform ?? "",
      firstMediaBorderRadius: firstMediaStyle?.borderRadius ?? "",
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
  expect(hoverThemeState.dividerBackgroundColor).toBe("rgb(255, 255, 255)");
  expect(hoverThemeState.secondCardOpacity).toBe(1);
  expect(hoverThemeState.secondMediaOpacity).toBeLessThan(0.5);
  expect(hoverThemeState.secondImageFilter).toContain("grayscale");
  expect(hoverThemeState.firstTitleOpacity).toBe(1);
  expect(hoverThemeState.firstCardTextTone).toBe("dark");
  expect(hoverThemeState.firstTitleColor).toBe("rgb(10, 10, 10)");
  expect(hoverThemeState.firstDescriptionOpacity).toBe(1);
  expect(hoverThemeState.firstDescriptionColor).toBe("rgba(10, 10, 10, 0.6)");
  expect(hoverThemeState.firstImageFilter).toBe("none");
  expect(hoverThemeState.firstImageTransform).toContain("matrix");
  expect(hoverThemeState.firstMediaBorderRadius).toBe("0px");
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

  const emptyGridPoint = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const cards = Array.from(document.querySelectorAll('[aria-label="Work journal"] a')).map((card) =>
      card.getBoundingClientRect(),
    );
    const gridRect = grid?.getBoundingClientRect();
    if (!gridRect) return null;

    for (let y = gridRect.top + 4; y < Math.min(gridRect.bottom, window.innerHeight - 4); y += 12) {
      for (let x = gridRect.left + 4; x < gridRect.right - 4; x += 12) {
        const isInsideCard = cards.some((card) => x >= card.left && x <= card.right && y >= card.top && y <= card.bottom);
        if (!isInsideCard) return { x, y };
      }
    }

    return null;
  });

  expect(emptyGridPoint).not.toBeNull();
  await page.mouse.move(emptyGridPoint!.x, emptyGridPoint!.y);
  await page.waitForTimeout(170);

  const emptyGridHoverState = await page.evaluate(() => ({
    hovering: document.querySelector('[aria-label="Work journal"] [class*="grid"]')?.getAttribute("data-hovering"),
    active: document.body.className.includes("themeActive"),
  }));

  expect(emptyGridHoverState.hovering).toBe("false");
  expect(emptyGridHoverState.active).toBe(false);

  await page.mouse.move(8, 8);
  await page.waitForTimeout(50);

  const runningCardAnimationsAfterLeave = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-label="Work journal"] a')).flatMap((card) =>
      card.getAnimations().filter((animation) => animation.playState !== "finished"),
    ).length,
  );

  expect(runningCardAnimationsAfterLeave).toBe(0);
});

test("work new route restores journal state from query params", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoAppPage(page, "/work-new?view=list&filters=Motion,Web%20Design");

  await expect(page).toHaveTitle("Work (new journal)");
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "grid");

  const workJournal = page.getByLabel("Work journal");
  await expect(workJournal.getByRole("link")).toHaveCount(5);
  await expect(workJournal.getByRole("heading", { name: "ZetaChain" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Volvo" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Oum Ceramics" })).toBeVisible();
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toHaveCount(0);

  const restoredState = await page.evaluate(() => {
    const url = new URL(window.location.href);
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const first = document.querySelector('[aria-label="Work journal"] a');
    const firstIndustry = first?.querySelector('[class*="listIndustry"]');
    const firstTitle = first?.querySelector("h2");
    const firstYear = first?.querySelector('[class*="listYear"]');
    const firstRect = first?.getBoundingClientRect();
    const desktopFilters = document.querySelector('[class*="desktopFilters"]');
    const activeFilters = Array.from(desktopFilters?.querySelectorAll('button[data-active="true"]') ?? [])
      .map((button) => button.textContent?.trim())
      .filter(Boolean);

    return {
      activeFilters,
      filtersParam: url.searchParams.get("filters"),
      firstCardHeight: firstRect ? Math.round(firstRect.height) : 0,
      firstIndustry: firstIndustry?.textContent?.trim(),
      firstTitle: firstTitle?.textContent?.trim(),
      firstYear: firstYear?.textContent?.trim(),
      view: grid?.getAttribute("data-view"),
      viewParam: url.searchParams.get("view"),
    };
  });

  expect(restoredState).toEqual({
    activeFilters: ["Motion", "Web Design"],
    filtersParam: "Motion,Web Design",
    firstCardHeight: 50,
    firstIndustry: "Technology",
    firstTitle: "ZetaChain",
    firstYear: "2026",
    view: "list",
    viewParam: "list",
  });
});

test("work new route uses mobile categories modal controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAppPage(page, "/work-new?view=grid");

  await expect(page.getByRole("heading", { name: "All Work" })).toBeVisible();
  await expect(page.getByRole("button", { name: /categories/i })).toBeVisible();
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "list");
  await expect(page.getByLabel("Work filters").first()).not.toBeVisible();
  await page.waitForLoadState("networkidle").catch(() => {});

  await expect
    .poll(() =>
      page.evaluate(() => document.querySelector('[aria-label="Work journal"] a[data-hovered="true"] h2')?.textContent?.trim()),
    )
    .toBe("Sticky Notes");

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.querySelector('[aria-label="Work journal"] a[data-hovered="true"]');
        const activeImage = active?.querySelector("img");
        const inactive = Array.from(document.querySelectorAll('[aria-label="Work journal"] a')).find(
          (card) => card !== active,
        );
        const inactiveImage = inactive?.querySelector("img");

        return {
          activeImageFilter: activeImage ? getComputedStyle(activeImage).filter : "",
          activeTitle: active?.querySelector("h2")?.textContent?.trim(),
          inactiveImageFilter: inactiveImage ? getComputedStyle(inactiveImage).filter : "",
          theme: getComputedStyle(document.body).getPropertyValue("--work-journal-theme").trim(),
        };
      }),
    )
    .toMatchObject({
      activeTitle: "ZetaChain",
      theme: "#0d7c5f",
    });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.querySelector('[aria-label="Work journal"] a[data-hovered="true"]');
        const inactive = Array.from(document.querySelectorAll('[aria-label="Work journal"] a')).find(
          (card) => card !== active,
        );
        const activeImage = active?.querySelector("img");
        const inactiveImage = inactive?.querySelector("img");

        return {
          activeImageFilter: activeImage ? getComputedStyle(activeImage).filter : "",
          inactiveImageFilter: inactiveImage ? getComputedStyle(inactiveImage).filter : "",
        };
      }),
    )
    .toEqual({
      activeImageFilter: "none",
      inactiveImageFilter: "grayscale(1)",
    });

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole("button", { name: /categories/i })).toBeVisible();

  await page.getByRole("button", { name: /categories/i }).click();

  const modal = page.getByRole("dialog", { name: "Work categories" });
  await expect(modal).toBeVisible();
  await expect(modal).toHaveCSS("background-color", "rgb(241, 235, 226)");
  await expect(modal).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await expect(modal.getByText("Viewing")).toHaveCount(0);
  await expect(modal.getByRole("heading")).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Motion" })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Motion" })).toHaveCSS("color", "rgb(10, 10, 10)");
  await expect(modal.getByRole("button", { name: "Motion" })).toHaveCSS("text-align", "center");
  await expect(modal.getByRole("button", { name: "Motion" })).toHaveCSS("font-family", /Times New Roman/);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await modal.getByRole("button", { name: "Motion" }).click();
  await expect(modal).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect.poll(() => new URL(page.url()).searchParams.get("filters")).toBe("Motion");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  await expect(page.getByLabel("Work journal").getByRole("link")).toHaveCount(4);
  await expect(page.getByLabel("Work journal").getByRole("heading", { name: "ZetaChain" })).toBeVisible();

  await page.getByLabel("Project view").getByRole("button", { name: /Switch to list view/i }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("list");
});

test("work new alternate route renders mixed small and big project cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoAppPage(page, "/work-new-alternate");

  await expect(page).toHaveTitle("Work (alternate journal)");
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveCount(1);
  await expect(page.getByLabel("Project view").getByRole("button")).toHaveAttribute("data-button-view", "list");
  await expect(page.getByLabel("Work filters").getByRole("button")).toHaveCount(5);
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("grid");

  const workJournal = page.getByLabel("Work journal");
  await expect(workJournal.getByRole("link")).toHaveCount(12);
  await expect(workJournal.getByRole("heading", { name: "Sticky Notes" })).toBeVisible();

  const layoutState = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const cards = Array.from(document.querySelectorAll('[aria-label="Work journal"] a'))
      .slice(0, 4)
      .map((card) => Math.round(card.getBoundingClientRect().width));
    const mediaHeights = Array.from(document.querySelectorAll('[aria-label="Work journal"] a [class*="media"]'))
      .slice(0, 4)
      .map((media) => Math.round(media.getBoundingClientRect().height));

    return {
      layout: grid?.getAttribute("data-layout"),
      cardWidths: cards,
      mediaHeights,
      view: grid?.getAttribute("data-view"),
      uniqueHeights: [...new Set(mediaHeights)].sort((a, b) => a - b),
    };
  });

  expect(layoutState.layout).toBe("alternating");
  expect(layoutState.view).toBe("grid");
  expect(Math.max(...layoutState.cardWidths) - Math.min(...layoutState.cardWidths)).toBeLessThanOrEqual(4);
  expect(layoutState.mediaHeights[2]).toBeGreaterThan(layoutState.mediaHeights[0]);
  expect(layoutState.mediaHeights[0]).toBeGreaterThan(layoutState.mediaHeights[1]);
  expect(layoutState.mediaHeights[1]).toBeGreaterThan(layoutState.mediaHeights[3]);
  expect(layoutState.uniqueHeights.length).toBeGreaterThan(2);

  await page.getByLabel("Work filters").getByRole("button", { name: "Motion" }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("filters")).toBe("Motion");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");
  await expect(workJournal.getByRole("link")).toHaveCount(4);
  await expect(workJournal.getByRole("heading", { name: "ZetaChain" })).toBeVisible();

  await page.getByLabel("Project view").getByRole("button", { name: /Switch to list view/i }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("list");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('[aria-label="Work journal"] [class*="grid"]')
          ?.getAttribute("data-transition"),
      ),
    )
    .toBe("idle");

  const alternateListState = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Work journal"] [class*="grid"]');
    const first = document.querySelector('[aria-label="Work journal"] a');
    const firstIndustry = first?.querySelector('[class*="listIndustry"]');
    const firstMedia = first?.querySelector('[class*="media"]');
    const firstTitle = first?.querySelector("h2");
    const firstYear = first?.querySelector('[class*="listYear"]');
    const firstRect = first?.getBoundingClientRect();
    const industryRect = firstIndustry?.getBoundingClientRect();
    const titleRect = firstTitle?.getBoundingClientRect();
    const mediaStyle = firstMedia ? getComputedStyle(firstMedia) : null;
    const yearStyle = firstYear ? getComputedStyle(firstYear) : null;

    return {
      firstCardHeight: firstRect ? Math.round(firstRect.height) : 0,
      firstIndustry: firstIndustry?.textContent?.trim(),
      firstTitle: firstTitle?.textContent?.trim(),
      titleAfterIndustry: industryRect && titleRect ? titleRect.x > industryRect.x : false,
      firstYear: firstYear?.textContent?.trim(),
      firstYearTextAlign: yearStyle?.textAlign,
      mediaOpacity: mediaStyle ? Number(mediaStyle.opacity) : 1,
      mediaTransition: mediaStyle?.transitionProperty ?? "",
      view: grid?.getAttribute("data-view"),
    };
  });

  expect(alternateListState.firstCardHeight).toBeGreaterThanOrEqual(43);
  expect(alternateListState.firstCardHeight).toBeLessThanOrEqual(51);
  expect(alternateListState).toMatchObject({
    firstIndustry: "Technology",
    firstTitle: "ZetaChain",
    titleAfterIndustry: true,
    firstYear: "2026",
    firstYearTextAlign: "right",
    mediaOpacity: 0,
    mediaTransition: "none",
    view: "list",
  });

  await expect(page.request.get("/__editor?path=/work-new-alternate").then((response) => response.ok())).resolves.toBe(
    true,
  );
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

test("case study detail page renders the local Forma reference clone", async ({ page }) => {
  await gotoAppPage(page, "/case-studies/zetachain");

  await expect(page).toHaveTitle("Polestar - Forma");
  await expect(page.getByRole("heading", { name: "POLESTAR" })).toBeVisible();
  await expect(page.getByText("A bold vision cast in futuristic steel and shade.")).toBeVisible();
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

import { expect, test } from "@playwright/test";

test("Paper Lift reveals the prepared homepage and restores scrolling", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const preloader = page.locator("[data-site-preloader]");
  const preloaderLogo = page.locator("[data-site-preloader-logo]");
  const preloaderLogoFill = page.locator("[data-site-preloader-logo-fill]");
  const navigationLogo = page.locator("[data-navigation-logo]");
  await expect(preloader).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(preloader).toHaveCSS("background-color", "rgb(241, 235, 226)");
  await expect(preloaderLogo.locator("svg path")).toHaveCount(2);
  await expect(preloaderLogo.locator("svg path").first()).toHaveAttribute(
    "d",
    /^M8\.24973/
  );
  await expect(preloaderLogoFill.locator("svg path")).toHaveAttribute(
    "d",
    /^M8\.24973/
  );
  await expect(preloaderLogo).toHaveAttribute("data-complete", "false");
  await expect(preloaderLogo).toHaveCSS(
    "transform",
    "matrix(4, 0, 0, 4, 0, 0)"
  );
  await expect(preloaderLogo).toHaveCSS("transition-duration", "0.32s");
  await expect(navigationLogo).toHaveCSS("visibility", "hidden");
  await expect(preloader.getByText("100%", { exact: true })).toBeVisible();
  await expect(preloaderLogo).toHaveAttribute("data-complete", "true");
  await expect(preloaderLogo).toHaveCSS("--preloader-logo-progress", "100%");
  await expect(preloaderLogoFill).toHaveCSS(
    "clip-path",
    "inset(0px 0% 0px 0px)"
  );
  await expect(preloaderLogo).toHaveAttribute("data-playing", "true");

  const liftTiming = await preloader.evaluate((element) => {
    const animation = element.getAnimations()[0];
    const timing = animation.effect?.getComputedTiming();
    const pauseFrames =
      animation.effect instanceof KeyframeEffect
        ? animation.effect
            .getKeyframes()
            .filter((frame) => frame.offset === 0.61 || frame.offset === 0.71)
        : [];
    const logoRect = document
      .querySelector("[data-navigation-logo]")
      ?.getBoundingClientRect();

    return {
      duration: timing?.duration,
      holdDuration:
        typeof timing?.duration === "number"
          ? timing.duration * (0.71 - 0.61)
          : 0,
      logoBottom: logoRect?.bottom,
      logoTop: logoRect?.top,
      pauseTransforms: pauseFrames?.map((frame) => frame.transform),
      stopPosition: Number.parseFloat(
        getComputedStyle(element).getPropertyValue("--preloader-pause-edge")
      ),
    };
  });

  expect(liftTiming.duration).toBe(1_980);
  expect(liftTiming.holdDuration).toBeCloseTo(200, -1);
  expect(liftTiming.pauseTransforms).toHaveLength(2);
  expect(liftTiming.pauseTransforms?.[0]).toBe(liftTiming.pauseTransforms?.[1]);
  expect(liftTiming.stopPosition - (liftTiming.logoBottom ?? 0)).toBeCloseTo(
    liftTiming.logoTop ?? 0,
    4
  );

  const logoEndpoint = await page.evaluate(() => {
    const mark = document.querySelector<HTMLElement>(
      "[data-site-preloader-logo]"
    )!;
    const target = document.querySelector<HTMLElement>(
      "[data-navigation-logo]"
    )!;
    const animation = mark.getAnimations()[0];
    animation.pause();
    animation.currentTime = 120 + 1_980 * 0.66;
    const settled = mark.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    return {
      endpoint: {
        height: settled.height,
        left: settled.left,
        top: settled.top,
      },
      target: {
        height: targetRect.height,
        left: targetRect.left,
        top: targetRect.top,
      },
    };
  });

  expect(logoEndpoint.endpoint.left).toBeCloseTo(logoEndpoint.target.left, 4);
  expect(logoEndpoint.endpoint.top).toBeCloseTo(logoEndpoint.target.top, 4);
  expect(logoEndpoint.endpoint.height).toBeCloseTo(
    logoEndpoint.target.height,
    4
  );

  await expect(preloader).toHaveCount(0, { timeout: 6_000 });
  await expect(preloaderLogo).toHaveCount(0);
  await expect(navigationLogo).toHaveCSS("visibility", "visible");
  await expect(
    page.getByText("Natural Outcome", { exact: false }).first()
  ).toBeVisible();

  expect(
    await page.evaluate(() => ({
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    }))
  ).toEqual({ body: "", html: "" });

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByLabel("Primary")
    .getByRole("link", { name: "Careers", exact: true })
    .click();
  await page.waitForURL("**/careers");
  await expect(page.locator("[data-site-preloader]")).toHaveCount(0);
});

test("Paper Lift is bypassed for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-site-preloader]")).toHaveCount(0);
  await expect(
    page.getByText("Natural Outcome", { exact: false }).first()
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("careers pillars keep the masked spring interaction and full-width roles surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/careers", { waitUntil: "domcontentloaded" });

  const rolesSection = page.locator('[class*="openRolesSection"]');
  const careersPage = page.locator("[data-careers-page]");
  await expect(rolesSection).toHaveCSS("background-color", "rgb(241, 235, 226)");
  expect(await rolesSection.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  })).toEqual({ left: 0, width: 1440 });
  expect(await careersPage.evaluate((careers) => {
    const people = careers.querySelector('[class*="peopleSection"]');
    const roles = careers.querySelector('[class*="openRolesSection"]');
    if (!(people instanceof HTMLElement) || !(roles instanceof HTMLElement)) {
      throw new Error("Missing Careers section geometry");
    }
    const peopleRect = people.getBoundingClientRect();
    const rolesRect = roles.getBoundingClientRect();
    const careersRect = careers.getBoundingClientRect();
    return {
      gapAbove: Math.round(rolesRect.top - peopleRect.bottom),
      gapBelow: Math.round(careersRect.bottom - rolesRect.bottom),
    };
  })).toEqual({
    gapAbove: 0,
    gapBelow: 0,
  });
  await expect(rolesSection.locator(".join_us-section")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  const grid = page.locator('[data-active-pillar]');
  const cards = grid.locator(':scope > [class*="pillarCardSlot"]');
  const activeViewport = grid.locator(':scope > [aria-hidden="true"]');
  await expect(cards).toHaveCount(3);

  await cards.nth(2).scrollIntoViewIfNeeded();
  await cards.nth(2).hover();
  await expect(grid).toHaveAttribute("data-active-pillar", "2");
  await expect(activeViewport).toHaveCSS("opacity", "1");
  await expect(cards.nth(2).locator("p")).toHaveCSS("opacity", "0.5");
  await expect(activeViewport.locator("p").nth(2)).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(activeViewport.locator("p").nth(2)).toHaveCSS("opacity", "1");

  await cards.nth(1).hover();
  await page.waitForTimeout(300);
  const alignmentDelta = await grid.evaluate((element) => {
    const baseHeading = element.children[1].querySelector("h3")?.getBoundingClientRect();
    const activeHeading = element.lastElementChild?.querySelectorAll("h3")[1]?.getBoundingClientRect();
    if (!baseHeading || !activeHeading) return Number.POSITIVE_INFINITY;
    return Math.hypot(activeHeading.x - baseHeading.x, activeHeading.y - baseHeading.y);
  });
  expect(alignmentDelta).toBeLessThan(0.1);

  await page.mouse.move(1, 1);
  await expect(activeViewport).toHaveCSS("opacity", "0");
  await expect(cards.nth(1).locator("h3")).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(cards.nth(1).locator("p")).toHaveCSS("opacity", "0.5");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "domcontentloaded" });
  const reducedGrid = page.locator('[data-active-pillar]');
  const reducedCards = reducedGrid.locator(':scope > [class*="pillarCardSlot"]');
  const reducedViewport = reducedGrid.locator(':scope > [aria-hidden="true"]');
  await reducedCards.nth(0).scrollIntoViewIfNeeded();
  await reducedCards.nth(0).hover();
  await reducedCards.nth(2).hover();
  await expect(reducedViewport).toHaveCSS("transition-duration", "0s");
  await expect(reducedViewport.locator(':scope > [class*="pillarsActiveLayer"]')).toHaveCSS("transition-duration", "0s");
});

test("rapid pillar sweeps keep the masked text aligned when exiting mid-spring", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/careers", { waitUntil: "domcontentloaded" });

  const grid = page.locator("[data-active-pillar]");
  const cards = grid.locator(':scope > [class*="pillarCardSlot"]');
  await cards.nth(0).scrollIntoViewIfNeeded();
  await cards.nth(0).hover();
  await page.waitForTimeout(50);
  await cards.nth(1).hover();
  await page.waitForTimeout(80);
  await cards.nth(2).hover();
  await page.waitForTimeout(80);

  const gridBox = await grid.boundingBox();
  if (!gridBox) throw new Error("Missing Careers pillars grid");
  await page.mouse.move(1439, gridBox.y + gridBox.height / 2);
  await page.waitForTimeout(16);

  const maxAlignmentDelta = await grid.evaluate((element) => {
    const baseHeadings = [...element.querySelectorAll(':scope > [class*="pillarCardSlot"] > [class*="pillarCard"] h3')];
    const activeHeadings = [...element.querySelectorAll(':scope > [aria-hidden="true"] h3')];
    return Math.max(...baseHeadings.map((heading, index) => {
      const baseRect = heading.getBoundingClientRect();
      const activeRect = activeHeadings[index].getBoundingClientRect();
      return Math.hypot(activeRect.x - baseRect.x, activeRect.y - baseRect.y);
    }));
  });

  expect(maxAlignmentDelta).toBeLessThan(1);
});

import { expect, test } from "@playwright/test";

test("careers pillars keep the masked spring interaction and full-width roles surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/careers", { waitUntil: "domcontentloaded" });

  const rolesSection = page.locator('[class*="openRolesSection"]');
  await expect(rolesSection).toHaveCSS("background-color", "rgb(241, 235, 226)");
  expect(await rolesSection.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  })).toEqual({ left: 0, width: 1440 });
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

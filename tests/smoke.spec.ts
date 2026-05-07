import { expect, test } from "@playwright/test";

test("home page renders the mirrored homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("The Natural Outcome | Ripe Studios");
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Natural Outcome" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
});

test("case studies page renders visible cards", async ({ page }) => {
  await page.goto("/case-studies-new");

  await expect(page).toHaveTitle("Case Studies NEW");
  await expect(page.locator(".filter-list .checkbox-label").first()).toHaveText("Strategy");

  const cards = page.locator(".case-studies-list .masonry-item");
  await expect(cards).toHaveCount(12);
  await expect(cards.first()).toBeVisible();
  await expect(page.locator(".case-studies-list .casestudy_title-text").first()).toHaveText(/Sticky Notes/i);
});

test("writing archive lists mirrored posts", async ({ page }) => {
  await page.goto("/archive/writing-new-copy");

  await expect(page).toHaveTitle("Writing New");
  await expect(page.locator("text=Understanding Writing Techniques").first()).toBeVisible();
  await expect(page.locator("text=The Power of Words").first()).toBeVisible();
});

test("case study detail page renders zetaChain content", async ({ page }) => {
  await page.goto("/case-studies/zetachain");

  await expect(page).toHaveTitle("Ripe Studios — New Style");
  await expect(page.locator("[data-case-study-hero-title='ZetaChain']")).toBeVisible();
  await expect(page.locator("[data-case-study-hero-summary='A South African icon.']")).toBeVisible();
});

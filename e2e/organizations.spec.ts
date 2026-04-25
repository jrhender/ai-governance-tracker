import { test, expect } from "@playwright/test";

test.describe("organizations page", () => {
  test("renders org cards", async ({ page }) => {
    await page.goto("/orgs/");
    await expect(
      page.getByRole("heading", { name: "Organizations", level: 1 }),
    ).toBeVisible();

    // At least one org card is visible
    const cards = page.locator("a[href^='/orgs/']");
    await expect(cards.first()).toBeVisible();
  });

  test("org card links to detail page", async ({ page }) => {
    await page.goto("/orgs/");
    await page.locator("a[href^='/orgs/']").first().click();
    await expect(page).toHaveURL(/\/orgs\/.+\//);
  });

  test("org detail page back-link points to /orgs/", async ({ page }) => {
    await page.goto("/orgs/cigi-global-ai-risks-initiative/");
    const backLink = page.getByRole("link", { name: "← Organizations" });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/orgs\/$/);
  });

  test("header nav contains Organizations link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Organizations" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/orgs\/$/);
  });
});

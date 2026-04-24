import { test, expect } from "@playwright/test";

test.describe("legislation page", () => {
  test("renders legislation cards with status badges", async ({ page }) => {
    await page.goto("/legislation/");
    const heading = page.getByRole("heading", { name: "Legislation", level: 1 });
    await expect(heading).toBeVisible();

    const billCard = page.getByRole("link", { name: /Bill C-27/i });
    await expect(billCard).toBeVisible();
    await expect(billCard).toContainText("Died");
    await expect(billCard).toContainText("Died on the Order Paper");
  });

  test("legislation card links to artifact detail page", async ({ page }) => {
    await page.goto("/legislation/");
    await page.getByRole("link", { name: /Bill C-27/i }).click();
    await expect(page).toHaveURL(/\/artifacts\/bill-c27-aida\//);
  });

  test("header nav contains Legislation link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Legislation" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/legislation\//);
  });
});

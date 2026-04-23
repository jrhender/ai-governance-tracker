import { test, expect } from "@playwright/test";

const CIGI_ID = "cigi-global-ai-risks-initiative";

test.describe("timeline", () => {
  test("homepage loads and renders timeline items", async ({ page }) => {
    await page.goto("/");
    const items = page.locator("ol > li");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });

  test("clicking an org pill narrows the list and updates the URL", async ({
    page,
  }) => {
    await page.goto("/");
    const initialCount = await page.locator("ol > li").count();

    await page.getByRole("button", { name: /CIGI/ }).click();

    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));
    const filteredCount = await page.locator("ol > li").count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("browser Back restores the previous filter state", async ({ page }) => {
    await page.goto("/");
    const initialCount = await page.locator("ol > li").count();

    await page.getByRole("button", { name: /CIGI/ }).click();
    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await page.locator("ol > li").count()).toBe(initialCount);
  });

  test("invalid ?org= shows all items and cleans the URL", async ({ page }) => {
    await page.goto("/?org=bogus-xyz");

    await expect(page).toHaveURL(/\/$/);
    const items = page.locator("ol > li");
    expect(await items.count()).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

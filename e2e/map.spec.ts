import { test, expect } from "@playwright/test";

test.describe("map page", () => {
  test("renders heading, metrics, and at least one domain section (requires current seed data)", async ({ page }) => {
    await page.goto("/map/");
    await expect(
      page.getByRole("heading", { name: /Risk → Mitigation → Implementation/, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("risks tracked")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "AI system safety, failures & limitations", level: 2 }),
    ).toBeVisible();
  });

  test("shows status chips and recommended-by links", async ({ page }) => {
    await page.goto("/map/");
    await expect(page.getByText("Untracked").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Governing AI: A Plan for Canada (2024 Update)" }).first(),
    ).toBeVisible();
  });

  test("nav includes Map link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Map" }),
    ).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("policy page", () => {
  test("renders page heading and all four sections", async ({ page }) => {
    await page.goto("/policy/");
    await expect(page.getByRole("heading", { name: "Policy", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Legislation", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reports", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Policy Documents", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Government Programs", level: 2 })).toBeVisible();
  });

  test("legislation card shows title, status badge, and stage", async ({ page }) => {
    await page.goto("/policy/");
    const card = page.getByRole("link", { name: /Bill C-27/i });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Died");
    await expect(card).toContainText("Died on the Order Paper");
  });

  test("legislation card links to artifact detail page", async ({ page }) => {
    await page.goto("/policy/");
    await page.getByRole("link", { name: /Bill C-27/i }).click();
    await expect(page).toHaveURL(/\/artifacts\/bill-c27-aida\//);
  });

  test("reports section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Reports" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("policy documents section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Policy Documents" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("government programs section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Government Programs" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("header nav contains Policy link that navigates to /policy/", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Policy" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/policy\//);
  });

  test("header nav does not contain Home or Legislation links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Home" })).not.toBeVisible();
    await expect(nav.getByRole("link", { name: "Legislation" })).not.toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("mobile nav", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows hamburger and hides desktop nav on mobile", async ({ page }) => {
    await expect(page.getByRole("button", { name: /toggle navigation/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
  });

  test("toggles mobile nav open and closed", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle navigation/i });
    const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });

    await expect(mobileNav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(mobileNav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await toggle.click();
    await expect(mobileNav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("closes mobile nav with Escape key", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle navigation/i });
    const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });

    await toggle.click();
    await expect(mobileNav).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(mobileNav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("mobile nav links navigate correctly", async ({ page }) => {
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Timeline" }).click();
    await expect(page).toHaveURL("/timeline/");
  });
});

test.describe("desktop nav", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("shows desktop nav and hides hamburger", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /toggle navigation/i })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("renders site title and values statement", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /AI Governance Tracker/i })).toBeVisible();
    await expect(page.getByText(/transformational impact/i)).toBeVisible();
  });

  test("primary CTA links to /timeline/", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Browse the Timeline/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/timeline/");
  });

  test("contribute link points to GitHub new issue page", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Contribute/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/jrhender/ai-governance-tracker/issues/new"
    );
  });

  test("section cards link to /timeline/ and /policy/", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("main").getByRole("link", { name: /Timeline/i }).first()
    ).toHaveAttribute("href", "/timeline/");
    await expect(
      page.locator("main").getByRole("link", { name: /Policy/i }).first()
    ).toHaveAttribute("href", "/policy/");
  });
});

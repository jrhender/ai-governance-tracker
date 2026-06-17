import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("renders site title and values statement", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /AI Governance Tracker/i })).toBeVisible();
    await expect(page.getByText(/transformational impact/i)).toBeVisible();
  });

  test("latest activity links to the full timeline", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /View full timeline/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/timeline/");
  });

  test("latest activity shows three items", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: /Latest activity/i });
    await expect(list.locator("li")).toHaveCount(3);
  });

  test("footer contribute link points to GitHub and is global", async ({ page }) => {
    // Load a non-home page to prove the link lives in the global footer.
    await page.goto("/timeline/");
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name: /Contribute/i });
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

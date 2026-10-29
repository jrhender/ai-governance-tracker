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

  test("explore cards cover all four site sections", async ({ page }) => {
    await page.goto("/");
    // Scope to the Explore grid: the Latest activity list above it shows event
    // titles, which can contain words like "organizations" or "policy".
    const grid = page.getByRole("navigation", { name: /Explore/i });
    await expect(
      grid.getByRole("link", { name: /Organizations/i })
    ).toHaveAttribute("href", "/orgs/");
    await expect(
      grid.getByRole("link", { name: /Policy/i })
    ).toHaveAttribute("href", "/policy/");
    await expect(
      grid.getByRole("link", {
        name: /How AI risks map to proposed mitigations/i,
      })
    ).toHaveAttribute("href", "/map/");
    await expect(
      grid.getByRole("link", { name: /The full record of hearings/i })
    ).toHaveAttribute("href", "/timeline/");
  });

  test("explore grid holds four cards, so no row is left short", async ({
    page,
  }) => {
    await page.goto("/");
    const grid = page.getByRole("navigation", { name: /Explore/i });
    await expect(grid.getByRole("link")).toHaveCount(4);
  });

  test("intro paragraph links to the risk map", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("main").getByRole("link", { name: /risk map/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/map/");
  });
});

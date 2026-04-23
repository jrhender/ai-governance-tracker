import { test, expect } from "@playwright/test";

test.describe("analytics", () => {
  test("footer shows the analytics disclosure", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByText(/Anonymous usage statistics/i),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /Cloudflare Web Analytics/i }),
    ).toBeVisible();
  });
});

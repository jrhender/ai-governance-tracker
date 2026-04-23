import { test, expect } from "@playwright/test";

test.describe("analytics", () => {
  test("footer shows the analytics disclosure", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Anonymous usage statistics via Cloudflare Web Analytics/i),
    ).toBeVisible();
  });

  test("cloudflare web analytics beacon is present in prod HTML", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const html = await response!.text();
    expect(html).toMatch(/static\.cloudflareinsights\.com\/beacon\.min\.js/);
  });
});

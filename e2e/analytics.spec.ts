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

  test("cloudflare web analytics beacon is present in prod HTML", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const html = await response!.text();
    expect(html).toMatch(/data-cf-beacon=/);
  });
});

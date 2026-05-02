import { test, expect } from "@playwright/test";

test.describe("Open Graph and Twitter meta tags", () => {
  test("homepage has correct og:title", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(content).toBe("AI Governance Tracker");
  });

  test("homepage has og:description", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });

  test("homepage has og:type=website", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(content).toBe("website");
  });

  test("homepage has og:url matching canonical", async ({ page }) => {
    await page.goto("/");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(ogUrl).toBe(canonical);
  });

  test("homepage has og:site_name", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:site_name"]').getAttribute("content");
    expect(content).toBe("AI Governance Tracker");
  });

  test("homepage has og:image pointing to /og-image.png", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(content).toContain("/og-image.png");
  });

  test("homepage has og:image dimensions", async ({ page }) => {
    await page.goto("/");
    const width = await page.locator('meta[property="og:image:width"]').getAttribute("content");
    const height = await page.locator('meta[property="og:image:height"]').getAttribute("content");
    expect(width).toBe("1200");
    expect(height).toBe("630");
  });

  test("homepage has twitter:card=summary_large_image", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(content).toBe("summary_large_image");
  });

  test("homepage has twitter:title", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:title"]').getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("homepage has twitter:description", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:description"]').getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("inner page has og:url matching its canonical URL, not homepage", async ({ page }) => {
    await page.goto("/timeline/");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(ogUrl).toContain("/timeline/");
  });
});

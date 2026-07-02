import { test, expect } from "@playwright/test";

const CIGI_ID = "cigi-global-ai-risks-initiative";
const CIGI_EVENT_TITLE = /AI National Security Scenarios Workshop/i;
const NON_CIGI_EVENT_TITLE = /INDU Meeting 27/i;

function timelineItems(page: import("@playwright/test").Page) {
  return page
    .getByRole("list", { name: /timeline/i })
    .getByRole("listitem");
}

test.describe("timeline", () => {
  test("timeline page loads and renders timeline items", async ({ page }) => {
    await page.goto("/timeline/");
    const items = timelineItems(page);
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });

  test("clicking an org pill narrows the list and updates the URL", async ({
    page,
  }) => {
    await page.goto("/timeline/");
    const initialCount = await timelineItems(page).count();

    await page.getByRole("button", { name: /CIGI/ }).click();

    await expect(page).toHaveURL(new RegExp(`/timeline/\\?org=${CIGI_ID}$`));
    await expect(page.getByRole("heading", { name: CIGI_EVENT_TITLE })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: NON_CIGI_EVENT_TITLE }),
    ).toHaveCount(0);

    const filteredCount = await timelineItems(page).count();
    expect(filteredCount).toBeLessThan(initialCount);
  });

  test("browser Back restores the previous filter state", async ({ page }) => {
    await page.goto("/timeline/");
    const initialCount = await timelineItems(page).count();

    await page.getByRole("button", { name: /CIGI/ }).click();
    await expect(page).toHaveURL(new RegExp(`/timeline/\\?org=${CIGI_ID}$`));

    await page.goBack();

    await expect(page).toHaveURL(/\/timeline\/$/);
    const orgFilterAll = page.getByLabel("Filter by organization").getByRole("button", { name: "All" });
    await expect(orgFilterAll).toHaveAttribute("aria-pressed", "true");
    expect(await timelineItems(page).count()).toBe(initialCount);
  });

  test("invalid ?org= shows all items and cleans the URL", async ({ page }) => {
    await page.goto("/timeline/?org=bogus-xyz");

    await expect(page).toHaveURL(/\/timeline\/$/);
    expect(await timelineItems(page).count()).toBeGreaterThan(0);
    const orgFilterAll = page.getByLabel("Filter by organization").getByRole("button", { name: "All" });
    await expect(orgFilterAll).toHaveAttribute("aria-pressed", "true");
  });

  test("jurisdiction filter narrows to international events and back", async ({
    page,
  }) => {
    await page.goto("/timeline/");
    const jurisdictionFilter = page.getByLabel("Filter by jurisdiction");

    await jurisdictionFilter.getByRole("button", { name: "International" }).click();
    await expect(
      page.getByRole("heading", { name: /Hiroshima AI Process Reporting Framework 2\.0/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: NON_CIGI_EVENT_TITLE }),
    ).toHaveCount(0);

    await jurisdictionFilter.getByRole("button", { name: "Canada" }).click();
    await expect(
      page.getByRole("heading", { name: NON_CIGI_EVENT_TITLE }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Hiroshima AI Process Reporting Framework 2\.0/i }),
    ).toHaveCount(0);
  });

  test("timeline does not contain artifact entries", async ({ page }) => {
    await page.goto("/timeline/");
    const items = timelineItems(page);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const badges = items.nth(i).locator("div.flex > span").first();
      await expect(badges).not.toHaveText("Legislation");
      await expect(badges).not.toHaveText("Report");
    }
  });
});

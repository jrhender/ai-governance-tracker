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
  test("homepage loads and renders timeline items", async ({ page }) => {
    await page.goto("/");
    const items = timelineItems(page);
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });

  test("clicking an org pill narrows the list and updates the URL", async ({
    page,
  }) => {
    await page.goto("/");
    const initialCount = await timelineItems(page).count();

    await page.getByRole("button", { name: /CIGI/ }).click();

    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));
    await expect(page.getByRole("heading", { name: CIGI_EVENT_TITLE })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: NON_CIGI_EVENT_TITLE }),
    ).toHaveCount(0);

    const filteredCount = await timelineItems(page).count();
    expect(filteredCount).toBeLessThan(initialCount);
  });

  test("browser Back restores the previous filter state", async ({ page }) => {
    await page.goto("/");
    const initialCount = await timelineItems(page).count();

    await page.getByRole("button", { name: /CIGI/ }).click();
    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await timelineItems(page).count()).toBe(initialCount);
  });

  test("invalid ?org= shows all items and cleans the URL", async ({ page }) => {
    await page.goto("/?org=bogus-xyz");

    await expect(page).toHaveURL(/\/$/);
    expect(await timelineItems(page).count()).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("timeline does not contain artifact entries", async ({ page }) => {
    await page.goto("/");
    const items = timelineItems(page);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const badges = items.nth(i).locator("div.flex > span").first();
      await expect(badges).not.toHaveText("Legislation");
      await expect(badges).not.toHaveText("Report");
    }
  });
});

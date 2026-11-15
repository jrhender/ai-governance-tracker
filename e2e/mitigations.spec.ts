import { test, expect } from "@playwright/test";

test.describe("mitigations pages", () => {
  test("index lists mitigations by category with the risks they address", async ({ page }) => {
    await page.goto("/mitigations/");
    await expect(
      page.getByRole("heading", { name: "Mitigation → Risk", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Technical & Security", level: 2 }),
    ).toBeVisible();
    await expect(page.getByText("Addresses:").first()).toBeVisible();
    await expect(page.getByText(/\d+ policy instruments?/).first()).toBeVisible();
  });

  test("view toggle links the risk map and mitigation index", async ({ page }) => {
    await page.goto("/map/");
    await page.getByRole("navigation", { name: "Map view" }).getByRole("link", { name: "By mitigation" }).click();
    await expect(page).toHaveURL(/\/mitigations\/$/);
    await page.getByRole("navigation", { name: "Map view" }).getByRole("link", { name: "By risk" }).click();
    await expect(page).toHaveURL(/\/map\/$/);
  });

  test("mitigation → instrument → technology pages link together (requires current seed data)", async ({ page }) => {
    await page.goto("/mitigations/slow-or-pause-frontier-ai/");
    await expect(
      page.getByRole("heading", { name: "Develop the ability to slow or pause frontier AI development", level: 1 }),
    ).toBeVisible();
    const instruments = page.getByRole("region", { name: "Policy instruments" });
    await expect(instruments.getByRole("link", { name: "Lag on models used for AI R&D" })).toBeVisible();

    await instruments.getByRole("link", { name: "Lag on models used for AI R&D" }).click();
    await expect(page).toHaveURL(/\/instruments\/ai-rnd-model-lag\/$/);
    const techs = page.getByRole("region", { name: "Enabling technologies" });
    await techs.getByRole("link", { name: "Challenges" }).click();

    await expect(page).toHaveURL(/\/technologies\/challenges\/$/);
    await expect(page.getByRole("heading", { name: "Challenges", level: 1 })).toBeVisible();
    const enables = page.getByRole("region", { name: "Enables these policy instruments" });
    await expect(enables.getByRole("link", { name: "Lag on models used for AI R&D" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Prepare an international regime able to prohibit or pause superintelligence development" }),
    ).toBeVisible();
  });
});

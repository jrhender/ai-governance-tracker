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
    await expect(page.getByText("6 approaches")).toBeVisible();
  });

  test("view toggle links the risk map and mitigation index", async ({ page }) => {
    await page.goto("/map/");
    await page.getByRole("navigation", { name: "Map view" }).getByRole("link", { name: "By mitigation" }).click();
    await expect(page).toHaveURL(/\/mitigations\/$/);
    await page.getByRole("navigation", { name: "Map view" }).getByRole("link", { name: "By risk" }).click();
    await expect(page).toHaveURL(/\/map\/$/);
  });

  test("AI verification detail page breaks the mitigation into technologies (requires current seed data)", async ({ page }) => {
    await page.goto("/mitigations/asi-verification-compliance/");
    await expect(
      page.getByRole("heading", { name: "Develop technical verification to prevent ASI weaponization", level: 1 }),
    ).toBeVisible();
    const approaches = page.getByRole("region", { name: "Technologies & approaches" });
    for (const name of [
      "Recomputation",
      "Challenges",
      "Secure enclaves",
      "Fingerprinting",
      "Hardware-enforced limits",
      "Zero-knowledge proofs",
    ]) {
      await expect(approaches.getByRole("heading", { name, level: 3 })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Loss of control of advanced AI" }).first()).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("related risks and mitigations on record pages", () => {
  test("an enacted bill lists the mitigation it implements and the risks it addresses", async ({ page }) => {
    await page.goto("/artifacts/bill-c16-protecting-victims-act/");
    const section = page.getByRole("region", { name: "Risks and mitigations" });
    await expect(
      section.getByRole("link", { name: "Criminalize deceptive and abusive deepfakes" }),
    ).toBeVisible();
    await expect(section.getByText("Implements")).toBeVisible();
    await expect(section.getByRole("link", { name: "AI-enabled crime and fraud" })).toBeVisible();
  });

  test("an event inherits mitigations from its related artifact", async ({ page }) => {
    await page.goto("/events/bill-c25-royal-assent-2026/");
    const section = page.getByRole("region", { name: "Risks and mitigations" });
    await expect(
      section.getByRole("link", { name: "Criminalize deceptive and abusive deepfakes" }),
    ).toBeVisible();
  });

  test("an event with no linked mitigations shows no section", async ({ page }) => {
    await page.goto("/events/pan-canadian-ai-strategy-phase-1-2017/");
    await expect(page.getByRole("region", { name: "Risks and mitigations" })).toHaveCount(0);
  });
});

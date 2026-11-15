import { test, expect } from "@playwright/test";

test.describe("related risks and mitigations on record pages", () => {
  test("an enacted bill lists the instrument it implements, its mitigation and risks", async ({ page }) => {
    await page.goto("/artifacts/bill-c16-protecting-victims-act/");
    const section = page.getByRole("region", { name: "Risks and mitigations" });
    await expect(
      section.getByRole("link", { name: "Criminal and elections offences for deceptive deepfakes" }),
    ).toBeVisible();
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

  test("an instrument page lists its Canadian implementations", async ({ page }) => {
    await page.goto("/instruments/deepfake-criminal-offences/");
    await expect(page.getByRole("heading", { name: "Implementation in Canada" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Bill C-25 — Strong and Free Elections Act" }),
    ).toBeVisible();
  });

  test("an event with no linked mitigations shows no section", async ({ page }) => {
    await page.goto("/events/pan-canadian-ai-strategy-phase-1-2017/");
    await expect(page.getByRole("region", { name: "Risks and mitigations" })).toHaveCount(0);
  });
});

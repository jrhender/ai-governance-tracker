import { test, expect } from "@playwright/test";

const EVENT_WITH_ARTIFACT = "/events/cigi-pco-report-published-2026/";
const EVENT_WITHOUT_ARTIFACT =
  "/events/indu-ai-strategic-industries-meeting-27-2026/";
const ARTIFACT_PATH = "/artifacts/cigi-pco-ai-national-security-report-2026/";

test.describe("event artifact card", () => {
  test("artifact card renders before the Organizations section", async ({
    page,
  }) => {
    await page.goto(EVENT_WITH_ARTIFACT);

    const card = page.getByRole("link", { name: /Read the artifact/i });
    await expect(card).toBeVisible();

    const order = await page.evaluate(() => {
      const section = document.querySelector(
        'section[aria-label="Related artifacts"]',
      );
      const orgsHeading = [...document.querySelectorAll("h2")].find((h) =>
        h.textContent?.includes("Organizations"),
      );
      if (!section || !orgsHeading) return "missing";
      return section.compareDocumentPosition(orgsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
        ? "card-first"
        : "orgs-first";
    });
    expect(order).toBe("card-first");
  });

  test("card links to the artifact page", async ({ page }) => {
    await page.goto(EVENT_WITH_ARTIFACT);

    await page.getByRole("link", { name: /Read the artifact/i }).click();

    await expect(page).toHaveURL(new RegExp(`${ARTIFACT_PATH}$`));
    await expect(
      page.getByRole("heading", {
        name: /AI and National Security: Scenarios Workshop Summary Report/i,
      }),
    ).toBeVisible();
  });

  test("event without artifacts shows no card", async ({ page }) => {
    await page.goto(EVENT_WITHOUT_ARTIFACT);

    await expect(
      page.getByRole("link", { name: /Read the artifact/i }),
    ).toHaveCount(0);
    await expect(
      page.locator('section[aria-label="Related artifacts"]'),
    ).toHaveCount(0);
  });
});

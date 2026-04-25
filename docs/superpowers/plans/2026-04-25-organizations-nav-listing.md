# Organizations Nav Link + Listing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Organizations link to the site header nav and create the `/orgs/` listing page it points to, plus update the back-link on org detail pages.

**Architecture:** New Astro page at `src/pages/orgs/index.astro` loads the `organizations` collection, counts related events and artifacts per org at build time, and renders a two-column accent-card grid. Accent colour is derived from the existing `schema_type` field (`Organization` → blue, `GovernmentOrganization` → green). No new lib functions needed — all logic fits in the page frontmatter following existing patterns.

**Tech Stack:** Astro, Tailwind CSS, Playwright

**Spec:** `docs/superpowers/specs/2026-04-25-organizations-nav-listing-design.md`
**Issue:** [#23](https://github.com/jrhender/ai-governance-tracker/issues/23)

---

### Task 1: Update org detail back-link

**Files:**
- Modify: `src/pages/orgs/[id].astro`

- [ ] **Step 1: Update the back-link**

In `src/pages/orgs/[id].astro`, replace line 29:

```astro
    <a href="/timeline/" class="hover:underline">← Timeline</a>
```

with:

```astro
    <a href="/orgs/" class="hover:underline">← Organizations</a>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build completes with no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/orgs/\[id\].astro
git commit -m "Point org detail back-link to /orgs/ instead of /timeline/"
```

---

### Task 2: Add Organizations nav link

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add the nav link**

In `src/layouts/BaseLayout.astro`, replace the `<nav>` block (lines 40–49) with:

```astro
        <nav class="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <a href="/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Home
          </a>
          <a href="/timeline/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Timeline
          </a>
          <a href="/legislation/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Legislation
          </a>
          <a href="/orgs/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Organizations
          </a>
        </nav>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build completes with no errors

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add Organizations link to header nav (#23)"
```

---

### Task 3: Create /orgs/ listing page

**Files:**
- Create: `src/pages/orgs/index.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/orgs/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

const orgs = await getCollection("organizations");
const allEvents = await getCollection("events");
const allArtifacts = await getCollection("artifacts");

// Count events and artifacts per org
const eventCounts = new Map<string, number>();
const artifactCounts = new Map<string, number>();
for (const e of allEvents) {
  for (const o of e.data.organizations) {
    eventCounts.set(o.id.id, (eventCounts.get(o.id.id) ?? 0) + 1);
  }
}
for (const a of allArtifacts) {
  for (const o of a.data.organizations) {
    artifactCounts.set(o.id.id, (artifactCounts.get(o.id.id) ?? 0) + 1);
  }
}

// Sort orgs alphabetically by name
const sorted = [...orgs].sort((a, b) => a.data.name.localeCompare(b.data.name));

// Accent colour by schema_type
function accentClass(schemaType: string): string {
  return schemaType === "GovernmentOrganization"
    ? "border-l-4 border-emerald-500"
    : "border-l-4 border-blue-500";
}
---

<BaseLayout
  title="Organizations"
  description="Think tanks, government bodies, and advocacy groups tracked in this database."
>
  <h1 class="text-3xl font-bold tracking-tight">Organizations</h1>
  <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
    Think tanks, government bodies, and advocacy groups tracked in this database.
  </p>

  {sorted.length === 0 ? (
    <p class="mt-10 text-slate-500 dark:text-slate-400">
      No organizations tracked yet.
    </p>
  ) : (
    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sorted.map((org) => {
        const events = eventCounts.get(org.id) ?? 0;
        const artifacts = artifactCounts.get(org.id) ?? 0;
        return (
          <a
            href={`/orgs/${org.id}/`}
            class={`block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 ${accentClass(org.data.schema_type)}`}
          >
            {org.data.short_name && (
              <div class="text-lg font-bold">{org.data.short_name}</div>
            )}
            <div class={`text-sm text-slate-600 dark:text-slate-400 ${org.data.short_name ? "mt-0.5" : "font-semibold text-base text-slate-900 dark:text-slate-100"}`}>
              {org.data.name}
            </div>
            <div class="mt-3 text-xs text-slate-500 dark:text-slate-500">
              {[
                events > 0 && `${events} event${events === 1 ? "" : "s"}`,
                artifacts > 0 && `${artifacts} artifact${artifacts === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(" · ") || "No events yet"}
            </div>
            {org.data.tags.length > 0 && (
              <div class="mt-3 flex flex-wrap gap-1">
                {org.data.tags.map((t) => (
                  <span class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </a>
        );
      })}
    </div>
  )}
</BaseLayout>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build completes with no errors

- [ ] **Step 3: Verify locally in browser**

Run: `npx astro dev`
Visit `http://localhost:4321/orgs/` and confirm:
- Page renders with "Organizations" heading
- Three org cards appear in a two-column grid
- CIGI card has a blue left border; INDU and PCO cards have a green left border
- Each card shows short name (bold), full name, event/artifact counts, and tags
- Clicking a card navigates to `/orgs/[id]/`
- The org detail page now shows "← Organizations" back-link
- Header nav shows "Organizations" as the fourth link

- [ ] **Step 4: Commit**

```bash
git add src/pages/orgs/index.astro
git commit -m "Create /orgs/ listing page with two-column accent-card grid (#23)"
```

---

### Task 4: E2E tests

**Files:**
- Create: `e2e/organizations.spec.ts`

- [ ] **Step 1: Write the E2E tests**

Create `e2e/organizations.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("organizations page", () => {
  test("renders org cards", async ({ page }) => {
    await page.goto("/orgs/");
    await expect(
      page.getByRole("heading", { name: "Organizations", level: 1 }),
    ).toBeVisible();

    // At least one org card is visible
    const cards = page.locator("a[href^='/orgs/']");
    await expect(cards.first()).toBeVisible();
  });

  test("org card links to detail page", async ({ page }) => {
    await page.goto("/orgs/");
    await page.locator("a[href^='/orgs/']").first().click();
    await expect(page).toHaveURL(/\/orgs\/.+\//);
  });

  test("org detail page back-link points to /orgs/", async ({ page }) => {
    await page.goto("/orgs/cigi-global-ai-risks-initiative/");
    const backLink = page.getByRole("link", { name: "← Organizations" });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/orgs\/$/);
  });

  test("header nav contains Organizations link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Organizations" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/orgs\/$/);
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test e2e/organizations.spec.ts`
Expected: All 4 tests pass

- [ ] **Step 3: Run full test suite**

Run: `npx playwright test`
Expected: All tests pass (no regressions)

- [ ] **Step 4: Commit**

```bash
git add e2e/organizations.spec.ts
git commit -m "Add E2E tests for Organizations page and nav link (#23)"
```

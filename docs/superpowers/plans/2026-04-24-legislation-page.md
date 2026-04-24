# Legislation Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `/legislation/` index page, remove artifacts from the main timeline, and add a nav link.

**Architecture:** New Astro page filters the `artifacts` collection by `type === "Legislation"`. A pure helper function maps `lifecycle_status` to Tailwind badge classes (unit-testable). The main timeline is simplified to events-only. A new CIGI "report published" event preserves discoverability.

**Tech Stack:** Astro, Tailwind CSS, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-23-legislation-page-design.md`
**Issue:** [#21](https://github.com/jrhender/ai-governance-tracker/issues/21)

---

### Task 1: Badge colour helper

Extract the `lifecycle_status → Tailwind class` mapping into a testable pure function.

**Files:**
- Create: `src/lib/legislation.ts`
- Create: `src/lib/legislation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/legislation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { badgeClass } from "./legislation";

describe("badgeClass", () => {
  it("returns blue for active", () => {
    expect(badgeClass("active")).toBe("bg-blue-600 text-white");
  });

  it("returns green for enacted", () => {
    expect(badgeClass("enacted")).toBe("bg-green-600 text-white");
  });

  it("returns red for died", () => {
    expect(badgeClass("died")).toBe("bg-red-600 text-white");
  });

  it("returns grey for withdrawn", () => {
    expect(badgeClass("withdrawn")).toBe("bg-slate-500 text-white");
  });

  it("returns grey for undefined", () => {
    expect(badgeClass(undefined)).toBe("bg-slate-500 text-white");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/legislation.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/legislation.ts`:

```ts
const STATUS_CLASSES: Record<string, string> = {
  active: "bg-blue-600 text-white",
  enacted: "bg-green-600 text-white",
  died: "bg-red-600 text-white",
  withdrawn: "bg-slate-500 text-white",
};

export function badgeClass(status: string | undefined): string {
  return STATUS_CLASSES[status ?? ""] ?? "bg-slate-500 text-white";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/legislation.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/legislation.ts src/lib/legislation.test.ts
git commit -m "Add badgeClass helper for lifecycle_status badges"
```

---

### Task 2: Create the CIGI "report published" event

Add the new event data file so the CIGI report stays discoverable on the timeline after artifacts are removed.

**Files:**
- Create: `data/events/2026-02-06-cigi-pco-report-published.yaml`

- [ ] **Step 1: Create the event file**

Create `data/events/2026-02-06-cigi-pco-report-published.yaml`:

```yaml
# data/events/2026-02-06-cigi-pco-report-published.yaml

id: cigi-pco-report-published-2026
type: Publication
schema_type: Event
title: "CIGI publishes AI and National Security Scenarios Workshop Summary Report"
date: 2026-02-06

organizations:
  - id: cigi-global-ai-risks-initiative
    role: publisher

description: >
  The Global AI Risks Initiative at CIGI publishes the summary report
  from the AI National Security Scenarios Workshop co-hosted with the
  Privy Council Office of Canada.

related_artifacts:
  - id: cigi-pco-ai-national-security-report-2026

tags:
  - national-security
  - policy-recommendations
  - federal-government
  - cigi
  - privy-council-office

links:
  - label: "Publication Page"
    url: https://www.cigionline.org/publications/ai-national-security-scenarios/
    icon: document
```

- [ ] **Step 2: Verify the data loads**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build succeeds with no schema validation errors

- [ ] **Step 3: Commit**

```bash
git add data/events/2026-02-06-cigi-pco-report-published.yaml
git commit -m "Add CIGI report-published event for timeline discoverability"
```

---

### Task 3: Remove artifacts from the main timeline

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/lib/timeline.ts`

- [ ] **Step 1: Simplify TimelineItem kind type**

In `src/lib/timeline.ts`, change the `kind` field from `"event" | "artifact"` to just `"event"`:

```ts
export type TimelineItem = {
  id: string;
  kind: "event";
  title: string;
  date: string;
  description?: string;
  tags: string[];
  href: string;
  badge: string;
  orgIds: string[];
};
```

- [ ] **Step 2: Run existing unit tests to confirm no breakage**

Run: `npx vitest run src/lib/timeline.test.ts`
Expected: All 4 tests PASS (the test helper already uses `kind: "event"`)

- [ ] **Step 3: Remove artifacts from index.astro**

In `src/pages/index.astro`, replace the frontmatter (lines 1–62) with:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import TimelineWithFilter from "../components/TimelineWithFilter";
import type { TimelineItem, OrgOption } from "../lib/timeline";

const events = await getCollection("events");
const organizations = await getCollection("organizations");

// Build org lookup map: id -> { name, short_name }
const orgMap = new Map<string, { name: string; short_name?: string }>();
for (const org of organizations) {
  orgMap.set(org.id, { name: org.data.name, short_name: org.data.short_name });
}

const items: TimelineItem[] = events
  .map((e) => ({
    id: e.id,
    kind: "event" as const,
    title: e.data.title,
    date: e.data.date.toISOString(),
    description: e.data.description,
    tags: e.data.tags,
    href: `/events/${e.id}/`,
    badge: e.data.type,
    orgIds: e.data.organizations.map((o) => o.id.id),
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Build OrgOption list: only orgs that appear in at least one item
const orgCounts = new Map<string, number>();
for (const item of items) {
  for (const orgId of item.orgIds) {
    orgCounts.set(orgId, (orgCounts.get(orgId) ?? 0) + 1);
  }
}

const orgs: OrgOption[] = [];
for (const [orgId, count] of orgCounts.entries()) {
  const org = orgMap.get(orgId);
  if (!org) continue;
  orgs.push({
    id: orgId,
    label: org.short_name ?? org.name,
    count,
  });
}
// Sort orgs by count descending, then label ascending
orgs.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
---
```

- [ ] **Step 4: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/lib/timeline.ts src/pages/index.astro
git commit -m "Remove artifacts from main timeline (issue #21)"
```

---

### Task 4: Add navigation link

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add Legislation link to the header nav**

In `src/layouts/BaseLayout.astro`, replace the `<nav>` element (lines 40–44) with:

```astro
        <nav class="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <a href="/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Timeline
          </a>
          <a href="/legislation/" class="hover:text-slate-900 dark:hover:text-slate-100">
            Legislation
          </a>
        </nav>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add Legislation link to header nav"
```

---

### Task 5: Create the `/legislation/` index page

**Files:**
- Create: `src/pages/legislation/index.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/legislation/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { badgeClass } from "../../lib/legislation";

const artifacts = await getCollection("artifacts");
const legislation = artifacts
  .filter((a) => a.data.type === "Legislation")
  .sort(
    (a, b) =>
      b.data.published_date.getTime() - a.data.published_date.getTime(),
  );

const fmt = (d: Date) =>
  d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

const statusLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
---

<BaseLayout
  title="Legislation"
  description="Canadian AI-related bills and acts."
>
  <h1 class="text-3xl font-bold tracking-tight">Legislation</h1>
  <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
    Canadian AI-related bills and acts.
  </p>

  {legislation.length === 0 ? (
    <p class="mt-10 text-slate-500 dark:text-slate-400">
      No legislation tracked yet.
    </p>
  ) : (
    <div class="mt-10 space-y-4">
      {legislation.map((bill) => (
        <a
          href={`/artifacts/${bill.id}/`}
          class="block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
        >
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-lg font-semibold">{bill.data.title}</h2>
            {bill.data.lifecycle_status && (
              <span
                class={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass(bill.data.lifecycle_status)}`}
              >
                {statusLabel(bill.data.lifecycle_status)}
              </span>
            )}
          </div>
          {bill.data.current_stage && (
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {bill.data.current_stage}
            </p>
          )}
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Introduced: {fmt(bill.data.published_date)}
          </p>
        </a>
      ))}
    </div>
  )}
</BaseLayout>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Verify locally in browser**

Run: `npx astro dev`
Visit `http://localhost:4321/legislation/` and confirm:
- Page renders with "Legislation" heading
- Bill C-27 card shows with title, red "Died" badge, current_stage text, and introduction date
- Clicking the card navigates to `/artifacts/bill-c27-aida/`
- Main timeline at `/` no longer shows any artifact entries
- Header nav shows both "Timeline" and "Legislation" links

- [ ] **Step 4: Commit**

```bash
git add src/pages/legislation/index.astro
git commit -m "Create /legislation/ index page with card layout"
```

---

### Task 6: E2E tests

**Files:**
- Create: `e2e/legislation.spec.ts`
- Modify: `e2e/timeline.spec.ts`

- [ ] **Step 1: Write legislation page E2E tests**

Create `e2e/legislation.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("legislation page", () => {
  test("renders legislation cards with status badges", async ({ page }) => {
    await page.goto("/legislation/");
    const heading = page.getByRole("heading", { name: "Legislation", level: 1 });
    await expect(heading).toBeVisible();

    const billCard = page.getByRole("link", { name: /Bill C-27/i });
    await expect(billCard).toBeVisible();
    await expect(billCard).toContainText("Died");
    await expect(billCard).toContainText("Died on the Order Paper");
  });

  test("legislation card links to artifact detail page", async ({ page }) => {
    await page.goto("/legislation/");
    await page.getByRole("link", { name: /Bill C-27/i }).click();
    await expect(page).toHaveURL(/\/artifacts\/bill-c27-aida\//);
  });

  test("header nav contains Legislation link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Legislation" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/legislation\//);
  });
});
```

- [ ] **Step 2: Add timeline assertion that artifacts are absent**

In `e2e/timeline.spec.ts`, add a new test inside the existing `test.describe("timeline", ...)` block, after the last test:

```ts
  test("timeline does not contain artifact entries", async ({ page }) => {
    await page.goto("/");
    const items = timelineItems(page);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const badge = items.nth(i).locator("span").first();
      await expect(badge).not.toHaveText("Legislation");
      await expect(badge).not.toHaveText("Report");
    }
  });
```

- [ ] **Step 3: Run E2E tests**

Run: `npx playwright test`
Expected: All tests pass, including the new legislation and timeline tests

- [ ] **Step 4: Commit**

```bash
git add e2e/legislation.spec.ts e2e/timeline.spec.ts
git commit -m "Add E2E tests for legislation page and artifact-free timeline"
```

---

### Task 7: Update artifact detail page back link

The artifact detail page currently has a "← Timeline" back link. For legislation artifacts, this should point to `/legislation/` instead.

**Files:**
- Modify: `src/pages/artifacts/[id].astro`

- [ ] **Step 1: Update the back link**

In `src/pages/artifacts/[id].astro`, replace the back link (line 47–49):

```astro
  <p class="text-sm text-slate-500 dark:text-slate-400">
    <a href="/" class="hover:underline">← Timeline</a>
  </p>
```

with:

```astro
  <p class="text-sm text-slate-500 dark:text-slate-400">
    {data.type === "Legislation" ? (
      <a href="/legislation/" class="hover:underline">← Legislation</a>
    ) : (
      <a href="/" class="hover:underline">← Timeline</a>
    )}
  </p>
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx astro build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/artifacts/\[id\].astro
git commit -m "Point legislation artifact back link to /legislation/"
```

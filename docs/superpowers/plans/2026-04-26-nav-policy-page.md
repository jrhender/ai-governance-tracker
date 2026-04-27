# Nav & Policy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/legislation/` page and four-item nav with a single `/policy/` listing page covering all artifact types (Legislation, Reports, Policy Documents, Government Programs), a three-item mobile-responsive nav, and updated e2e tests.

**Architecture:** One new Astro page (`/policy/`) filters the `artifacts` collection into four sections by `type` field — same pattern as the existing `/legislation/` page. The nav is updated in `BaseLayout.astro` by removing Home and Legislation links, adding Policy, and adding `flex-wrap` to the header container for mobile. No new lib functions needed; `badgeClass`/`statusLabel` from `src/lib/legislation.ts` and `fmtDate` from `src/lib/format.ts` are reused as-is.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, Playwright (e2e)

---

### Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Ensure main is up to date and create branch**

```bash
git checkout main && git pull
git checkout -b feature/nav-policy-page
```

Expected: branch `feature/nav-policy-page` checked out.

---

### Task 2: Write failing e2e test for the Policy page

**Files:**
- Create: `e2e/policy.spec.ts`
- Delete: `e2e/legislation.spec.ts` (replaced)

- [ ] **Step 1: Create `e2e/policy.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test.describe("policy page", () => {
  test("renders page heading and all four sections", async ({ page }) => {
    await page.goto("/policy/");
    await expect(page.getByRole("heading", { name: "Policy", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Legislation", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reports", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Policy Documents", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Government Programs", level: 2 })).toBeVisible();
  });

  test("legislation card shows title, status badge, and stage", async ({ page }) => {
    await page.goto("/policy/");
    const card = page.getByRole("link", { name: /Bill C-27/i });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Died");
    await expect(card).toContainText("Died on the Order Paper");
  });

  test("legislation card links to artifact detail page", async ({ page }) => {
    await page.goto("/policy/");
    await page.getByRole("link", { name: /Bill C-27/i }).click();
    await expect(page).toHaveURL(/\/artifacts\/bill-c27-aida\//);
  });

  test("reports section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Reports" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("policy documents section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Policy Documents" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("government programs section shows at least one card", async ({ page }) => {
    await page.goto("/policy/");
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Government Programs" }) });
    await expect(section.getByRole("link").first()).toBeVisible();
  });

  test("header nav contains Policy link that navigates to /policy/", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    const link = nav.getByRole("link", { name: "Policy" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/policy\//);
  });

  test("header nav does not contain Home or Legislation links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Home" })).not.toBeVisible();
    await expect(nav.getByRole("link", { name: "Legislation" })).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Delete the old legislation spec**

```bash
git rm e2e/legislation.spec.ts
```

---

### Task 3: Update the homepage e2e test

**Files:**
- Modify: `e2e/homepage.spec.ts`

The homepage currently has a section card linking to `/legislation/`. That card will be updated to `/policy/` in Task 6. Update the test now so it reflects the intended state.

- [ ] **Step 1: Update the section cards test in `e2e/homepage.spec.ts`**

Replace this test:

```typescript
test("section cards link to /timeline/ and /legislation/", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("main").getByRole("link", { name: /Timeline/i }).first()
  ).toHaveAttribute("href", "/timeline/");
  await expect(
    page.locator("main").getByRole("link", { name: /Legislation/i }).first()
  ).toHaveAttribute("href", "/legislation/");
});
```

With:

```typescript
test("section cards link to /timeline/ and /policy/", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("main").getByRole("link", { name: /Timeline/i }).first()
  ).toHaveAttribute("href", "/timeline/");
  await expect(
    page.locator("main").getByRole("link", { name: /Policy/i }).first()
  ).toHaveAttribute("href", "/policy/");
});
```

---

### Task 4: Build and confirm tests fail

**Files:** none (verification only)

- [ ] **Step 1: Build the site**

```bash
pnpm build
```

Expected: build succeeds (existing pages still intact).

- [ ] **Step 2: Run the new e2e tests**

```bash
pnpm exec playwright test e2e/policy.spec.ts e2e/homepage.spec.ts
```

Expected: all policy.spec.ts tests FAIL (page doesn't exist, nav unchanged). The updated homepage test also FAILs. This confirms tests are correctly written and pointing at the right things.

---

### Task 5: Create `src/pages/policy/index.astro`

**Files:**
- Create: `src/pages/policy/index.astro`

- [ ] **Step 1: Create the file**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { badgeClass, statusLabel } from "../../lib/legislation";
import { fmtDate } from "../../lib/format";

const artifacts = await getCollection("artifacts");

function byDateDesc(a: { data: { published_date: Date } }, b: { data: { published_date: Date } }) {
  return b.data.published_date.getTime() - a.data.published_date.getTime();
}

const legislation = artifacts.filter((a) => a.data.type === "Legislation").sort(byDateDesc);
const reports     = artifacts.filter((a) => a.data.type === "Report").sort(byDateDesc);
const policyDocs  = artifacts.filter((a) => a.data.type === "PolicyDocument").sort(byDateDesc);
const govPrograms = artifacts.filter((a) => a.data.type === "GovernmentProgram").sort(byDateDesc);
---

<BaseLayout
  title="Policy"
  description="Canadian AI legislation, reports, policy documents, and government programs."
>
  <h1 class="text-3xl font-bold tracking-tight">Policy</h1>

  {legislation.length > 0 && (
    <section class="mt-10">
      <h2 class="text-xl font-semibold">Legislation</h2>
      <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
        Canadian federal bills and acts related to artificial intelligence. Each entry tracks
        the bill's lifecycle — from introduction through readings, committee study, and royal
        assent (or death on the order paper).
      </p>
      <div class="mt-6 space-y-4">
        {legislation.map((bill) => (
          <a
            href={`/artifacts/${bill.id}/`}
            class="block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-semibold">{bill.data.title}</h3>
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
              Introduced: {fmtDate(bill.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {reports.length > 0 && (
    <section class="mt-10">
      <h2 class="text-xl font-semibold">Reports</h2>
      <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
        Research reports and analytical summaries published by think tanks, government
        agencies, and advisory bodies. These documents examine AI risks, policy options,
        and strategic considerations for Canada.
      </p>
      <div class="mt-6 space-y-4">
        {reports.map((r) => (
          <a
            href={`/artifacts/${r.id}/`}
            class="block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <h3 class="text-lg font-semibold">{r.data.title}</h3>
            {r.data.description && (
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {r.data.description}
              </p>
            )}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-500">
              Published: {fmtDate(r.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {policyDocs.length > 0 && (
    <section class="mt-10">
      <h2 class="text-xl font-semibold">Policy Documents</h2>
      <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
        Voluntary codes of conduct, frameworks, and guidelines issued by government or
        industry bodies. These set expectations for responsible AI development and
        deployment without carrying the force of law.
      </p>
      <div class="mt-6 space-y-4">
        {policyDocs.map((d) => (
          <a
            href={`/artifacts/${d.id}/`}
            class="block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <h3 class="text-lg font-semibold">{d.data.title}</h3>
            {d.data.description && (
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {d.data.description}
              </p>
            )}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-500">
              Published: {fmtDate(d.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {govPrograms.length > 0 && (
    <section class="mt-10">
      <h2 class="text-xl font-semibold">Government Programs</h2>
      <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
        Ongoing federal programs and national strategies related to artificial intelligence.
        These represent long-term government commitments and investments rather than
        one-off publications.
      </p>
      <div class="mt-6 space-y-4">
        {govPrograms.map((p) => (
          <a
            href={`/artifacts/${p.id}/`}
            class="block rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <h3 class="text-lg font-semibold">{p.data.title}</h3>
            {p.data.description && (
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {p.data.description}
              </p>
            )}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-500">
              Published: {fmtDate(p.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}
</BaseLayout>
```

---

### Task 6: Update `BaseLayout.astro` nav

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Update the header container and nav links**

The header `<div>` currently reads:
```html
<div
  class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4"
>
```

Change to:
```html
<div
  class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-y-2 px-6 py-4"
>
```

Then replace the entire `<nav>` block:

```html
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

With:

```html
<nav class="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
  <a href="/timeline/" class="hover:text-slate-900 dark:hover:text-slate-100">
    Timeline
  </a>
  <a href="/orgs/" class="hover:text-slate-900 dark:hover:text-slate-100">
    Organizations
  </a>
  <a href="/policy/" class="hover:text-slate-900 dark:hover:text-slate-100">
    Policy
  </a>
</nav>
```

---

### Task 7: Update homepage card

**Files:**
- Modify: `src/pages/index.astro`

The homepage has a section card grid linking to `/timeline/` and `/legislation/`. Update the Legislation card to link to `/policy/`.

- [ ] **Step 1: Replace the Legislation card**

Replace:
```html
<a
  href="/legislation/"
  class="rounded-lg border border-slate-200 p-5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
>
  <h2 class="font-semibold">Legislation</h2>
  <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
    Bills and acts tracked through Parliament.
  </p>
</a>
```

With:
```html
<a
  href="/policy/"
  class="rounded-lg border border-slate-200 p-5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
>
  <h2 class="font-semibold">Policy</h2>
  <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
    Legislation, reports, and policy documents.
  </p>
</a>
```

---

### Task 8: Delete the old legislation page

**Files:**
- Delete: `src/pages/legislation/index.astro`

- [ ] **Step 1: Remove the file**

```bash
git rm src/pages/legislation/index.astro
```

---

### Task 9: Build, run all tests, and commit

**Files:** none (verification + commit)

- [ ] **Step 1: Run unit tests**

```bash
pnpm test
```

Expected: all pass (no unit tests were changed).

- [ ] **Step 2: Build the site**

```bash
pnpm build
```

Expected: build succeeds with no TypeScript or Astro errors.

- [ ] **Step 3: Run all e2e tests**

```bash
pnpm exec playwright test
```

Expected: all tests pass, including the new `policy.spec.ts` and updated `homepage.spec.ts`. Verify there are no references to the old `/legislation/` URL in the test output.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro \
        src/pages/policy/index.astro \
        src/pages/index.astro \
        e2e/policy.spec.ts \
        e2e/homepage.spec.ts
git commit -m "$(cat <<'EOF'
Add Policy page and update nav (issue #36)

- Replace /legislation/ with /policy/ — a single listing page covering
  Legislation, Reports, Policy Documents, and Government Programs
- Remove Home and Legislation from nav; add Policy; make nav mobile-
  responsive with flex-wrap on the header container
- Update homepage section card to link to /policy/
- Replace e2e/legislation.spec.ts with e2e/policy.spec.ts

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

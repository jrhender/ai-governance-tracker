# Playwright e2e + CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Playwright browser tests (4 timeline behaviors + 1 axe scan) plus a parallel `e2e` CI job that runs on every PR.

**Architecture:** Playwright at repo root with `testDir: "e2e"`, a `webServer` config that auto-starts `pnpm preview`, and chromium-only. Tests exercise the real production bundle. CI job caches browser binaries, runs in parallel with the existing `unit` job, uploads report on failure. Vitest is updated to ignore `e2e/`.

**Tech Stack:** `@playwright/test`, `@axe-core/playwright`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-04-22-playwright-e2e-design.md`

**Note on TDD:** The app already works — this plan backfills e2e tests against existing behavior. For each test: write, run, verify it **passes** against the current implementation. Tasks 4 and 5 include optional sanity-break steps to confirm the tests would catch a regression.

**Fixture data the tests rely on** (from `data/organizations/`): org IDs `cigi-global-ai-risks-initiative`, `house-of-commons-indu-committee`, `privy-council-office-canada` with short names `CIGI`, `INDU`. Tests use `CIGI` as the illustrative filter.

---

## File Structure

**Create:**
- `playwright.config.ts` — Playwright config (root)
- `e2e/timeline.spec.ts` — filter behavior tests (4)
- `e2e/a11y.spec.ts` — axe scan (1)

**Modify:**
- `package.json` — add `@playwright/test`, `@axe-core/playwright`, `test:e2e` script
- `vitest.config.ts` — add `test.exclude` for `e2e/**`
- `.gitignore` — add `playwright-report/` and `test-results/`
- `README.md` — add "End-to-end tests" paragraph
- `.github/workflows/test.yml` — add `e2e` job

---

### Task 1: Install Playwright + axe, add script, update gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install devDependencies**

Run:
```bash
pnpm add -D @playwright/test @axe-core/playwright
```

Expected: both packages appear under `devDependencies` in `package.json`; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Install chromium browser binary**

Run:
```bash
pnpm exec playwright install chromium
```

Expected: chromium binaries downloaded to `~/.cache/ms-playwright/`. (First-time install; subsequent runs use cache.)

- [ ] **Step 3: Add `test:e2e` script**

Edit `package.json` scripts block to include:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "astro build && playwright test"
},
```

- [ ] **Step 4: Update `.gitignore`**

Append:

```
playwright-report/
test-results/
```

(Result after edit — full `.gitignore`:)

```
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.DS_Store
.claude/settings.local.json
CLAUDE.local.md
playwright-report/
test-results/
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "Add Playwright + axe devDependencies and test:e2e script"
```

---

### Task 2: Playwright config

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: [["html"]],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

- [ ] **Step 2: Sanity-check the config loads**

Run: `pnpm exec playwright test --list`
Expected: `Listing tests: 0 tests in 0 files` (or similar — no tests yet, but the config parses and chromium resolves).

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "Add Playwright config with chromium-only and webServer auto-start"
```

---

### Task 3: Exclude `e2e/` from Vitest

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add `exclude` to the Vitest config**

Replace the contents of `vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
```

- [ ] **Step 2: Verify Vitest still finds the 7 unit tests**

Run: `pnpm test`
Expected: `Test Files 2 passed (2)`, `Tests 7 passed (7)`.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "Exclude e2e/ from Vitest so Playwright specs don't clash"
```

---

### Task 4: Timeline behavior tests

**Files:**
- Create: `e2e/timeline.spec.ts`

- [ ] **Step 1: Write the spec file**

```ts
import { test, expect } from "@playwright/test";

const CIGI_ID = "cigi-global-ai-risks-initiative";

test.describe("timeline", () => {
  test("homepage loads and renders timeline items", async ({ page }) => {
    await page.goto("/");
    const items = page.locator("ol > li");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });

  test("clicking an org pill narrows the list and updates the URL", async ({
    page,
  }) => {
    await page.goto("/");
    const initialCount = await page.locator("ol > li").count();

    await page.getByRole("button", { name: /CIGI/ }).click();

    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));
    const filteredCount = await page.locator("ol > li").count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("browser Back restores the previous filter state", async ({ page }) => {
    await page.goto("/");
    const initialCount = await page.locator("ol > li").count();

    await page.getByRole("button", { name: /CIGI/ }).click();
    await expect(page).toHaveURL(new RegExp(`\\?org=${CIGI_ID}$`));

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await page.locator("ol > li").count()).toBe(initialCount);
  });

  test("invalid ?org= shows all items and cleans the URL", async ({ page }) => {
    await page.goto("/?org=bogus-xyz");

    await expect(page).toHaveURL(/\/$/);
    const items = page.locator("ol > li");
    expect(await items.count()).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
```

- [ ] **Step 2: Run the tests — confirm they pass against the live app**

Run: `pnpm test:e2e`
Expected: `4 passed`. (`astro build` runs first, then Playwright auto-starts `pnpm preview`, runs chromium, shuts down.)

- [ ] **Step 3: Sanity-break, confirm a test fails**

Temporarily edit `src/components/TimelineWithFilter.tsx` Step 4's `handleSelect` — change `history.pushState({}, "", url);` to `history.replaceState({}, "", url);`. This breaks the "Back restores state" test.

Run: `pnpm test:e2e -g "Back restores"`
Expected: that test fails (Back no longer returns to `/` because we replaced instead of pushed).

- [ ] **Step 4: Revert the sanity break**

Restore `history.pushState({}, "", url);` in `TimelineWithFilter.tsx`.

Run: `pnpm test:e2e`
Expected: all 4 pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/timeline.spec.ts
git commit -m "Add Playwright tests for timeline filter behavior"
```

---

### Task 5: Accessibility smoke test

**Files:**
- Create: `e2e/a11y.spec.ts`

- [ ] **Step 1: Write the spec file**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no axe-detectable a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: Run the test — confirm it passes**

Run: `pnpm test:e2e e2e/a11y.spec.ts`
Expected: `1 passed`.

(If axe reports violations, stop and report. The spec assumes the current UI is clean — if it's not, that's a real finding worth surfacing rather than papering over.)

- [ ] **Step 3: Run the full e2e suite**

Run: `pnpm test:e2e`
Expected: `5 passed` across 2 files.

- [ ] **Step 4: Commit**

```bash
git add e2e/a11y.spec.ts
git commit -m "Add axe-core accessibility smoke test"
```

---

### Task 6: README "End-to-end tests" section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a paragraph under the existing "Running tests" section**

Edit `README.md` — after the `Tests live alongside the source files they cover...` line, before `## License`, add:

```markdown
### End-to-end tests

Browser tests run with [Playwright](https://playwright.dev/) against the production build.

```bash
pnpm test:e2e              # build + run all e2e tests
pnpm exec playwright test  # skip the build (assumes dist/ is fresh)
```

The HTML report lands in `playwright-report/` (gitignored). Specs live in `e2e/`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Document how to run Playwright e2e tests"
```

---

### Task 7: GitHub Actions e2e job

**Files:**
- Modify: `.github/workflows/test.yml`

- [ ] **Step 1: Add the `e2e` job alongside `unit`**

Replace the contents of `.github/workflows/test.yml` with:

```yaml
name: Test

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm test

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ hashFiles('pnpm-lock.yaml') }}

      - if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: pnpm exec playwright install --with-deps chromium

      - if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: pnpm exec playwright install-deps chromium

      - run: pnpm test:e2e

      - if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "Add e2e job to CI workflow"
```

- [ ] **Step 3: Push and verify in CI**

Run:
```bash
git push -u origin feature/playwright-e2e
```

Expected: open a PR. Both `Test / unit` and `Test / e2e` checks appear. Both should go green. If `e2e` fails, the HTML report will be available as a `playwright-report` artifact on the run's summary page.

---

## Acceptance checklist

- [ ] `pnpm test:e2e` runs and reports 5 passing tests locally
- [ ] `pnpm test` still reports 7 passing (Vitest not confused by `e2e/`)
- [ ] `playwright-report/` and `test-results/` gitignored
- [ ] `playwright.config.ts` exists with chromium-only + `webServer` auto-start
- [ ] PR shows passing `Test / unit` and `Test / e2e` checks
- [ ] README documents `pnpm test:e2e`
- [ ] Issue #5: all Playwright acceptance items ticked off; issue closed on merge

---

## Post-merge follow-up

Write an ADR at `docs/adr/NNNN-testing-stack.md` covering the full testing stack (Vitest + Playwright + CI), distilled from the two PR specs. The ADR captures the durable decisions ("Vitest for unit/component, happy-dom, Playwright + chromium-only for e2e, single GitHub Actions workflow") — the specs themselves stay as historical detail.

# Vitest Unit Tests + CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Vitest unit/component testing with a GitHub Actions check on every PR. Covers `filterByOrg` (4 cases) and `OrgFilter` (3 cases).

**Architecture:** Vitest at the repo root with happy-dom and `@vitejs/plugin-react` for JSX. Tests colocated next to source. Single CI job on Node 22 running `pnpm test`. Astro config untouched.

**Tech Stack:** Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, happy-dom, pnpm, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-04-21-vitest-unit-tests-design.md`

---

## File Structure

**Create:**
- `vitest.config.ts` — Vitest config (root)
- `src/test/setup.ts` — registers jest-dom matchers
- `src/lib/timeline.test.ts` — `filterByOrg` tests
- `src/components/OrgFilter.test.tsx` — `OrgFilter` tests
- `.github/workflows/test.yml` — CI unit job

**Modify:**
- `package.json` — add devDeps, `test` / `test:watch` scripts, `packageManager` field
- `README.md` — add "Running tests" section

**Note on TDD:** The source files `timeline.ts` and `OrgFilter.tsx` already exist — this plan backfills tests against existing code, so the red-then-green flow is inverted. For each test task: write the test, run it, verify it **passes** against the existing implementation. Then (optionally) briefly break the production code to confirm the test would actually catch the regression, then revert. This keeps the TDD discipline of "test actually tests the thing" without pretending the production code doesn't exist.

---

### Task 1: Install dependencies and pin pnpm

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install devDependencies**

Run:
```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

Expected: `pnpm-lock.yaml` updated, `node_modules` populated. All six packages appear under `devDependencies` in `package.json`.

- [ ] **Step 2: Add `packageManager` field and test scripts**

Edit `package.json` — add `packageManager` field and two scripts. The `scripts` block should read:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest"
},
```

Add a top-level `"packageManager": "pnpm@10.33.0"` (matches local pnpm version; adjust if `pnpm --version` reports different).

- [ ] **Step 3: Verify install + scripts**

Run: `pnpm test --help`
Expected: Vitest CLI help prints (confirms the `test` script resolves to Vitest).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Add Vitest + RTL devDependencies and pin pnpm"
```

---

### Task 2: Vitest config + setup file

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Run Vitest to confirm it starts (no tests yet)**

Run: `pnpm test`
Expected: Vitest exits 0 with "No test files found" (or similar). Config loads without error.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts src/test/setup.ts
git commit -m "Add Vitest config with happy-dom and React plugin"
```

---

### Task 3: `filterByOrg` tests

**Files:**
- Test: `src/lib/timeline.test.ts`

- [ ] **Step 1: Write the test file**

```ts
import { describe, it, expect } from "vitest";
import { filterByOrg, type TimelineItem } from "./timeline";

function make(id: string, orgIds: string[]): TimelineItem {
  return {
    id,
    kind: "event",
    title: id,
    date: "2026-01-01",
    tags: [],
    href: "#",
    badge: "Event",
    orgIds,
  };
}

describe("filterByOrg", () => {
  const items: TimelineItem[] = [
    make("a", ["senate"]),
    make("b", ["senate", "indu"]),
    make("c", ["cigi"]),
  ];

  it("returns all items when orgId is null", () => {
    expect(filterByOrg(items, null)).toEqual(items);
  });

  it("returns [] when orgId is unknown", () => {
    expect(filterByOrg(items, "nope")).toEqual([]);
  });

  it("matches items whose orgIds includes the selected org (multi-org item)", () => {
    const result = filterByOrg(items, "indu");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("returns [] for empty input", () => {
    expect(filterByOrg([], "senate")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests — confirm they pass against existing implementation**

Run: `pnpm test src/lib/timeline.test.ts`
Expected: 4 tests pass.

- [ ] **Step 3: Sanity-break the implementation, confirm a test fails**

Temporarily edit `src/lib/timeline.ts` line 23 — change `if (!orgId) return items;` to `if (!orgId) return [];`.

Run: `pnpm test src/lib/timeline.test.ts`
Expected: the "returns all items when orgId is null" test fails.

- [ ] **Step 4: Revert the sanity break**

Restore line 23 to `if (!orgId) return items;`.

Run: `pnpm test src/lib/timeline.test.ts`
Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/timeline.test.ts
git commit -m "Add filterByOrg tests"
```

---

### Task 4: `OrgFilter` tests

**Files:**
- Test: `src/components/OrgFilter.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrgFilter from "./OrgFilter";
import type { OrgOption } from "../lib/timeline";

const orgs: OrgOption[] = [
  { id: "senate", label: "Senate", count: 3 },
  { id: "cigi", label: "CIGI", count: 2 },
];

describe("OrgFilter", () => {
  it("calls onSelect with the org id when a pill is clicked", async () => {
    const onSelect = vi.fn();
    render(<OrgFilter orgs={orgs} selected={null} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /CIGI/ }));

    expect(onSelect).toHaveBeenCalledWith("cigi");
  });

  it("calls onSelect(null) when the All pill is clicked", async () => {
    const onSelect = vi.fn();
    render(<OrgFilter orgs={orgs} selected="senate" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("sets aria-pressed='true' on exactly the active pill", () => {
    render(<OrgFilter orgs={orgs} selected="senate" onSelect={() => {}} />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /Senate/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /CIGI/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
```

- [ ] **Step 2: Run the tests — confirm they pass against existing component**

Run: `pnpm test src/components/OrgFilter.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 3: Sanity-break, confirm a test fails**

Temporarily edit `src/components/OrgFilter.tsx` — change `aria-pressed={selected === org.id}` to `aria-pressed={false}` on the org pill buttons.

Run: `pnpm test src/components/OrgFilter.test.tsx`
Expected: the aria-pressed test fails.

- [ ] **Step 4: Revert the sanity break**

Restore `aria-pressed={selected === org.id}`.

Run: `pnpm test src/components/OrgFilter.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Run the full suite**

Run: `pnpm test`
Expected: 7 tests pass across 2 files.

- [ ] **Step 6: Commit**

```bash
git add src/components/OrgFilter.test.tsx package.json pnpm-lock.yaml
git commit -m "Add OrgFilter component tests"
```

---

### Task 5: README "Running tests" section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the section**

Append this block to `README.md` (or insert above any existing "Deployment" / "License" heading — pick the natural spot):

```markdown
## Running tests

Unit and component tests run with [Vitest](https://vitest.dev/).

```bash
pnpm test          # run once
pnpm test:watch    # re-run on file changes
```

Tests live alongside the source files they cover (`foo.test.ts` next to `foo.ts`).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Document how to run tests"
```

---

### Task 6: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: Test

on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm test
```

`pnpm/action-setup@v4` reads the pnpm version from the `packageManager` field in `package.json` — no `version:` input needed.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "Add GitHub Actions workflow to run unit tests on PRs"
```

- [ ] **Step 3: Verify in CI**

Push the branch and open a PR. The Test check should appear, install deps, and pass.

Expected: PR shows a green "Test / unit" check. If it fails, read the logs — most likely causes are a pnpm version mismatch (fix: update `packageManager`) or a missing cache hit (not an error, just a warning).

---

## Acceptance checklist

- [ ] `pnpm test` runs and reports 7 passing tests locally
- [ ] `packageManager` pinned in `package.json`
- [ ] `vitest.config.ts` and `src/test/setup.ts` exist
- [ ] `README.md` documents `pnpm test`
- [ ] PR shows a passing "Test / unit" GitHub Actions check
- [ ] Issue #5 updated: PR 1 items ticked off, Playwright/CI-e2e items remain for PR 2

---

## Post-merge follow-ups

- PR 2 (Playwright + e2e CI job) — tracked in issue #5.
- After PR 2 lands, write an ADR under `docs/adr/` covering the full testing stack (Vitest + Playwright + CI).

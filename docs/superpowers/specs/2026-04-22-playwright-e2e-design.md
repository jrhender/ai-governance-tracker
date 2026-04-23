# Playwright e2e + CI — Design

**Status:** approved
**Scope:** PR 2 of the testing rollout tracked in issue #5.
**Depends on:** PR 1 (#8) — Vitest unit tests + CI unit job, already merged.

## Goal

Add browser-based end-to-end tests for the timeline filter UI, plus a parallel CI job that runs them on every PR. Covers the behaviors that happy-dom can't exercise: real URL updates, browser history, SSR output via `astro preview`, and basic accessibility.

## Non-goals

- Hydration-mismatch detection via `console.error` scraping — dropped. Prod bundles served by `astro preview` don't emit hydration warnings, and the PR #4 timezone fix already made date rendering deterministic. YAGNI.
- Multi-browser testing — chromium only. Cloudflare Workers serves one bundle; cross-browser coverage earns its keep in libraries, not in this app.
- Visual regression / screenshot testing — deferred.
- Running Playwright tests against `astro dev` — `preview` matches prod more closely.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Runner | `@playwright/test` | Standard for Node + browser; has built-in `webServer`, cache-friendly install |
| Accessibility | `@axe-core/playwright` | Wraps axe-core with a Playwright-native API |
| Browser | Chromium only | Single runtime target; more browsers = more CI minutes for low marginal value |
| Test dir | `e2e/` at repo root | Flat, easy Vitest exclude, matches Playwright scaffold default |

## Config

`playwright.config.ts` at repo root:

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

`vitest.config.ts` — add `exclude` to prevent Vitest from picking up Playwright specs:

```ts
test: {
  environment: "happy-dom",
  globals: true,
  setupFiles: ["src/test/setup.ts"],
  exclude: ["e2e/**", "node_modules/**", "dist/**"],
}
```

(Vitest's default `exclude` already covers `node_modules` and `dist`, but being explicit keeps the intent obvious.)

## Tests

All five specs live in `e2e/`:

### `e2e/timeline.spec.ts` — browser behavior

1. **Homepage loads and renders items.** Navigate to `/`; assert at least one item heading is visible.
2. **Filter narrows list and updates URL.** Click an org pill; assert URL becomes `?org=<id>` and the visible item count drops (or a non-matching item disappears).
3. **Back restores filter state.** After (2), click browser Back; assert URL returns to `/` and the full list re-renders with the "All" pill active (`aria-pressed="true"`).
4. **Invalid `?org=` cleans URL.** Navigate to `/?org=bogus-xyz`; assert the full list renders and the URL is rewritten to `/`.

### `e2e/a11y.spec.ts` — accessibility smoke

5. **Axe scan of the homepage returns no violations.** Uses `@axe-core/playwright` with the default ruleset.

No custom fixtures; the built-in `page` fixture suffices.

## Scripts

Added to `package.json`:

- `test:e2e`: `astro build && playwright test`

The `astro build` prefix keeps `dist/` fresh before `webServer` boots `pnpm preview`. A 15-second rebuild on every run is noise compared to test execution itself.

## CI workflow

New `e2e` job added to `.github/workflows/test.yml`, running in parallel with `unit`:

```yaml
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

Notes:
- Browser binaries cache under `~/.cache/ms-playwright`; system libs aren't cached, so `install-deps` still runs on cache hit.
- The existing top-level `concurrency` group (added in PR 1) covers both jobs — a superseded push cancels both `unit` and `e2e`.
- `retention-days: 7` bounds storage on failed-run reports.

## Documentation

- Add a short "End-to-end tests" paragraph to `README.md` under the existing "Running tests" section: how to run `pnpm test:e2e` locally, note that it builds first, and where the HTML report lands.
- `playwright-report/` should be gitignored.

## Acceptance

- [ ] Playwright + axe installed; `pnpm test:e2e` runs and passes locally
- [ ] `playwright.config.ts` exists with the shape above
- [ ] `vitest.config.ts` excludes `e2e/**`
- [ ] `playwright-report/` in `.gitignore`
- [ ] 4 timeline tests + 1 axe test pass
- [ ] `Test / e2e` GitHub Actions check goes green on the PR
- [ ] README documents `pnpm test:e2e`
- [ ] Issue #5 updated: all Playwright acceptance items ticked off, full issue closed

## Follow-up after merge

- Write an ADR under `docs/adr/` covering the full testing stack (Vitest + Playwright + CI), distilled from the two PR specs.

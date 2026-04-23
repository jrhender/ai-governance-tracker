# 0004 — Testing stack: Vitest + Playwright

Date: 2026-04-23
Status: Accepted

## Context

The repo had no tests through its first several features. Surfaced during code review of PR #4 (org filter UI): there was no way to unit-test the pure filter helper, and no way to catch SSR/hydration regressions from the client-side filter state. The filter bug classes we'd already caught by hand — invalid `?org=` URLs, Back/Forward state, timezone-driven hydration drift — were exactly the kind a test suite should catch automatically.

The project is an Astro 5 static site with React 19 islands, deployed to Cloudflare Pages (ADR-0003). Content is YAML; there is no server, no database, and no per-user state. The only runtime target is the Cloudflare edge serving a pre-built bundle.

## Decision

Two layers of tests, one CI workflow.

### Layer 1 — Unit / component: **Vitest**

- `vitest` runner with `happy-dom` as the DOM implementation
- `@testing-library/react` + `@testing-library/jest-dom` for React island tests
- `@vitejs/plugin-react` for JSX transform (Astro's Vite config doesn't apply when Vitest runs)
- Tests colocated with source: `foo.test.ts` next to `foo.ts`
- Scripts: `pnpm test`, `pnpm test:watch`
- `@vitejs/plugin-react` pinned to `^4` because v6 requires Vite 8 and Astro 5 ships Vite 6

### Layer 2 — End-to-end: **Playwright**

- `@playwright/test` with chromium only
- `@axe-core/playwright` for basic accessibility smoke tests
- Specs live under `e2e/` at repo root; Vitest is configured to exclude `e2e/**`
- `playwright.config.ts` uses the built-in `webServer` option to auto-start `pnpm preview` against `http://localhost:4321`, with `reuseExistingServer: !process.env.CI` so local re-runs cooperate with an already-running preview
- Script: `pnpm test:e2e` runs `astro build && playwright test`
- Tests use role-based queries (`getByRole("list", { name: /timeline/i })`, `getByRole("button", { name: /CIGI/ })`) rather than CSS selectors, so DOM restructuring doesn't silently break them

### CI — GitHub Actions

`.github/workflows/test.yml` runs on every `pull_request` and on `push` to `main`, with a `concurrency` group that cancels superseded runs. Two parallel jobs:

1. **unit** — `pnpm install --frozen-lockfile && pnpm test` (Node 22, `timeout-minutes: 10`)
2. **e2e** — installs Playwright browsers with caching on `~/.cache/ms-playwright` keyed on `pnpm-lock.yaml`, then `pnpm test:e2e`. Uploads `playwright-report/` as an artifact on failure. (`timeout-minutes: 15`)

pnpm version is pinned via the `packageManager` field in `package.json`, so `pnpm/action-setup@v4` and local Corepack resolve to the same version.

## Alternatives considered

**jsdom instead of happy-dom:** jsdom is the older, more spec-complete option. happy-dom is ~2–3× faster and sufficient for component-level tests. For this project's surface area, the speed wins and the spec gap is immaterial.

**Jest instead of Vitest:** Jest requires more configuration to coexist with Vite/Astro's module graph. Vitest is Vite-native and Astro-recommended, and the API is a near-drop-in superset of Jest.

**Multi-browser e2e (Firefox, WebKit):** Rejected. The app ships a single bundle to Cloudflare's edge; there is no browser-specific code path worth exercising in CI. Cross-browser coverage earns its keep in libraries and in apps with device-specific features — neither applies here.

**Running e2e against `astro dev` instead of `astro preview`:** Dev server emits hydration warnings and uses an un-minified bundle. Preview serves the production bundle, matching what users will actually see. Preview wins.

**Hydration-mismatch detection via `console.error` scraping:** Considered in issue #5 and dropped. Production bundles served by `astro preview` don't emit hydration warnings at all, and the timezone fix in PR #4 already made date rendering deterministic. The behavioral e2e tests cover the real regressions.

**Visual regression / screenshot testing:** Deferred. The current UI is small enough that a well-written a11y + behavior suite catches meaningful regressions. Revisit if the UI grows or if visual polish becomes load-bearing.

**Coverage reporting:** Skipped in the initial rollout. With only two targeted modules under test, coverage numbers would be noise and any threshold would be arbitrary. Revisit once the suite is substantive enough for the numbers to be meaningful.

## Consequences

- Every PR runs both test layers before merge.
- Adding a new React island: colocate a `.test.tsx` file using `@testing-library/react` patterns. Query by role, not by DOM structure.
- Adding a new e2e spec: add under `e2e/`, follow the role-based selector convention, assume the production bundle (not dev).
- The Playwright browser binary cache (`~/.cache/ms-playwright`) is keyed on `pnpm-lock.yaml`; changing Playwright's version invalidates the cache, which is correct.
- First local `pnpm test:e2e` after cloning requires `pnpm exec playwright install chromium` (Playwright prompts for this on first run).
- If the project ever grows Firefox- or WebKit-specific concerns (e.g., a WebKit-only input bug), the chromium-only decision should be revisited rather than worked around.

## References

- Spec: `docs/superpowers/specs/2026-04-21-vitest-unit-tests-design.md`
- Spec: `docs/superpowers/specs/2026-04-22-playwright-e2e-design.md`
- PRs: #8 (Vitest + unit CI), #9 (Playwright + e2e CI)
- Tracking issue: #5

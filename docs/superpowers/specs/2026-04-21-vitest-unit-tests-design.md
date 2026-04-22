# Vitest unit/component tests + CI — Design

**Status:** approved
**Scope:** PR 1 of the testing rollout tracked in issue #5.
**Out of scope (PR 2):** Playwright e2e, axe accessibility scan, e2e CI job.

## Goal

Stand up a unit/component test framework for the repo and run it on every PR. After this lands, `src/lib/timeline.ts` and `src/components/OrgFilter.tsx` have tests, and any subsequent PR that breaks them fails the GitHub check.

## Non-goals

- Coverage reporting (deferred until the suite is big enough for coverage numbers to mean something).
- End-to-end / browser tests (PR 2).
- Test matrix across Node versions (app targets a single runtime — Cloudflare Workers).
- Switching the repo from pnpm to npm.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Test runner | Vitest | Vite-native, Astro-recommended, fast |
| DOM | happy-dom | Lighter than jsdom; sufficient for component tests |
| React testing | `@testing-library/react` + `@testing-library/jest-dom` | Standard; works in happy-dom |
| JSX transform in tests | `@vitejs/plugin-react` | Astro's Vite config doesn't apply when Vitest runs, so the plugin is needed explicitly |
| Package manager | pnpm | Matches existing `pnpm-lock.yaml` |
| pnpm version pinning | `packageManager` field in `package.json` | Corepack reads it locally; `pnpm/action-setup@v4` reads it in CI — one source of truth |

## Config

- `vitest.config.ts` at repo root:
  - `plugins: [react()]`
  - `test.environment: "happy-dom"`
  - `test.globals: true`
  - `test.setupFiles: ["src/test/setup.ts"]`
- `src/test/setup.ts` — single line: `import "@testing-library/jest-dom"` (registers custom matchers like `toBeInTheDocument`, `toHaveAttribute`).
- `astro.config.mjs` — unchanged.

## Test layout

Colocated with source:

- `src/lib/timeline.test.ts`
- `src/components/OrgFilter.test.tsx`

No shared fixtures module; each file defines small inline fixture arrays.

## Test targets

### `src/lib/timeline.test.ts` — `filterByOrg`

- null `orgId` returns the input array unchanged
- unknown `orgId` returns `[]`
- item with multiple orgs matches when any of its orgs is selected
- empty input array returns `[]`

### `src/components/OrgFilter.test.tsx` — filter pills

- Clicking an org pill calls `onSelect` with that org's id
- Clicking "All" calls `onSelect(null)`
- `aria-pressed="true"` is set on exactly the active pill (and `"false"` on the others)

## npm scripts

Added to `package.json`:

- `test`: `vitest run`
- `test:watch`: `vitest`

## CI workflow

`.github/workflows/test.yml`:

- Triggers: `pull_request`, `push` to `main`
- Single job `unit` on `ubuntu-latest`
- Steps:
  1. `actions/checkout@v4`
  2. `pnpm/action-setup@v4` (reads `packageManager` from `package.json`)
  3. `actions/setup-node@v4` with `node-version: 22`, `cache: "pnpm"`
  4. `pnpm install --frozen-lockfile`
  5. `pnpm test`

No matrix, no artifacts, no coverage upload. Required-check wiring in GitHub branch protection is out of scope — done manually once the check has run successfully at least once.

## Documentation

- Add a short "Running tests" section to `README.md` (local: `pnpm test` / `pnpm test:watch`).
- No CLAUDE.md changes needed for PR 1.

## Acceptance

- [ ] Vitest + deps installed; `pnpm test` runs and passes locally
- [ ] `filterByOrg` tests (4 cases) pass
- [ ] `OrgFilter` tests (3 cases) pass
- [ ] `packageManager` field pinned in `package.json`
- [ ] `.github/workflows/test.yml` runs on PR and on push to `main`
- [ ] README documents `pnpm test`
- [ ] Issue #5 updated: PR 1 acceptance items crossed off, Playwright/CI-e2e items remain

## Follow-up (PR 2, tracked in issue #5)

- Playwright + `@axe-core/playwright`, 6 smoke tests from issue #5
- Second CI job `e2e`: build + preview + run Playwright, with browser cache and report artifact on failure

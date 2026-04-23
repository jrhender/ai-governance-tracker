# Site Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument the site with Cloudflare Web Analytics (cookieless, prod-only, beacon-in-code) plus a footer disclosure.

**Architecture:** A production-only `<script>` beacon in `src/layouts/BaseLayout.astro` gated on `import.meta.env.PROD` and the presence of `PUBLIC_CF_ANALYTICS_TOKEN`. A one-line footer disclosure on every page. Covered by a Playwright e2e spec that runs against the production bundle with a dummy token in CI.

**Tech Stack:** Astro 5, Vite env vars, Cloudflare Web Analytics, Playwright (existing from ADR-0004).

**Spec:** `docs/superpowers/specs/2026-04-22-site-analytics-design.md`

---

## File Structure

- `.env.example` — **new** — documents `PUBLIC_CF_ANALYTICS_TOKEN` for contributors
- `src/layouts/BaseLayout.astro` — **modify** — add prod-only beacon block and footer disclosure line
- `e2e/analytics.spec.ts` — **new** — Playwright spec: footer disclosure visible, beacon `<script>` present in HTML
- `.github/workflows/test.yml` — **modify** — set dummy `PUBLIC_CF_ANALYTICS_TOKEN` env for the `e2e` job
- `README.md` — **modify** — short "Analytics" subsection under Development

---

## Task 1: Env var scaffolding

**Files:**
- Create: `.env.example`
- Local only (not committed): `.env`

- [ ] **Step 1: Create `.env.example`**

Create `/Users/john/code/jrhender/ai-safety-gov-tracker/.env.example`:

```
# Cloudflare Web Analytics site token. Get it from the CF dashboard:
# Analytics & Logs -> Web Analytics -> (site) -> copy the data-cf-beacon token.
# Public by design — the token is embedded in the beacon on every page.
# Only required for production builds that should report traffic.
PUBLIC_CF_ANALYTICS_TOKEN=
```

- [ ] **Step 2: Create local `.env` for dev**

Create `/Users/john/code/jrhender/ai-safety-gov-tracker/.env` (gitignored already — see `.gitignore:4-6`):

```
PUBLIC_CF_ANALYTICS_TOKEN=dev-token-not-real
```

This lets `pnpm build && pnpm preview` render the beacon locally so the e2e spec can pass.

- [ ] **Step 3: Verify `.env` is gitignored**

Run: `git status`
Expected: `.env.example` appears as untracked; `.env` does NOT appear.

If `.env` appears, stop — the `.gitignore` rule is broken and must be fixed before continuing.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "Add .env.example documenting PUBLIC_CF_ANALYTICS_TOKEN"
```

---

## Task 2: Write failing e2e spec

**Files:**
- Create: `e2e/analytics.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `/Users/john/code/jrhender/ai-safety-gov-tracker/e2e/analytics.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("analytics", () => {
  test("footer shows the analytics disclosure", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Anonymous usage statistics via Cloudflare Web Analytics/i),
    ).toBeVisible();
  });

  test("cloudflare web analytics beacon is present in prod HTML", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const html = await response!.text();
    expect(html).toMatch(/static\.cloudflareinsights\.com\/beacon\.min\.js/);
  });
});
```

- [ ] **Step 2: Run the spec to confirm it fails**

Run: `pnpm test:e2e -- analytics.spec.ts`

Expected: both tests FAIL.
- First test: `getByText` does not find the disclosure.
- Second test: HTML does not contain `cloudflareinsights.com`.

If either passes at this point, stop and investigate — the layout may already contain what you think it doesn't.

- [ ] **Step 3: Commit**

```bash
git add e2e/analytics.spec.ts
git commit -m "Add failing e2e spec for analytics beacon and disclosure"
```

---

## Task 3: Implement beacon + footer disclosure in BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add beacon block to the frontmatter + head**

Open `/Users/john/code/jrhender/ai-safety-gov-tracker/src/layouts/BaseLayout.astro`.

Replace the frontmatter (lines 1-12) with:

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const siteTitle = "AI Safety Gov Tracker";
const fullTitle = title === siteTitle ? title : `${title} — ${siteTitle}`;

const cfToken = import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN;
const showBeacon = import.meta.env.PROD && cfToken;
---
```

Then, inside the `<head>` block, after the existing theme `<script is:inline>` (which ends on line 28), add:

```astro
    {showBeacon && (
      <script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token":"${cfToken}"}`}
      ></script>
    )}
```

- [ ] **Step 2: Replace the footer content with the disclosure**

Replace the existing footer (lines 50-54 in the original file):

```astro
    <footer
      class="mx-auto max-w-4xl px-6 py-10 text-sm text-slate-500 dark:text-slate-400"
    >
      A Canadian AI governance and policy timeline.
    </footer>
```

With:

```astro
    <footer
      class="mx-auto max-w-4xl space-y-2 px-6 py-10 text-sm text-slate-500 dark:text-slate-400"
    >
      <p>A Canadian AI governance and policy timeline.</p>
      <p>
        Anonymous usage statistics via{" "}
        <a
          href="https://www.cloudflare.com/web-analytics/"
          class="underline hover:text-slate-900 dark:hover:text-slate-100"
        >
          Cloudflare Web Analytics
        </a>.
      </p>
    </footer>
```

- [ ] **Step 3: Run the e2e spec to confirm both tests pass**

Run: `pnpm test:e2e -- analytics.spec.ts`

Expected: both tests PASS.

Note: this requires `.env` to contain `PUBLIC_CF_ANALYTICS_TOKEN=dev-token-not-real` (from Task 1, Step 2). Without it, `showBeacon` is false and the second test will fail.

- [ ] **Step 4: Run full e2e suite to confirm no regressions**

Run: `pnpm test:e2e`

Expected: all existing specs (timeline, a11y) still pass. If the a11y spec fails due to a contrast issue on the new footer link, adjust the link classes to match the existing footer text colors and rerun.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add Cloudflare Web Analytics beacon and footer disclosure"
```

---

## Task 4: Wire dummy token into CI `e2e` job

**Files:**
- Modify: `.github/workflows/test.yml`

- [ ] **Step 1: Add env block to the e2e job**

Open `/Users/john/code/jrhender/ai-safety-gov-tracker/.github/workflows/test.yml`.

Change the `e2e:` job header (lines 30-32):

```yaml
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

To:

```yaml
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      PUBLIC_CF_ANALYTICS_TOKEN: test-token-not-real
```

This env is scoped to the `e2e` job only. The `unit` job does not need it.

- [ ] **Step 2: Verify the YAML still parses**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))"`

Expected: no output (valid YAML).

If `python3` / `yaml` aren't available locally, skip this step; GitHub Actions will reject the workflow on push if it's malformed.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "Set dummy CF analytics token for e2e job"
```

---

## Task 5: Document in README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add an Analytics subsection under Development**

Open `/Users/john/code/jrhender/ai-safety-gov-tracker/README.md`.

After the "End-to-end tests" subsection (ends around line 40), before the `## License` heading, add:

```markdown
### Analytics

The site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — cookieless, no PII, no consent banner. The beacon only renders in production builds (`import.meta.env.PROD`) and only when `PUBLIC_CF_ANALYTICS_TOKEN` is set. Contributors don't need a token to work on the site.

To test the beacon locally, copy `.env.example` to `.env`, set a dummy token, then run:

```bash
pnpm build
pnpm preview
```

The production site's token is set in Cloudflare Pages' build environment, not in the repo.
```

- [ ] **Step 2: Verify the README still renders**

Run: `head -60 README.md`

Expected: the new section appears between "End-to-end tests" and "License", and the code fence backticks are balanced (no visual corruption in the output).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Document site analytics in README"
```

---

## Task 6: Push and open PR

- [ ] **Step 1: Push the branch**

Run: `git push -u origin feature/site-analytics`

Expected: branch pushed, tracking set.

- [ ] **Step 2: Open a PR via the GitHub API**

Per `CLAUDE.local.md`, open the PR with `curl` and `$GITHUB_TOKEN` (not the `gh` CLI).

```bash
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/jrhender/ai-governance-tracker/pulls" \
  -d '{
    "title": "Add Cloudflare Web Analytics (issue #1)",
    "head": "feature/site-analytics",
    "base": "main",
    "body": "## Summary\n\n- Add Cloudflare Web Analytics beacon to `BaseLayout.astro`, gated on `import.meta.env.PROD` and the presence of `PUBLIC_CF_ANALYTICS_TOKEN` (build-time env var)\n- Add a one-line footer disclosure linking to Cloudflare Web Analytics\n- Add `.env.example` documenting the token for contributors\n- Set a dummy token in the CI `e2e` job so the beacon renders during tests\n- New Playwright spec covers both the footer disclosure and the beacon script presence\n\n## Test plan\n\n- [ ] `pnpm test` passes (unit)\n- [ ] `pnpm test:e2e` passes locally (with `.env` set)\n- [ ] CI `unit` job green\n- [ ] CI `e2e` job green\n- [ ] After merge: set the real `PUBLIC_CF_ANALYTICS_TOKEN` in Cloudflare Pages project env and verify traffic appears in the CF Web Analytics dashboard\n\nSpec: `docs/superpowers/specs/2026-04-22-site-analytics-design.md`\nPlan: `docs/superpowers/plans/2026-04-22-site-analytics.md`\nTracking issue: #1"
  }'
```

Expected: JSON response with a `"html_url"` field. Surface the URL to the user.

- [ ] **Step 3: Run code review**

Per `CLAUDE.local.md`, invoke the `superpowers:requesting-code-review` skill after opening the PR. Surface strengths / issues by severity / assessment. Offer to apply any pre-merge fixes.

---

## Post-merge (manual, outside this plan)

These are one-time actions that need to happen in the Cloudflare dashboard, not in the repo. Do NOT attempt them from the plan.

1. Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site → select the Pages project. Copy the token.
2. Cloudflare dashboard → Pages → the project → Settings → Environment Variables → Production → add `PUBLIC_CF_ANALYTICS_TOKEN` with the real token.
3. Trigger a rebuild (the PR merge itself will do this).
4. After a few minutes of site activity, verify traffic in the Web Analytics dashboard.

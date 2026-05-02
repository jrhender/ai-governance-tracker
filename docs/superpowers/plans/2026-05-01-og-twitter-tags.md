# Open Graph & Twitter Card Meta Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Open Graph and Twitter Card meta tags to `BaseLayout.astro` so every page produces a rich social preview automatically, backed by a branded 1200×630 og-image.

**Architecture:** All tags are added to the single `BaseLayout.astro` layout — because every page uses it, no per-page changes are needed. `og:url` reuses the `canonicalURL` already computed in the layout. `og:image` defaults to `/og-image.png` (a static asset already committed to `public/`) but can be overridden per-page via an optional `ogImage` prop.

**Tech Stack:** Astro 5, Playwright (e2e tests in `e2e/`), Vitest (unit tests in `src/`)

**Tracking issue:** https://github.com/jrhender/ai-governance-tracker/issues/48

**Spec:** `docs/superpowers/specs/2026-05-01-og-twitter-tags-design.md`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Already done | `public/og-image.png` | 1200×630 branded PNG for og:image |
| Modify | `src/layouts/BaseLayout.astro` | Add OG/Twitter meta tags + `ogImage` prop |
| Create | `e2e/meta-tags.spec.ts` | E2e tests verifying tags are present and correct |

---

### Task 1: Create feature branch

- [ ] **Step 1: Start from up-to-date main**

```bash
git checkout main && git pull
```

- [ ] **Step 2: Create feature branch**

```bash
git checkout -b feature/og-twitter-tags
```

---

### Task 2: Write failing e2e tests for meta tags

**Files:**
- Create: `e2e/meta-tags.spec.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Open Graph and Twitter meta tags", () => {
  test("homepage has correct og:title", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(content).toBe("AI Governance Tracker");
  });

  test("homepage has og:description", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });

  test("homepage has og:type=website", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(content).toBe("website");
  });

  test("homepage has og:url matching canonical", async ({ page }) => {
    await page.goto("/");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(ogUrl).toBe(canonical);
  });

  test("homepage has og:site_name", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:site_name"]').getAttribute("content");
    expect(content).toBe("AI Governance Tracker");
  });

  test("homepage has og:image pointing to /og-image.png", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(content).toContain("/og-image.png");
  });

  test("homepage has og:image dimensions", async ({ page }) => {
    await page.goto("/");
    const width = await page.locator('meta[property="og:image:width"]').getAttribute("content");
    const height = await page.locator('meta[property="og:image:height"]').getAttribute("content");
    expect(width).toBe("1200");
    expect(height).toBe("630");
  });

  test("homepage has twitter:card=summary_large_image", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(content).toBe("summary_large_image");
  });

  test("homepage has twitter:title", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:title"]').getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("homepage has twitter:description", async ({ page }) => {
    await page.goto("/");
    const content = await page.locator('meta[name="twitter:description"]').getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("inner page has og:url matching its canonical URL, not homepage", async ({ page }) => {
    await page.goto("/timeline/");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(ogUrl).toContain("/timeline/");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail (preview server must be running)**

```bash
npx astro build && npx astro preview --port 4321 &
sleep 3
npx playwright test e2e/meta-tags.spec.ts
```

Expected: all 11 tests FAIL with "locator.getAttribute: Error" — the meta tags don't exist yet.

Kill the preview server after confirming failures:
```bash
kill %1
```

---

### Task 3: Add OG/Twitter meta tags to BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Update the Props interface and add ogImage variable**

Replace the top frontmatter block (lines 1–19) with:

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description, ogImage } = Astro.props;
const siteTitle = "AI Governance Tracker";
const fullTitle = title === siteTitle ? title : `${title} — ${siteTitle}`;

const path = Astro.url.pathname;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const defaultOgImage = new URL("/og-image.png", Astro.site).toString();
const resolvedOgImage = ogImage ?? defaultOgImage;

const navLinks = [
  { href: "/timeline/", label: "Timeline" },
  { href: "/orgs/", label: "Organizations" },
  { href: "/policy/", label: "Policy" },
];
---
```

- [ ] **Step 2: Add meta tags inside `<head>`**

After the existing `<link rel="canonical" ...>` line (currently line 29), insert:

```astro
    <!-- Open Graph -->
    <meta property="og:title" content={fullTitle} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL.toString()} />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:image" content={resolvedOgImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    {description && <meta name="twitter:description" content={description} />}
```

- [ ] **Step 3: Verify the file looks correct**

The full `<head>` section should now look like:

```astro
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{fullTitle}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={canonicalURL} />
    <!-- Open Graph -->
    <meta property="og:title" content={fullTitle} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL.toString()} />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:image" content={resolvedOgImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    {description && <meta name="twitter:description" content={description} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ...
  </head>
```

---

### Task 4: Run tests, commit, and open PR

- [ ] **Step 1: Build and start preview server**

```bash
npm run build && npx astro preview --port 4321 &
sleep 3
```

Expected: build succeeds with no type errors.

- [ ] **Step 2: Run the new e2e tests**

```bash
npx playwright test e2e/meta-tags.spec.ts
```

Expected: all 11 tests PASS.

- [ ] **Step 3: Run the full e2e suite to check for regressions**

```bash
npx playwright test
```

Expected: all tests pass. Kill the preview server:

```bash
kill %1
```

- [ ] **Step 4: Run unit tests**

```bash
npm test
```

Expected: all unit tests pass.

- [ ] **Step 5: Commit**

```bash
git add public/og-image.png src/layouts/BaseLayout.astro e2e/meta-tags.spec.ts docs/superpowers/specs/2026-05-01-og-twitter-tags-design.md docs/superpowers/plans/2026-05-01-og-twitter-tags.md
git commit -m "Add Open Graph and Twitter Card meta tags (issue #48)

- Add og:title, og:description, og:type, og:url, og:site_name, og:image,
  og:image:width, og:image:height to BaseLayout.astro
- Add twitter:card, twitter:title, twitter:description to BaseLayout.astro
- Add optional ogImage prop with fallback to /og-image.png
- Add branded 1200x630 og-image.png to public/
- All existing and future pages inherit tags via BaseLayout"
```

- [ ] **Step 6: Push and open PR**

```bash
git push -u origin feature/og-twitter-tags
```

Then open a PR via the GitHub API:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jrhender/ai-governance-tracker/pulls \
  -d '{
    "title": "Add Open Graph and Twitter Card meta tags (issue #48)",
    "body": "## Summary\n\n- Adds `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, `og:image` (+ dimensions) to `BaseLayout.astro`\n- Adds `twitter:card`, `twitter:title`, `twitter:description` to `BaseLayout.astro`\n- Adds an optional `ogImage` prop to `BaseLayout` with fallback to `/og-image.png`\n- Adds branded 1200×630 `public/og-image.png` (dark teal palette, \"AI Governance Tracker — Canada\")\n- All existing and future pages inherit tags automatically via `BaseLayout`\n\n**Spec:** `docs/superpowers/specs/2026-05-01-og-twitter-tags-design.md`\n**Plan:** `docs/superpowers/plans/2026-05-01-og-twitter-tags.md`\nCloses #48\n\n## Test plan\n\n- [ ] `npx playwright test e2e/meta-tags.spec.ts` — 11 new tests all pass\n- [ ] `npx playwright test` — full suite passes with no regressions\n- [ ] `npm test` — unit tests pass\n- [ ] Paste a page URL into https://www.opengraph.xyz to verify preview renders correctly\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)",
    "head": "feature/og-twitter-tags",
    "base": "main"
  }'
```

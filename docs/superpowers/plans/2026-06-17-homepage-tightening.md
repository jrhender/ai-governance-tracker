# Homepage Tightening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage snappier and cut timeline links from 4 to 2 — lean hero, 3-item activity preview, an Organizations card, a bottom About section, and a global footer Contribute link.

**Architecture:** All changes are presentational Astro markup in two files (`src/pages/index.astro`, `src/layouts/BaseLayout.astro`) plus a `.gitignore` housekeeping change. There is no new logic — the only data change is `slice(0, 5)` → `slice(0, 3)`. Tests are end-to-end (Playwright `e2e/homepage.spec.ts`), since the changes are markup; we update those tests TDD-style (change the assertion first, watch it fail, then change the markup).

**Tech Stack:** Astro 5, Tailwind CSS 4, Playwright (e2e). Spec: `docs/superpowers/specs/2026-06-17-homepage-tightening-design.md`.

**Branch:** Continue on `feature/homepage-latest-activity` (stacks on PR #93).

---

## Notes for the implementer

- **Running e2e:** The Playwright config starts the app with `pnpm preview`, which serves the built `dist/`. So a single spec run is: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts --project=chromium`. The build step is required — `preview` does not pick up source changes without it.
- **Unit tests** (`pnpm test`) are unaffected by this work but must stay green.
- A `<footer>` element has the implicit ARIA role `contentinfo`; a `<main>` has role `main`; an `<ol>`/`<ul>` has role `list`. The tests below use these roles to scope queries.

---

## Task 1: Housekeeping — gitignore untracked noise

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Inspect current ignores**

Run: `cat .gitignore`
Note whether `.pnpm-store`, `.claude`, `.superpowers` are already present (they are not, per `git status` showing them untracked).

- [ ] **Step 2: Append the three entries**

Add these lines to the end of `.gitignore`:

```gitignore
# Local package store / tooling / brainstorm artifacts
.pnpm-store/
.claude/
.superpowers/
```

- [ ] **Step 3: Verify they are no longer listed as untracked**

Run: `git status --short`
Expected: no lines for `.pnpm-store/`, `.claude/`, or `.superpowers/`.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "Ignore .pnpm-store, .claude, and .superpowers"
```

---

## Task 2: Add a global Contribute link to the footer

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (footer meta line, ~lines 184-195)
- Test: `e2e/homepage.spec.ts` (the "contribute link" test, lines 17-25)

- [ ] **Step 1: Update the e2e test to expect the link in the footer, on a non-home page**

In `e2e/homepage.spec.ts`, replace the existing test:

```typescript
  test("contribute link points to GitHub new issue page", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Contribute/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/jrhender/ai-governance-tracker/issues/new"
    );
  });
```

with:

```typescript
  test("footer contribute link points to GitHub and is global", async ({ page }) => {
    // Load a non-home page to prove the link lives in the global footer.
    await page.goto("/timeline/");
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name: /Contribute/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/jrhender/ai-governance-tracker/issues/new"
    );
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "footer contribute" --project=chromium`
Expected: FAIL — no `Contribute` link inside the footer (`contentinfo`) yet.

- [ ] **Step 3: Add the link to the footer meta line**

In `src/layouts/BaseLayout.astro`, find the footer meta paragraph:

```astro
        <p>
          A Canadian AI governance and policy timeline. &nbsp;·&nbsp;
          Anonymous usage statistics via&nbsp;
          <a
            href="https://www.cloudflare.com/web-analytics/"
            class="text-[#8ab8c8] hover:text-white underline"
          >
            Cloudflare Web Analytics
          </a>
          &nbsp;·&nbsp;
          <a href="/rss.xml" class="text-[#8ab8c8] hover:text-white underline">RSS</a>
        </p>
```

Replace it with (adds a Contribute link after RSS, matching the existing link style):

```astro
        <p>
          A Canadian AI governance and policy timeline. &nbsp;·&nbsp;
          Anonymous usage statistics via&nbsp;
          <a
            href="https://www.cloudflare.com/web-analytics/"
            class="text-[#8ab8c8] hover:text-white underline"
          >
            Cloudflare Web Analytics
          </a>
          &nbsp;·&nbsp;
          <a href="/rss.xml" class="text-[#8ab8c8] hover:text-white underline">RSS</a>
          &nbsp;·&nbsp;
          <a
            href="https://github.com/jrhender/ai-governance-tracker/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#8ab8c8] hover:text-white underline"
          >
            Contribute on GitHub
          </a>
        </p>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "footer contribute" --project=chromium`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro e2e/homepage.spec.ts
git commit -m "Add global Contribute link to the footer"
```

---

## Task 3: Trim the Latest activity preview to 3 items

**Files:**
- Modify: `src/pages/index.astro` (the `slice` at line 11, and add an `aria-label` to the `<ol>` at ~line 58)
- Test: `e2e/homepage.spec.ts` (new test)

- [ ] **Step 1: Add a failing test for a 3-item, labelled activity list**

In `e2e/homepage.spec.ts`, add this test inside the `test.describe("homepage", ...)` block:

```typescript
  test("latest activity shows three items", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: /Latest activity/i });
    await expect(list.locator("li")).toHaveCount(3);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "latest activity shows three" --project=chromium`
Expected: FAIL — the list has no accessible name "Latest activity" yet, and currently renders 5 items.

- [ ] **Step 3: Change the slice from 5 to 3**

In `src/pages/index.astro`, change line 11:

```astro
const latest = buildTimelineItems(events, organizations).slice(0, 5);
```

to:

```astro
const latest = buildTimelineItems(events, organizations).slice(0, 3);
```

- [ ] **Step 4: Add an aria-label to the activity list**

In `src/pages/index.astro`, find the activity list opening tag:

```astro
        <ol class="mt-6 border-l-2 border-accent">
```

Replace it with:

```astro
        <ol aria-label="Latest activity" class="mt-6 border-l-2 border-accent">
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "latest activity shows three" --project=chromium`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro e2e/homepage.spec.ts
git commit -m "Trim homepage activity preview to 3 items"
```

---

## Task 4: Slim the hero and add an About section

Removes paragraph 2 and the button row from the hero, and adds an "About this project" section at the bottom of the page containing paragraph 2. Also replaces the now-removed "primary CTA" e2e test with one for the activity section's "View full timeline" link.

**Files:**
- Modify: `src/pages/index.astro` (hero paragraph 2 + button row; add About section)
- Test: `e2e/homepage.spec.ts` (replace the "primary CTA" test)

- [ ] **Step 1: Replace the "primary CTA" test with a "View full timeline" test**

In `e2e/homepage.spec.ts`, replace this test:

```typescript
  test("primary CTA links to /timeline/", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Browse the Timeline/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/timeline/");
  });
```

with:

```typescript
  test("latest activity links to the full timeline", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /View full timeline/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/timeline/");
  });
```

- [ ] **Step 2: Run the homepage spec to confirm the old assertion is gone and the new one is the target**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "links to the full timeline" --project=chromium`
Expected: PASS already — the "View full timeline →" link exists today (this guards against regressions in this task). Note: the removed "Browse the Timeline" test no longer runs.

- [ ] **Step 3: Remove paragraph 2 and the button row from the hero**

In `src/pages/index.astro`, delete this paragraph (the second `<p>`):

```astro
    <p class="mt-4 max-w-xl text-base text-muted leading-relaxed">
      Policy on the full range of AI risks and benefits is given space here, but emphasis is on the scenarios with the largest potential impacts such as widespread deployment of advanced AI across the economy, increased bio and cyber risk, and the implications of highly capable systems. Within that scope, the site reports on government action and civil society inputs neutrally, without editorial comment.
    </p>
```

And delete the entire button row:

```astro
    <div class="mt-8 flex flex-wrap gap-3">
      <a
        href="/timeline/"
        class="inline-flex items-center rounded bg-header px-5 py-2.5 text-sm font-semibold text-white hover:bg-header-hover no-underline transition-colors"
      >
        Browse the Timeline →
      </a>
      <a
        href="https://github.com/jrhender/ai-governance-tracker/issues/new"
        class="inline-flex items-center rounded border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:border-[#aabbcc] hover:text-ink no-underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contribute via GitHub
      </a>
    </div>
```

After this, the hero is: `<h1>` + the first `<p>` (mission sentence) only.

- [ ] **Step 4: Add the About section at the bottom of the page**

In `src/pages/index.astro`, find the closing of the two-card grid `</div>` immediately followed by the page-wrapper `</div>`:

```astro
    </div>
  </div>
</BaseLayout>
```

Insert an About section between the card grid's closing `</div>` and the wrapper's closing `</div>`, so it reads:

```astro
    </div>

    <section class="mt-12 max-w-2xl">
      <h2 class="font-display text-2xl text-header">About this project</h2>
      <p class="mt-3 text-base text-muted leading-relaxed">
        Policy on the full range of AI risks and benefits is given space here, but emphasis is on the scenarios with the largest potential impacts such as widespread deployment of advanced AI across the economy, increased bio and cyber risk, and the implications of highly capable systems. Within that scope, the site reports on government action and civil society inputs neutrally, without editorial comment.
      </p>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 5: Run the homepage spec to confirm nothing broke**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts --project=chromium`
Expected: All homepage tests PASS. The "renders site title and values statement" test still passes because the `transformational impact` text is in paragraph 1, which stays in the hero.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro e2e/homepage.spec.ts
git commit -m "Slim homepage hero and move project description to an About section"
```

---

## Task 5: Swap the Timeline card for an Organizations card

**Files:**
- Modify: `src/pages/index.astro` (the first card in the 2-card grid)
- Test: `e2e/homepage.spec.ts` (rewrite the "section cards" test)

- [ ] **Step 1: Rewrite the "section cards" test to expect Policy + Organizations**

In `e2e/homepage.spec.ts`, replace this test:

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

with:

```typescript
  test("explore cards link to /policy/ and /orgs/", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: /Organizations/i }).first()
    ).toHaveAttribute("href", "/orgs/");
    await expect(
      main.getByRole("link", { name: /Policy/i }).first()
    ).toHaveAttribute("href", "/policy/");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "explore cards" --project=chromium`
Expected: FAIL — there is no card linking to `/orgs/` yet (the first card still links to `/timeline/`).

- [ ] **Step 3: Replace the Timeline card with an Organizations card**

In `src/pages/index.astro`, find the first card in the grid:

```astro
      <a
        href="/timeline/"
        class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
      >
        <h2 class="font-display text-lg text-header">Timeline</h2>
        <p class="mt-1 text-sm text-muted">
          Senate hearings, reports, and government announcements.
        </p>
      </a>
```

Replace it with:

```astro
      <a
        href="/orgs/"
        class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
      >
        <h2 class="font-display text-lg text-header">Organizations</h2>
        <p class="mt-1 text-sm text-muted">
          Government bodies, think tanks, and advocacy groups.
        </p>
      </a>
```

(Leave the Policy card that follows it unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm build && pnpm exec playwright test e2e/homepage.spec.ts -g "explore cards" --project=chromium`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro e2e/homepage.spec.ts
git commit -m "Swap homepage Timeline card for an Organizations card"
```

---

## Task 6: Full verification and push

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit suite**

Run: `pnpm test`
Expected: all tests PASS (unchanged from before this work — the `buildTimelineItems`/filter tests).

- [ ] **Step 2: Run the full e2e suite**

Run: `pnpm test:e2e`
Expected: all specs PASS, including the four updated homepage tests (site title, latest-activity-3-items, latest-activity-links-to-timeline, footer-contribute, explore-cards). Pay attention to `a11y.spec.ts` — the new `aria-label` and section headings should not introduce violations.

- [ ] **Step 3: Sanity-check the built homepage**

Run: `grep -c "Browse the Timeline" dist/index.html` → expected `0` (hero button gone).
Run: `grep -o "About this project" dist/index.html` → expected one match.
Run: `grep -o 'href="/orgs/"' dist/index.html` → expected at least one match (the new card).

- [ ] **Step 4: Push the branch (updates PR #93)**

```bash
git push
```

- [ ] **Step 5: Confirm CI is green on the PR**

Watch `Test / unit` and `Test / e2e` on PR #93. Both must pass before merge.

---

## Self-review notes (for reference)

- **Spec coverage:** hero slim (Task 4), activity 5→3 (Task 3), Organizations card (Task 5), About section (Task 4), footer Contribute (Task 2), `.gitignore` (Task 1). All spec sections mapped.
- **e2e:** the three pre-existing homepage tests the spec flagged are each addressed — "primary CTA" replaced (Task 4), "contribute" moved to footer (Task 2), "section cards" rewritten (Task 5).
- **Link count:** after Task 4 + 5, on-page timeline links = 1 ("View full timeline"), plus the global nav = 2 total. Goal met.

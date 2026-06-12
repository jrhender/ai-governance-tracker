# Featured Artifact Card on Event Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make associated artifacts obvious on event pages by replacing the buried "Related artifacts" list with a prominent gold-trimmed card directly after the event description ([#83](https://github.com/jrhender/ai-governance-tracker/issues/83)).

**Architecture:** Astro static site. All page changes live in `src/pages/events/[id].astro`; a new `humanizeType` helper goes in `src/lib/format.ts`; two gold colour tokens go in the Tailwind v4 `@theme` block in `src/styles/global.css` (Tailwind v4 auto-generates `text-gold-dark`, `border-l-gold` etc. from `--color-*` tokens).

**Spec:** `docs/superpowers/specs/2026-06-11-event-artifact-card-design.md`

**Tech Stack:** Astro 5, Tailwind CSS v4, Vitest (unit), Playwright (e2e).

**Branch:** `feature/event-artifact-card` (already created; spec is committed on it).

> **⚠️ E2E caveat:** `npx playwright test` always fails inside the Claude Code sandbox (macOS IPC restriction — see CLAUDE.local.md). Verify e2e specs by `npm run build` + code review locally; the authoritative e2e run happens in CI on the PR (`Test / e2e`). Do not burn time retrying Playwright in the sandbox.

---

### Task 1: `humanizeType` helper (TDD)

**Files:**
- Create: `src/lib/format.test.ts`
- Modify: `src/lib/format.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { humanizeType } from "./format";

describe("humanizeType", () => {
  it("returns single-word types unchanged", () => {
    expect(humanizeType("Report")).toBe("Report");
  });

  it("splits CamelCase into spaced words", () => {
    expect(humanizeType("PolicyDocument")).toBe("Policy Document");
    expect(humanizeType("WhitePaper")).toBe("White Paper");
    expect(humanizeType("GovernmentProgram")).toBe("Government Program");
  });

  it("passes already-spaced input through unchanged", () => {
    expect(humanizeType("White Paper")).toBe("White Paper");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL — `humanizeType` is not exported from `./format`.

- [ ] **Step 3: Implement the helper**

Append to `src/lib/format.ts`:

```ts
export function humanizeType(type: string): string {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full unit suite to check for regressions**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "Add humanizeType helper to split CamelCase artifact types"
```

---

### Task 2: Gold tokens + artifact card on the event page

**Files:**
- Modify: `src/styles/global.css` (the `@theme` block, after the `--color-faint` line)
- Modify: `src/pages/events/[id].astro`

- [ ] **Step 1: Add gold colour tokens**

In `src/styles/global.css`, inside the `@theme` block, directly after the line `--color-faint:     #5a6e78;`, add:

```css
  /* Artifact card accent */
  --color-gold:      #b08d2e;
  --color-gold-dark: #7a5f1a;
```

- [ ] **Step 2: Import the helper in the event page**

In `src/pages/events/[id].astro`, change the format import line from:

```ts
import { fmtDate } from "../../lib/format";
```

to:

```ts
import { fmtDate, humanizeType } from "../../lib/format";
```

- [ ] **Step 3: Add the artifact card after the description**

In `src/pages/events/[id].astro`, directly after the description block:

```astro
  {data.description && (
    <p class="mt-6 text-ink leading-relaxed">{data.description}</p>
  )}
```

insert:

```astro
  {relatedArtifacts.length > 0 && (
    <section class="mt-6 space-y-4" aria-label="Related artifacts">
      {relatedArtifacts.map((a) =>
        a ? (
          <a
            href={`/artifacts/${a.id}/`}
            class="group block rounded-lg border border-border border-l-4 border-l-gold bg-surface p-4 shadow-[0_2px_8px_rgba(15,42,56,0.08)]"
          >
            <div class="text-[0.65rem] font-bold uppercase tracking-widest text-gold-dark">
              {humanizeType(a.data.type)}
            </div>
            <div class="mt-1 font-semibold text-ink group-hover:underline">
              {a.data.title}
            </div>
            {a.data.description && (
              <p class="mt-1 text-sm text-muted line-clamp-3">
                {a.data.description}
              </p>
            )}
            <div class="mt-2 text-sm font-semibold text-gold-dark">
              Read the artifact →
            </div>
          </a>
        ) : null,
      )}
    </section>
  )}
```

- [ ] **Step 4: Remove the old "Related artifacts" section**

In the same file, delete the entire old section (currently lines 117–134) — the block starting with `{relatedArtifacts.length > 0 && (` that contains the `<h2 ...>Related artifacts</h2>` heading and the `<ul>` list. The tags section (`{data.tags.length > 0 && ...}`) stays.

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: build succeeds with no errors. (This also type-checks the `.astro` template.)

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/pages/events/[id].astro
git commit -m "Surface related artifacts as a featured card on event pages (#83)"
```

---

### Task 3: E2E coverage

**Files:**
- Create: `e2e/event-artifact.spec.ts`

- [ ] **Step 1: Write the e2e spec**

Create `e2e/event-artifact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const EVENT_WITH_ARTIFACT = "/events/cigi-pco-report-published-2026/";
const EVENT_WITHOUT_ARTIFACT =
  "/events/indu-ai-strategic-industries-meeting-27-2026/";
const ARTIFACT_PATH = "/artifacts/cigi-pco-ai-national-security-report-2026/";

test.describe("event artifact card", () => {
  test("artifact card renders before the Organizations section", async ({
    page,
  }) => {
    await page.goto(EVENT_WITH_ARTIFACT);

    const card = page.getByRole("link", { name: /Read the artifact/i });
    await expect(card).toBeVisible();

    const order = await page.evaluate(() => {
      const section = document.querySelector(
        'section[aria-label="Related artifacts"]',
      );
      const orgsHeading = [...document.querySelectorAll("h2")].find((h) =>
        h.textContent?.includes("Organizations"),
      );
      if (!section || !orgsHeading) return "missing";
      return section.compareDocumentPosition(orgsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
        ? "card-first"
        : "orgs-first";
    });
    expect(order).toBe("card-first");
  });

  test("card links to the artifact page", async ({ page }) => {
    await page.goto(EVENT_WITH_ARTIFACT);

    await page.getByRole("link", { name: /Read the artifact/i }).click();

    await expect(page).toHaveURL(new RegExp(`${ARTIFACT_PATH}$`));
    await expect(
      page.getByRole("heading", {
        name: /AI and National Security: Scenarios Workshop Summary Report/i,
      }),
    ).toBeVisible();
  });

  test("event without artifacts shows no card", async ({ page }) => {
    await page.goto(EVENT_WITHOUT_ARTIFACT);

    await expect(
      page.getByRole("link", { name: /Read the artifact/i }),
    ).toHaveCount(0);
    await expect(
      page.locator('section[aria-label="Related artifacts"]'),
    ).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Verify the spec compiles and the unit suite still passes**

Run: `npm test`
Expected: all unit tests pass (Vitest excludes `e2e/`, so this confirms no accidental import breakage elsewhere).

Do **not** run `npx playwright test` in the sandbox — it cannot work (see caveat at top). E2E runs in CI on the PR.

- [ ] **Step 3: Commit**

```bash
git add e2e/event-artifact.spec.ts
git commit -m "Add e2e coverage for the event-page artifact card"
```

---

### Task 4: Push and open PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feature/event-artifact-card
```

- [ ] **Step 2: Open the PR via GitHub API**

Use `curl` with `$GITHUB_TOKEN` (NOT the `gh` CLI — it cannot work in this sandbox, see CLAUDE.local.md). Repo slug is `jrhender/ai-governance-tracker`:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jrhender/ai-governance-tracker/pulls \
  -d @- <<'EOF'
{
  "title": "Surface related artifacts as a featured card on event pages",
  "head": "feature/event-artifact-card",
  "base": "main",
  "body": "Closes #83.\n\n## Summary\n- Replace the buried \"Related artifacts\" list on event pages with a prominent white card (gold left bar + gold accents) rendered directly after the event description\n- Whole card links to the artifact page; shows humanized type label, title, and a 3-line description clamp\n- Add `humanizeType` helper to `src/lib/format.ts` and gold colour tokens to the theme\n\nSpec: `docs/superpowers/specs/2026-06-11-event-artifact-card-design.md`\nPlan: `docs/superpowers/plans/2026-06-11-event-artifact-card.md`\n\n## Test plan\n- [ ] `npm test` — unit tests pass (incl. new `humanizeType` tests)\n- [ ] CI `Test / e2e` — new `e2e/event-artifact.spec.ts` passes\n- [ ] Manual: event with artifact shows card above Organizations; event without artifact unchanged\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)"
}
EOF
```

- [ ] **Step 3: Confirm CI passes**

Check the PR's check runs via the API; both `Test / unit` and `Test / e2e` must be green before merge.

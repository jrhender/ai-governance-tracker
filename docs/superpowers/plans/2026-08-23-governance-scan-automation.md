# Daily Governance Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A weekday-morning GitHub Actions run that reports candidate untracked Canadian AI governance events as GitHub issues.

**Architecture:** A tested, deterministic Node module loads what is already tracked from `data/**/*.yaml` and what has already been reported from `content`-labelled issues. Claude Code runs headless (`claude -p`) with a checked-in prompt, consults a curated source list, and files issues only for candidates that survive both filters. Deterministic work lives in testable code; the agent judges only what requires judgement.

**Tech Stack:** GitHub Actions, Claude Code CLI (`claude -p`, subscription auth via `CLAUDE_CODE_OAUTH_TOKEN`), Node 22, pnpm, vitest, `yaml` + `fast-glob` (both already dependencies), `gh` CLI (preinstalled on runners).

**Spec:** `docs/superpowers/specs/2026-08-23-governance-scan-automation-design.md`

## Global Constraints

- Workflow permissions are exactly `contents: read` + `issues: write`. Never add `contents: write` — the no-write-path-to-`data/` property is the design's primary safety guarantee.
- Maximum 5 issues filed per run.
- Every filed issue must carry a source URL. No URL → do not file.
- Bot issues carry both `content` (dedupe key) and `needs further review` (provenance). Both labels already exist; do not create them.
- Issue titles follow the existing human convention: `Add <thing>`.
- The agent never edits, closes, or comments on an issue it did not create.
- Dedupe spans `content` issues in **both** open and closed states, human-filed and bot-filed.
- Lookback window is a rolling 14 days.
- Actions logs are unreadable from the dev sandbox. Job **exit status** must carry every signal; diagnose via the check-runs annotations API.
- No new npm dependencies. `yaml` and `fast-glob` are already in `package.json`.

---

### Task 1: Tracked-records module

Deterministic load of what `data/` already contains. This is the module the negative test exercises.

**Files:**
- Create: `scripts/governance-scan/trackedRecords.mjs`
- Create: `scripts/governance-scan/trackedRecords.test.mjs`
- Create: `scripts/governance-scan/__fixtures__/data/events/2026-01-15-sample.yaml`
- Create: `scripts/governance-scan/__fixtures__/data/artifacts/2026-01-20-sample-report.yaml`

**Interfaces:**
- Consumes: nothing.
- Produces: `loadTrackedRecords(dataDir?: string) => Promise<Array<{id: string, date: string|null, title: string, tags: string[]}>>`, default `dataDir` `"data"`. Used by Tasks 2 and 3.

Plain `.mjs` rather than `src/lib/*.ts`: this is build-time tooling, not site code, and it must run under bare `node` on a runner with no TS loader. Vitest picks up `*.test.mjs` with its default `include`.

- [ ] **Step 1: Write the fixtures**

`scripts/governance-scan/__fixtures__/data/events/2026-01-15-sample.yaml`:

```yaml
id: sample-event
type: GovernmentAnnouncement
schema_type: Event
title: "A sample event"
date: 2026-01-15
tags:
  - federal-government
```

`scripts/governance-scan/__fixtures__/data/artifacts/2026-01-20-sample-report.yaml`:

```yaml
id: sample-report
schema_type: CreativeWork
title: "A sample report"
date: 2026-01-20
tags:
  - think-tank
```

- [ ] **Step 2: Write the failing test**

`scripts/governance-scan/trackedRecords.test.mjs`:

```js
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { loadTrackedRecords } from "./trackedRecords.mjs";

const FIXTURES = "scripts/governance-scan/__fixtures__/data";

describe("loadTrackedRecords", () => {
  it("loads records from every subdirectory, sorted by id", async () => {
    const records = await loadTrackedRecords(FIXTURES);
    expect(records).toEqual([
      { id: "sample-event", date: "2026-01-15", title: "A sample event", tags: ["federal-government"] },
      { id: "sample-report", date: "2026-01-20", title: "A sample report", tags: ["think-tank"] },
    ]);
  });

  it("normalises dates to YYYY-MM-DD strings regardless of YAML parsing", async () => {
    const [first] = await loadTrackedRecords(FIXTURES);
    expect(typeof first.date).toBe("string");
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("loads the real data directory without throwing", async () => {
    const records = await loadTrackedRecords();
    expect(records.length).toBeGreaterThan(20);
    expect(records.every((r) => typeof r.id === "string" && r.id.length > 0)).toBe(true);
  });
});
```

The third test is a guard against a schema drift in `data/` silently breaking the scanner.

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run scripts/governance-scan/trackedRecords.test.mjs`
Expected: FAIL — cannot resolve `./trackedRecords.mjs`.

- [ ] **Step 4: Write the implementation**

`scripts/governance-scan/trackedRecords.mjs`:

```js
import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import { parse } from "yaml";

/**
 * Load every record in the tracker as a compact summary.
 * Records without an `id` are skipped — they are not addressable.
 */
export async function loadTrackedRecords(dataDir = "data") {
  const files = (await fg(`${dataDir}/**/*.yaml`)).sort();
  const records = [];

  for (const file of files) {
    const doc = parse(await readFile(file, "utf8"));
    if (!doc || typeof doc.id !== "string" || doc.id === "") continue;

    records.push({
      id: doc.id,
      // `yaml` may hand back a string or a Date depending on the value's
      // shape; normalise both to YYYY-MM-DD.
      date: doc.date ? toIsoDate(doc.date) : null,
      title: doc.title ?? "",
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    });
  }

  return records.sort((a, b) => a.id.localeCompare(b.id));
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run scripts/governance-scan/trackedRecords.test.mjs`
Expected: PASS, 3 tests.

- [ ] **Step 6: Run the full suite to confirm nothing regressed**

Run: `pnpm test`
Expected: PASS. The new fixtures live under `scripts/`, so the Astro content collections in `src/content.config.ts` do not see them.

- [ ] **Step 7: Commit**

```bash
git add scripts/governance-scan/
git commit -m "Add tracked-records loader for governance scan

Deterministic load of data/**/*.yaml into a compact summary, so the
scanner's dedupe is testable rather than a matter of agent judgement."
```

---

### Task 2: Candidate filter

The negative test the spec calls the one that matters: given a candidate already present in `data/` or already raised as an issue, filter it out.

**Files:**
- Create: `scripts/governance-scan/filterCandidates.mjs`
- Create: `scripts/governance-scan/filterCandidates.test.mjs`

**Interfaces:**
- Consumes: `loadTrackedRecords` from Task 1 (record shape only), `reportedTitles` from Task 3's `github.mjs` (Step 5 only — write Task 3 first if executing strictly in order).
- Produces: `filterCandidates({candidates, tracked, reportedTitles}) => Array<candidate>`, where a candidate is `{title: string, url: string, date: string, why: string}`. Used by Task 5's prompt contract.

- [ ] **Step 1: Write the failing test**

`scripts/governance-scan/filterCandidates.test.mjs`:

```js
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { filterCandidates } from "./filterCandidates.mjs";

const tracked = [
  { id: "hiroshima-ai-process", date: "2023-05-19", title: "Hiroshima AI Process launched", tags: [] },
];

const candidate = (over = {}) => ({
  title: "Add Canadian Compute Strategy",
  url: "https://example.gc.ca/compute",
  date: "2026-08-20",
  why: "No record with a matching title in data/",
  ...over,
});

describe("filterCandidates", () => {
  it("keeps a genuinely new candidate", () => {
    const out = filterCandidates({ candidates: [candidate()], tracked, reportedTitles: [] });
    expect(out).toHaveLength(1);
  });

  it("drops a candidate whose subject is already tracked in data/", () => {
    const out = filterCandidates({
      candidates: [candidate({ title: "Add Hiroshima AI Process" })],
      tracked,
      reportedTitles: [],
    });
    expect(out).toEqual([]);
  });

  it("drops a candidate already reported as an issue, including closed ones", () => {
    const out = filterCandidates({
      candidates: [candidate()],
      tracked,
      reportedTitles: ["Add Canadian Compute Strategy"],
    });
    expect(out).toEqual([]);
  });

  it("drops a candidate with no source URL", () => {
    const out = filterCandidates({ candidates: [candidate({ url: "" })], tracked, reportedTitles: [] });
    expect(out).toEqual([]);
  });

  it("caps output at five candidates", () => {
    const many = Array.from({ length: 12 }, (_, i) => candidate({ title: `Add thing ${i}` }));
    expect(filterCandidates({ candidates: many, tracked, reportedTitles: [] })).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run scripts/governance-scan/filterCandidates.test.mjs`
Expected: FAIL — cannot resolve `./filterCandidates.mjs`.

- [ ] **Step 3: Write the implementation**

`scripts/governance-scan/filterCandidates.mjs`:

```js
export const MAX_ISSUES_PER_RUN = 5;

/**
 * Drop candidates that are already tracked, already reported, or
 * unsourced — then cap the survivors.
 */
export function filterCandidates({ candidates, tracked, reportedTitles }) {
  const trackedKeys = new Set(tracked.map((r) => normalise(r.title)));
  for (const record of tracked) trackedKeys.add(normalise(record.id));

  const reportedKeys = new Set(reportedTitles.map(normalise));

  return candidates
    .filter((c) => c.url && c.url.trim() !== "")
    .filter((c) => !reportedKeys.has(normalise(c.title)))
    .filter((c) => !trackedKeys.has(normalise(stripAddPrefix(c.title))))
    .slice(0, MAX_ISSUES_PER_RUN);
}

/** "Add Hiroshima AI Process" -> "Hiroshima AI Process" */
function stripAddPrefix(title) {
  return title.replace(/^add\s+/i, "");
}

/** Compare on lowercase alphanumerics so punctuation and dashes don't matter. */
function normalise(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run scripts/governance-scan/filterCandidates.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the filter CLI**

The module is only worth having if the agent cannot bypass it. This is the
gate every candidate must pass through before an issue is filed.

`scripts/governance-scan/filter.mjs`:

```js
import { loadTrackedRecords } from "./trackedRecords.mjs";
import { filterCandidates } from "./filterCandidates.mjs";
import { reportedTitles } from "./github.mjs";

const stdin = await new Promise((resolve) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (buf += chunk));
  process.stdin.on("end", () => resolve(buf));
});

const { candidates } = JSON.parse(stdin);

process.stdout.write(
  JSON.stringify(
    filterCandidates({
      candidates,
      tracked: await loadTrackedRecords(),
      reportedTitles: reportedTitles(),
    }),
  ),
);
```

- [ ] **Step 6: Verify the CLI drops an already-tracked candidate**

```bash
echo '{"candidates":[{"title":"Add Hiroshima AI Process","url":"https://example.com","date":"2026-08-20","why":"test"}]}' \
  | node scripts/governance-scan/filter.mjs
```

Expected: `[]` — the record is already in `data/`.

- [ ] **Step 7: Commit**

```bash
git add scripts/governance-scan/filterCandidates.mjs scripts/governance-scan/filterCandidates.test.mjs scripts/governance-scan/filter.mjs
git commit -m "Add candidate filter for governance scan

Enforces the spec's guardrails as code: already-tracked, already-reported,
unsourced, and the five-per-run cap. The CLI is the gate candidates must
pass before any issue is filed, so the rules aren't left to agent judgement."
```

---

### Task 3: Scan context CLI

One command the workflow runs to hand the agent everything it needs to decide, so the agent never has to shell around the repo or guess at `gh` syntax.

**Files:**
- Create: `scripts/governance-scan/github.mjs`
- Create: `scripts/governance-scan/context.mjs`

**Interfaces:**
- Consumes: `loadTrackedRecords` (Task 1).
- Produces: `reportedTitles() => string[]` and `since() => string` from `github.mjs`, reused by Task 2's filter CLI.
- Produces: a CLI printing JSON `{tracked: [...], reportedTitles: [...], since: "YYYY-MM-DD"}` to stdout. Task 4's prompt and workflow depend on this shape.

- [ ] **Step 1: Write the implementation**

`scripts/governance-scan/github.mjs` — shared so Task 2's filter and this CLI
cannot drift apart on what "already reported" means:

```js
import { execFileSync } from "node:child_process";

const LOOKBACK_DAYS = 14;

/** Titles of every `content`-labelled issue, open AND closed. */
export function reportedTitles() {
  const raw = execFileSync(
    "gh",
    ["issue", "list", "--label", "content", "--state", "all", "--limit", "200", "--json", "title"],
    { encoding: "utf8" },
  );
  return JSON.parse(raw).map((i) => i.title);
}

/** Start of the rolling lookback window, as YYYY-MM-DD. */
export function since() {
  return new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10);
}
```

`scripts/governance-scan/context.mjs`:

```js
import { loadTrackedRecords } from "./trackedRecords.mjs";
import { reportedTitles, since } from "./github.mjs";

process.stdout.write(
  JSON.stringify({ tracked: await loadTrackedRecords(), reportedTitles: reportedTitles(), since: since() }),
);
```

Closed issues are included deliberately: a closed `content` issue means handled-or-declined, and re-raising it is the failure mode most likely to make the feed feel like noise.

- [ ] **Step 2: Verify it runs against the real repo**

Run: `node scripts/governance-scan/context.mjs | head -c 400`
Expected: JSON beginning `{"tracked":[{"id":"...`, containing a non-empty `reportedTitles` array (there are existing `content` issues) and a `since` date 14 days back.

- [ ] **Step 3: Commit**

```bash
git add scripts/governance-scan/context.mjs
git commit -m "Add scan context CLI emitting tracked records and reported titles"
```

---

### Task 4: Curated source list

**Files:**
- Create: `.github/sources.yaml`

**Interfaces:**
- Consumes: nothing.
- Produces: the source list Task 5's prompt walks.

> **This task requires the user's input before it is written.** The list below is
> inferred from what already appears in `data/`, not from knowing where the
> maintainer actually looks. Ask before committing it, and treat the answer as
> authoritative over this draft.

- [ ] **Step 1: Confirm the list with the user**

Ask which of the drafted sources belong, and — more valuable — which habitual sources are missing.

- [ ] **Step 2: Write the file**

`.github/sources.yaml`:

```yaml
# Sources walked by .github/workflows/governance-scan.yml each weekday.
# Tuning this list is the main lever on signal quality — add sources that
# have produced real leads, remove ones that only produce noise.

sources:
  - id: legisinfo
    name: LEGISinfo — bills before Parliament
    url: https://www.parl.ca/legisinfo/en/bills
    look_for: AI, algorithmic, online harms, privacy, or data bills

  - id: ised-newsroom
    name: ISED news releases
    url: https://www.canada.ca/en/innovation-science-economic-development/news.html
    look_for: AI strategy, funding, codes of practice, ministerial announcements

  - id: indu-committee
    name: INDU — Standing Committee on Industry and Technology
    url: https://www.ourcommons.ca/Committees/en/INDU/Meetings
    look_for: meetings and reports touching AI

  - id: caisi
    name: Canadian AI Safety Institute
    url: https://ised-isde.canada.ca/site/ai-safety-institute-canada/en
    look_for: publications, research notes, mandate changes

  - id: aigs
    name: AI Governance & Safety Canada
    url: https://aigs.ca/
    look_for: reports, briefs, campaigns

  - id: cigi
    name: Centre for International Governance Innovation
    url: https://www.cigionline.org/topics/artificial-intelligence/
    look_for: AI governance reports and policy briefs

  - id: cifar
    name: CIFAR — Pan-Canadian AI Strategy
    url: https://cifar.ca/ai/
    look_for: strategy phases, funding, national AI institute news
```

- [ ] **Step 3: Commit**

```bash
git add .github/sources.yaml
git commit -m "Add curated source list for the governance scan"
```

---

### Task 5: Agent prompt

**Files:**
- Create: `.github/prompts/governance-scan.md`

**Interfaces:**
- Consumes: the `context.mjs` JSON shape (Task 3), `filter.mjs` (Task 2), `.github/sources.yaml` (Task 4).
- Produces: the prompt text Task 6's workflow passes to `claude -p`.

Kept out of the workflow YAML so it can be edited and reviewed as prose without touching the file that controls permissions.

- [ ] **Step 1: Write the prompt**

`.github/prompts/governance-scan.md`:

```markdown
You are scanning for Canadian AI governance developments that are not yet
recorded in this tracker.

## Context

Run this first — it prints JSON with everything you need to avoid duplicates:

    node scripts/governance-scan/context.mjs

The JSON contains:
- `tracked` — every record already in `data/`. If a development is here, it is
  NOT a lead.
- `reportedTitles` — titles of every `content`-labelled issue, open and closed.
  If a development is here it has already been raised, possibly by a human, and
  is NOT a lead. Closed means handled or deliberately declined — still not a lead.
- `since` — only consider developments published on or after this date.

## Task

1. Read `.github/sources.yaml`.
2. Visit each source. Look for developments published on or after `since`.
3. Collect every candidate as JSON and pipe it through the filter. **Do not
   decide for yourself which candidates are duplicates** — the filter enforces
   already-tracked, already-reported, missing-URL and the five-per-run cap:

       echo '{"candidates":[{"title":"Add ...","url":"https://...","date":"2026-08-20","why":"..."}]}' \
         | node scripts/governance-scan/filter.mjs

4. File a GitHub issue for each candidate the filter returns — and only those.
   If it returns `[]`, file nothing.

## Rules

- **Never file a lead without a source URL.** If you cannot point at the page
  that documents it, drop it. A wrong lead costs more trust than a missed one.
- **Maximum 5 issues per run.** If you have more, file the 5 most significant
  and note in the last issue body that more were found.
- **Never edit, close, or comment on an existing issue.** You only create.
- **Do not modify anything in `data/`.** You have no write access; do not try.
- If nothing survives the filters, do nothing and say `NO_NEW_LEADS`. Most days
  will be this. That is a success, not a failure.

## Issue format

Title: `Add <thing>` — matching the existing convention, e.g. "Add bill C-25".

Body:

    **Source:** <url>
    **Date:** <YYYY-MM-DD>
    **Why this looks untracked:** <one sentence>

    <two or three sentences on what happened and why it belongs in the tracker>

    ---
    Filed automatically by the daily governance scan. Verify before adding to `data/`.

Labels: `content` and `needs further review`. Both already exist.

Create issues with:

    gh issue create --title "..." --body "..." --label content --label "needs further review"

## Dry run

If the environment variable `DRY_RUN` is `true`, do NOT create issues. Instead
print each issue you would have created, prefixed with `WOULD FILE:`, then stop.
```

- [ ] **Step 2: Commit**

```bash
git add .github/prompts/governance-scan.md
git commit -m "Add agent prompt for the governance scan"
```

---

### Task 6: Workflow

**Files:**
- Create: `.github/workflows/governance-scan.yml`

**Interfaces:**
- Consumes: all prior tasks; the `CLAUDE_CODE_OAUTH_TOKEN` repo secret.
- Produces: the scheduled run.

- [ ] **Step 1: Write the workflow**

`.github/workflows/governance-scan.yml`:

```yaml
# Scans curated sources each weekday for Canadian AI governance developments
# not yet in data/, and files them as issues for human review.
#
# Auth: CLAUDE_CODE_OAUTH_TOKEN is a Claude subscription token minted with
# `claude setup-token`. It is long-lived but NOT permanent — when it expires
# this workflow fails loudly and the fix is to re-mint it and update the secret.

name: Governance Scan

on:
  schedule:
    # 12:00 UTC = 08:00 Eastern in summer, 07:00 in winter. Weekdays only.
    - cron: '0 12 * * 1-5'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Print candidate issues instead of filing them'
        type: boolean
        default: false

concurrency:
  group: governance-scan
  cancel-in-progress: false

permissions:
  contents: read
  issues: write

jobs:
  scan:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: npm install -g @anthropic-ai/claude-code

      - name: Scan for untracked developments
        env:
          CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DRY_RUN: ${{ inputs.dry_run || 'false' }}
        run: |
          set -o pipefail
          claude -p "$(cat .github/prompts/governance-scan.md)" \
            --allowed-tools 'Bash(node scripts/governance-scan/context.mjs)' \
            --allowed-tools 'Bash(node scripts/governance-scan/filter.mjs)' \
            --allowed-tools 'Bash(gh issue create:*)' \
            --allowed-tools 'Read,WebFetch,WebSearch' \
            2>&1 | tee scan.log
```

`--allowed-tools` is a second line of defence behind the token permissions: even
if the prompt is misread or a source page carries injected instructions, the
agent has no `Write`, no `Edit`, and no general `Bash`.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/governance-scan.yml
git commit -m "Add daily governance scan workflow"
```

---

### Task 7: Live verification

The unit tests prove the filter; only a real run proves the whole path. Every check here reads a **job conclusion**, never a log — Actions logs are unreachable from the dev sandbox.

**Files:**
- Modify: `.github/prompts/governance-scan.md` or `.github/sources.yaml` if a run reveals problems.

- [ ] **Step 1: Push the branch and open the PR**

```bash
git push -u origin feature/governance-scan
gh pr create --title "Add daily governance scan automation" \
  --body "Implements docs/superpowers/specs/2026-08-23-governance-scan-automation-design.md"
```

- [ ] **Step 2: Confirm `Test / unit` passes**

```bash
gh pr checks --watch
```

Expected: `Test / unit` and `Test / e2e` both pass. The new `.test.mjs` files run inside `Test / unit`.

- [ ] **Step 3: Dry run**

`workflow_dispatch` requires the workflow on the default branch, so this runs
after merge. Immediately after merging:

```bash
gh workflow run "Governance Scan" -f dry_run=true
gh run list --workflow "Governance Scan" --limit 1
```

Expected: conclusion `success`.

- [ ] **Step 4: Read what it would have filed**

The dry run files nothing, so its output must be read by a human in the Actions
UI (the agent cannot reach the logs). Check each `WOULD FILE:` entry for:
- a real, resolving source URL
- nothing already in `data/`
- nothing matching an existing `content` issue, open or closed

- [ ] **Step 5: Live run**

```bash
gh workflow run "Governance Scan"
gh run list --workflow "Governance Scan" --limit 1
gh issue list --label "needs further review" --limit 10
```

Expected: conclusion `success`, and either zero new issues or well-formed ones.

- [ ] **Step 6: Dedupe run**

Immediately re-run the live scan.

```bash
gh workflow run "Governance Scan"
```

Expected: **zero new issues.** Anything filed in Step 5 now appears in
`reportedTitles`, so a second file is a dedupe bug. This is the highest-value
check in the plan — run it even if Step 5 filed nothing, since a scan that
re-files its own output degrades fastest.

- [ ] **Step 7: Delete the auth probe**

Only once the scan has run green:

```bash
git push origin --delete chore/actions-auth-probe
```

`.github/workflows/auth-probe.yml` lives only on that branch, so deleting the
branch removes it. Confirm with `gh workflow list` that only `Test` and
`Governance Scan` remain.

---

## Deferred

Not built now, recorded so the reasoning is not lost:

- **Drafting YAML into a PR.** Explicitly rejected in the spec — quota cost and
  the risk of plausible-looking wrong dates passing review. Revisit only if the
  issue feed proves reliable over months.
- **Scaling the tracked set.** `loadTrackedRecords` sends every record to the
  agent. Fine at ~50; revisit near a few hundred, when the JSON stops fitting
  comfortably in context.

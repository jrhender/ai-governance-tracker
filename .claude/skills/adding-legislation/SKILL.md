---
name: adding-legislation
description: Use when adding a bill, act, or other piece of legislation to this tracker — covers how to model the legislative lifecycle (artifact + embedded stages, plus two headline events), which Canadian primary sources to consult, and the tagging conventions specific to this repo.
---

# Adding Legislation

## Overview

Legislation in this tracker is modelled as one **artifact** with an embedded `stages[]` array capturing the full legislative journey, plus **two standalone events** on the main timeline: introduction and final status (prorogation, royal assent, withdrawal, etc.). Intermediate stages (second reading, committee referral, amendments, pauses) live inside the artifact — not as separate events — so the main timeline stays uncluttered.

This is Option C (hybrid) from the Bill C-27 / AIDA design. See `docs/superpowers/specs/2026-04-23-bill-c27-aida-data-entry-design.md` for the full rationale.

## When to Use

- User wants to add a bill, act, or piece of legislation (federal or provincial)
- Adding substantive amendments to a bill already in the tracker (extend `stages[]`, update `lifecycle_status` / `current_stage`)
- A tracked bill changes state (passes, dies, is withdrawn, receives royal assent)

Not for: committee meetings about a topic (those are standalone `Event` records under `data/events/`); policy reports or recommendations (those are `CreativeWork` artifacts without a legislative lifecycle).

## Data Model

### The artifact (`data/artifacts/YYYY-MM-DD-bill-<designator>.yaml`)

```yaml
id: bill-<designator>              # e.g. bill-c27-aida (NO hyphen between "c" and number)
type: Legislation
schema_type: CreativeWork          # Legislation is a subtype of CreativeWork in schema.org
title: "Bill <X-NN> — <full title>"
published_date: <introduction-date>  # first-reading date; anchors the artifact

lifecycle_status: active | enacted | died | withdrawn
current_stage: "<human-readable sentence>"  # e.g. "Died on the Order Paper on prorogation, 6 January 2025"

organizations:
  - id: <committee-or-sponsoring-dept-id>
    role: reviewed_by | sponsor

summary: "1–2 plain-text sentences, ≤ 300 chars — shown on the Policy page card. No markdown."

description: |          # literal block scalar (|), NOT folded (>). See "Description" below.
  A few paragraphs: what the bill is, what it would do, where it currently
  sits, and the key dates. This is the text a reader scanning the artifact
  page sees first.

  Separate paragraphs with a blank line — the artifact page renders this
  field as Markdown.

stages:
  - date: YYYY-MM-DD            # use exact dates — research them from minutes
    stage: "<short label>"       # e.g. "Second reading passed; referred to INDU"
    note: "<optional one-liner>"
    links: []                   # optional; per-stage commentary/coverage
  # ... one entry per meaningful procedural step

provisions:                       # what the bill does / would do
  - id: <kebab-case-slug>
    title: "<short title>"
    summary: >
      Plain-language description of one obligation, mechanism, or
      institution the bill creates.

links: []                         # primary sources: LEGISinfo, companion docs, etc.
tags: []                          # see Tagging below
```

### Description: use a literal block scalar so paragraphs render

The artifact page (`src/pages/artifacts/[id].astro`) renders `description`
through Markdown (`marked`), so paragraph breaks need a real blank line
(`\n\n`) in the parsed string.

**Author `description` with a literal block scalar (`|`), not folded (`>`).**
A folded scalar collapses each blank line into a *single* `\n`, which
Markdown treats as a soft break, not a paragraph break — so the whole
description renders as one wall-of-text `<p>` no matter how you space the
source. The literal `|` preserves blank lines as paragraph breaks.

Quick check before committing a multi-paragraph description:

```bash
node --input-type=module -e '
import { readFileSync } from "fs"; import YAML from "yaml"; import { marked } from "marked";
const d = YAML.parse(readFileSync(process.argv[1], "utf8")).description;
console.log((await marked.parse(d)).match(/<p>/g)?.length, "paragraphs");
' data/artifacts/<your-file>.yaml
```

If it prints `1` for text you wrote as several paragraphs, you used `>` —
switch to `|`. (Single-paragraph fields like a provision `summary:` are
fine with `>`; the trap is only multi-paragraph `description`.)

Every artifact should also carry a one-to-two-sentence `summary` (≤ 300
characters, plain text) — the policy listing card
(`PolicyWithSourceFilter.tsx`) shows `summary` and only falls back to a
clamped first paragraph of `description` when it is missing. Only the
artifact detail page renders the full `description`.

### The two events

**Introduction event** (`data/events/YYYY-MM-DD-bill-<designator>-introduced.yaml`):
- `type: LegislativeAction`, `schema_type: Event`, `status: completed`
- `related_artifacts: [{ id: <artifact-id> }]`
- Omit `organizations` — committees only become involved after second reading

**Final-status event** (`data/events/YYYY-MM-DD-<final-event>.yaml`):
- `type: PoliticalEvent` (prorogation, dissolution) or `LegislativeAction` (royal assent, withdrawal)
- `related_artifacts: [{ id: <artifact-id> }]`
- Scope the title to the event itself, not the bill (e.g. "Parliament prorogued — Bill X-NN dies on the Order Paper" rather than "Bill X-NN dies")

If a bill is still active, create only the introduction event. Add the final-status event when the bill's lifecycle ends.

## Canadian Primary Sources

For federal bills, consult in this order:

1. **[LEGISinfo](https://www.parl.ca/legisinfo/)** — bill page lists all stages with dates and vote numbers. Authoritative for `stages[]`.
2. **House of Commons committee study page** (`ourcommons.ca/committees/en/<committee>/StudyActivity?studyActivityId=...`) — meeting numbers and dates. Authoritative for committee-stage dates.
3. **Departmental companion document** (e.g. ISED for AIDA, Justice for Criminal Code amendments) — authoritative for `provisions[]`.
4. **Charter Statement** at `justice.gc.ca/eng/csj-sjc/pl/charter-charte/` — rights-and-freedoms analysis.
5. **Commentary** (Gowling WLG, Fasken, Michael Geist, IAPP, Montreal AI Ethics Institute) — timelines, context, reactions. Attach to specific `stages[].links` rather than top-level.

For provincial bills: check the province's legislative-assembly site (e.g. `ola.org` for Ontario, `assnat.qc.ca` for Québec). Pattern is similar — each has its own equivalent of LEGISinfo.

## Tagging

**Omit** implicit site-wide tags: `artificial-intelligence`, `ai-regulation`, `ai-safety`, `legislation`, `canadian`. Everything on this site is about Canadian AI.

**Keep** distinctive tags:
- Bill designator with hyphen: `bill-c-27`, `bill-s-210` (matches the official "C-27" / "S-210" form — note this differs from the artifact `id`, which uses `bill-c27-...` without the inner hyphen)
- Short name / acronym: `aida`, `online-harms-act`
- Specific topics: `high-impact-ai-systems`, `prorogation`, `royal-assent`, `digital-charter-implementation-act`
- Institutions when they're central: `house-of-commons`, `senate`, `parliament`, `federal-government`

## Stage Dates: Get Them Exact

Do not use month-only dates. For committee pauses, procedural turns, and votes, dig into:
- LEGISinfo's full stage list
- Committee minutes (each meeting has a date; "paused until X" language often appears in a specific meeting's minutes)
- Hansard / Debates for House and Senate chamber actions

A `stages[].note` is the right place for context the date alone doesn't convey (e.g. "Meeting 126 — last clause-by-clause session before a summer pause.").

## Workflow

Use the standard project flow (see `CLAUDE.local.md`):

1. `superpowers:brainstorming` — confirm the artifact shape, which final-status event (if any), and whether any schema extension is needed
2. `superpowers:writing-plans` — task-by-task plan
3. `superpowers:using-git-worktrees` if changes are substantial; otherwise a feature branch is fine
4. `superpowers:executing-plans` or `superpowers:subagent-driven-development`
5. `superpowers:finishing-a-development-branch`

For a bill whose data shape fits the existing schema, brainstorming can be light — the structure in this skill is usually enough.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Creating a separate event for every legislative stage | Only introduction + final status are events; everything else lives in `stages[]`. |
| Listing the reviewing committee on the introduction event | The committee only receives the bill after second reading. Omit `organizations` from the introduction event. |
| Using month-only dates (`2024-05`) | Research the exact date from committee minutes or Hansard. |
| Putting `canadian` / `legislation` / `ai-regulation` tags on new records | These are implicit. Drop them. |
| Using `policy_recommendations[]` for what the bill *does* | `policy_recommendations[]` tracks adoption of someone else's suggestions. Use `provisions[]` for the bill's own obligations and mechanisms. |
| Hyphenation drift between `id` and tags | `id: bill-c27-aida` (no inner hyphen) vs `tag: bill-c-27` (with hyphen, matches the official designator). Both are correct — don't "fix" either to match. |
| Folded scalar (`>`) for a multi-paragraph `description` | Collapses blank lines to one `\n`; Markdown renders it as a single wall-of-text paragraph. Use a literal block scalar (`|`). See "Description" above. |
| Naming another bill in a description and breaking e2e | The policy legislation card is one big `<a>` whose accessible name includes the description, so mentioning e.g. "Bill C-27" makes name-based Playwright locators (`getByRole('link', { name: /Bill C-27/i })`) match multiple cards. Target cards by `href` (`a[href="/artifacts/<id>/"]`) instead. |

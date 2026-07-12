# Risk → Recommendation → Implementation Map

**Date:** 2026-07-12
**Issue:** [#33 — Add a map from AI risk/benefit to recommendation to government implementation](https://github.com/jrhender/ai-governance-tracker/issues/33)
**Status:** Approved design, pending implementation plan

## Goal

Track which AI risks have been identified (by civil society, academia, or government),
which policy recommendations address them, and whether the Canadian government has
implemented those recommendations — with metrics so progress and gaps are visible
at a glance.

## Background

The tracker already models most of the raw material:

- `policy_recommendations` are embedded in 6 artifacts (49 recommendations total,
  all currently `status: untracked`) with a status enum
  (`untracked | under_review | adopted | rejected`).
- `risk_findings` are embedded in 1 artifact (International AI Safety Report 2026,
  ~12 findings) with `category` and `evidence_level`.
- Government implementation artifacts exist as data (National AI Strategy, CAISI,
  Bills C-16/C-27/C-34/C-36, …).

What is missing is any linkage between the three, and any rollup view.

### Prior art: MIT AI Risk Initiative

The [MIT AI Risk Repository](https://airisk.mit.edu/) maintains a taxonomy of
7 risk domains / 24 subdomains and an [AI Governance Map](https://airisk.mit.edu/ai-governance)
that scores 1,000+ governance documents (from CSET's AGORA archive) for coverage
of each risk subdomain. Their unit of analysis is document-level *coverage*, not
an item-level accountability chain — the risk → specific recommendation →
implementation-status chain in this design is not something they track, and is
the novel contribution of this feature. We adopt their domain taxonomy as our
classification vocabulary (with attribution) so our data is comparable with a
recognized external standard, and we borrow their gap-analysis framing ("which
risk domains have no adopted policy?") for our metrics.

## Design

### 1. New `risks` content collection (`data/risks/`)

Canonical risk records, one YAML file per risk, loaded via the existing
`yamlGlob` pattern and registered in `src/content.config.ts`:

```yaml
id: ai-enabled-fraud
schema_type: DefinedTerm        # schema.org/DefinedTerm — a concept
title: "AI-enabled crime and fraud"
description: >
  Use of AI systems for scams, fraud, blackmail, and non-consensual imagery.
domain: malicious-actors-misuse          # MIT domain slug (enum of 7)
subdomain: fraud-scams-manipulation      # MIT subdomain slug (enum of 24)
tags: [fraud, deepfakes]
```

`domain` and `subdomain` are validated by zod enums generated from a vocabulary
module `src/lib/riskTaxonomy.ts` (slugs + display labels for the 7 domains and
24 subdomains of the MIT AI Risk Taxonomy). Implementation should verify slugs
and labels against the published taxonomy (v3, Patterns 2026 paper). The
subdomain enum is constrained to subdomains of the declared domain via a
`superRefine` check.

MIT domains (subdomain counts): Discrimination & toxicity (3),
Privacy & security (2), Misinformation (2), Malicious actors & misuse (3),
Human-computer interaction (2), Socioeconomic & environmental harm (6),
AI system safety, failures & limitations (6).

### 2. Artifact schema changes (`src/content.config.ts`)

- `risk_findings` items gain an optional `risk: reference("risks")`. Findings
  stay embedded in the report that stated them (provenance preserved); the
  reference means "this is that report's statement of canonical risk X".
- `policy_recommendations` items gain:
  - `addresses_risks: [reference("risks")]`, default `[]`. Process
    recommendations (e.g. "launch a national conversation") may legitimately
    address none.
  - `implemented_by`, default `[]`: a list of
    `{ artifact?: reference("artifacts"), event?: reference("events"),
    relationship: "implements" | "partially_implements" | "related",
    note?: string }` — exactly one of `artifact`/`event` per entry (enforced
    with `superRefine`). This is the evidence trail that justifies a `status`
    of `adopted` or `under_review`.

Astro `reference()` resolves at build time, so stale ids fail CI instead of
rendering broken links. No existing data becomes invalid — all new fields are
optional or defaulted.

### 3. `/map` page (`src/pages/map/index.astro`)

Static page (per ADR-0003), no React island in v1 — all content rendered at
build.

- **Metrics strip** at the top: recommendation counts by status, number of
  tracked risks, and the gap headline — MIT domains with zero adopted
  recommendations (Canada-specific gap analysis).
- **Domain sections**: for each MIT domain with content — each canonical risk
  with its subdomain chip, the source reports that identified it (via linked
  `risk_findings`), the recommendations that address it (title, source
  artifact, status chip reusing the styling in `src/pages/artifacts/[id].astro`),
  and implementation links with their `relationship`.
- **General / process recommendations** section at the end for recommendations
  with no `addresses_risks`, so nothing is hidden from the rollup.
- Footer attribution to the MIT AI Risk Repository taxonomy.
- Navigation: add "Map" to the site nav in `BaseLayout.astro`.

Join and metrics logic lives in `src/lib/riskMap.ts` as pure functions
(following the `timeline.ts` / `sourceCategory.ts` pattern) so it is unit
testable: build risk → findings/recommendations groupings, compute status
counts, compute per-domain coverage and the zero-adopted-domain list, and
collect orphan recommendations.

### 4. Data seeding

- Create canonical risk records in `data/risks/` from the ~12 IASR 2026
  `risk_findings`, and set each finding's `risk:` reference.
- Add `addresses_risks` to the 49 existing recommendations where the mapping
  is clear from the recommendation text; leave unclear ones unlinked rather
  than guessing.
- Recommendation `status` values are **not** re-evaluated in this work — the
  map showing mostly `untracked` is honest and is itself the motivation for
  future data contributions.

### 5. Testing

- Vitest unit tests for `src/lib/riskMap.ts` (grouping, metrics, orphan
  handling, empty-domain gap list) and `riskTaxonomy.ts` (7 domains, 24
  subdomains, every subdomain maps to a valid domain).
- Playwright e2e smoke test: `/map` renders at least one domain section,
  status chips, and the metrics strip. (Runs in CI only; local sandbox cannot
  run Playwright.)
- `pnpm build` doubles as validation that all `reference()` links resolve.

## Out of scope for v1

- **Benefits**: no source content models benefits yet. When one does,
  generalize with a `valence: risk | benefit` field rather than a parallel
  structure.
- **Per-risk detail pages** (`/risks/[id]`): cheap to add later on top of the
  canonical records.
- **Coverage scores** (MIT-style graded depth of coverage): our binary
  link is sufficient to start.
- **Client-side filtering** on the map page.
- **Status re-evaluation** of existing recommendations.

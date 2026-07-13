# Risk → Mitigation → Implementation Map

**Date:** 2026-07-12 (revised 2026-07-13: three-layer model with canonical mitigations)
**Issue:** [#33 — Add a map from AI risk/benefit to recommendation to government implementation](https://github.com/jrhender/ai-governance-tracker/issues/33)
**Status:** Approved design, pending implementation plan

## Goal

Track which AI risks have been identified (by civil society, academia, or
government), which mitigations have been proposed to address them, and whether
the Canadian government has implemented those mitigations — with metrics so
progress and gaps are visible at a glance.

## Background

The tracker already models most of the raw material:

- `policy_recommendations` are embedded in 6 artifacts (49 recommendations
  total, all currently `status: untracked`).
- `risk_findings` are embedded in 1 artifact (International AI Safety Report
  2026, ~12 findings) with `category` and `evidence_level`.
- Government implementation artifacts exist as data (National AI Strategy,
  CAISI, Bills C-16/C-27/C-34/C-36, …).

What is missing is any linkage between the three, and any rollup view.

### Conceptual model

A **mitigation** is a deduplicated intervention ("provenance/watermarking
requirements", "a Ministry of AI", "third-party audits"). A report's
*recommendation* is that org's endorsement of a mitigation — who asked for it,
when, and with what specific framing. A *policy* (bill, program, strategy) is
what puts a mitigation into reality. So the chain is:

```
report ──identifies──▶  RISK  ◀──addresses── MITIGATION ◀──recommends── report
        (risk_findings)                        │  (policy_recommendations)
                                        implemented_by
                                               ▼
                                    POLICY / GOV ACTION (status)
```

Implementation `status` lives on the mitigation — one place, no matter how
many reports recommend it. Embedded findings/recommendations remain in their
source artifacts purely as provenance edges.

### Prior art: MIT AI Risk Initiative

The [MIT AI Risk Repository](https://airisk.mit.edu/) maintains a risk
taxonomy of 7 domains / 24 subdomains, a
[Mitigation Taxonomy](https://airisk.mit.edu/ai-risk-mitigations) of 4 control
categories / 23 subcategories (with a database of 831 mitigations from 13
frameworks), and an [AI Governance Map](https://airisk.mit.edu/ai-governance)
that scores 1,000+ governance documents (from CSET's AGORA archive) for
coverage of each risk subdomain. Their unit of analysis is document-level
*coverage*; the item-level risk → mitigation → implementation-status chain in
this design is not something they track, and is the novel contribution of this
feature. We adopt both MIT taxonomies as classification vocabularies (with
attribution) so our data is comparable with a recognized external standard,
and we borrow their gap-analysis framing ("which risk domains have no adopted
mitigation?") for our metrics.

Note: MIT's mitigation taxonomy is written for *organizational* controls
(board oversight, model alignment, staged deployment). Many of our mitigations
map cleanly (third-party audits → Testing & Auditing), but government-machinery
asks ("establish a Ministry of AI") fit awkwardly — hence `mitigation_type` is
optional.

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
24 subdomains of the MIT AI Risk Taxonomy, verified against the published v3
taxonomy). A `superRefine` check constrains `subdomain` to subdomains of the
declared `domain`.

MIT risk domains (subdomain counts): Discrimination & toxicity (3),
Privacy & security (2), Misinformation (2), Malicious actors & misuse (3),
Human-computer interaction (2), Socioeconomic & environmental harm (6),
AI system safety, failures & limitations (6).

### 2. New `mitigations` content collection (`data/mitigations/`)

Canonical mitigation records — the hub of the map:

```yaml
id: ministry-of-ai
schema_type: DefinedTerm
title: "Establish a dedicated federal Ministry of AI"
description: >
  A Cabinet-level ministry housing AI regulatory bodies, coordinating federal
  action, and avoiding ISED's conflicting develop-and-regulate mandate.
mitigation_type: governance-oversight    # optional; MIT control category (enum of 4)
addresses_risks:                         # canonical risk ids; may be empty for
  - governance-failure                   # process/machinery mitigations
status: untracked                        # untracked | under_review | adopted | rejected
implemented_by: []                       # evidence trail when status advances:
# - artifact: canada-national-ai-strategy
#   relationship: partially_implements   # implements | partially_implements | related
#   note: "Strategy assigns AI coordination to a Minister of AI without a full ministry"
tags: [government-machinery]
```

`mitigation_type` uses the four MIT control categories (Governance & Oversight,
Technical & Security, Operational Process, Transparency & Accountability) as a
zod enum in `src/lib/mitigationTaxonomy.ts`. Subcategories (23) are documented
in that module for future use but not part of the v1 schema. Each
`implemented_by` entry names exactly one of `artifact`/`event` (enforced with
`superRefine`) plus `relationship` and an optional `note`.

The `status` field moves here from `policy_recommendations` — a mitigation has
one implementation status regardless of how many reports recommend it.

### 3. Artifact schema changes (`src/content.config.ts`)

- `risk_findings` items gain an optional `risk: reference("risks")`. Findings
  stay embedded in the report that stated them (provenance preserved); the
  reference means "this is that report's statement of canonical risk X".
- `policy_recommendations` items gain an optional
  `mitigation: reference("mitigations")` and **lose** their `status` field
  (moved to the mitigation). They keep `id`, `title`, `summary`,
  `robustness`, `scenarios` — the org's specific framing of the ask.
  Recommendations without a `mitigation` reference are allowed (not yet
  mapped) and surface in the map's unmapped section.

Astro `reference()` resolves at build time, so stale ids fail CI instead of
rendering broken links.

### 4. `/map` page (`src/pages/map/index.astro`)

Static page (per ADR-0003), no React island in v1 — all content rendered at
build.

- **Metrics strip** at the top: mitigation counts by status, tracked risk
  count, and two gap headlines — MIT risk domains with zero adopted
  mitigation, and mitigations recommended but not yet implemented
  (Canada-specific gap analysis on both MIT axes).
- **Domain sections**: for each MIT risk domain with content — each canonical
  risk with its subdomain chip, the reports that identified it (via linked
  `risk_findings`), and the mitigations addressing it: title, control-type
  chip, status chip (reusing the styling in `src/pages/artifacts/[id].astro`),
  "recommended by" links to source reports, and implementation links with
  their `relationship`.
- **General / machinery mitigations** section for mitigations with no
  `addresses_risks`, and an **unmapped recommendations** section for embedded
  recommendations not yet linked to a mitigation, so nothing is hidden from
  the rollup.
- Footer attribution to the MIT AI Risk Repository taxonomies.
- Navigation: add "Map" to the site nav in `BaseLayout.astro`.

Join and metrics logic lives in `src/lib/riskMap.ts` as pure functions
(following the `timeline.ts` / `sourceCategory.ts` pattern): build
risk → mitigation → implementation groupings, invert the
recommendation → mitigation edges into "recommended by" lists, compute status
counts, per-domain coverage, the zero-adopted-domain list, and collect
unmapped recommendations.

### 5. Data seeding

- Create canonical risk records in `data/risks/` from the ~12 IASR 2026
  `risk_findings`, and set each finding's `risk:` reference.
- Create canonical mitigation records from the 49 existing recommendations,
  deduplicating across sources (e.g. "national conversation on AI" appears in
  three AIGS papers → one mitigation with three "recommended by" edges).
  All seeded mitigations start `status: untracked`; leave unclear
  recommendation → mitigation mappings unlinked rather than guessing.
- Set `addresses_risks` on mitigations where the mapping to a canonical risk
  is clear from the source text.
- Statuses are **not** re-evaluated in this work — the map showing mostly
  `untracked` is honest and is itself the motivation for future data
  contributions.

### 6. Testing

- Vitest unit tests for `src/lib/riskMap.ts` (grouping, recommended-by
  inversion, metrics, unmapped handling, empty-domain gap list) and the
  taxonomy modules (7 risk domains / 24 subdomains, every subdomain maps to a
  valid domain; 4 mitigation categories).
- Playwright e2e smoke test: `/map` renders at least one domain section,
  status chips, and the metrics strip. (Runs in CI only; local sandbox cannot
  run Playwright.)
- `pnpm build` doubles as validation that all `reference()` links resolve.

## Out of scope for v1

- **Benefits**: no source content models benefits yet. When one does,
  generalize with a `valence: risk | benefit` field rather than a parallel
  structure.
- **Per-risk / per-mitigation detail pages**: cheap to add later on top of the
  canonical records.
- **MIT mitigation subcategories** (23) in the schema, and **coverage scores**
  (MIT-style graded depth): the binary link and 4 top-level control types are
  sufficient to start.
- **Client-side filtering** on the map page.
- **Status re-evaluation** of existing recommendations/mitigations.

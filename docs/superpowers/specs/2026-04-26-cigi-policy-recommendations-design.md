# Design: CIGI Policy Recommendations Data Entry

Date: 2026-04-26  
Issue: [#13 — Add policy element content](https://github.com/jrhender/ai-governance-tracker/issues/13)  
Related: [#14 — Data ADRs](https://github.com/jrhender/ai-governance-tracker/issues/14), [#33 — Risk mapping](https://github.com/jrhender/ai-governance-tracker/issues/33)

## Overview

Fill the currently empty `policy_recommendations` block in
`data/artifacts/2026-02-06-cigi-pco-ai-national-security-report.yaml` with
structured data drawn from Figure 3 of the report (the "no regrets" /
"necessary bets" synthesis table, ~25 items). Simultaneously establish a
`docs/data-adr/` directory for data architecture decisions, and record the
schema decisions made here as ADR-0002.

## Schema

Each recommendation entry:

```yaml
- id: rec-no-regrets-001        # stable kebab ID, prefixed by robustness type
  title: "Short label"          # 3-8 words, drawn from the report
  summary: "..."                # one sentence expanding the title
  robustness: robust            # robust | contingent
  scenarios: []                 # omitted for robust items; list of scenario IDs for contingent
  status: untracked             # untracked | under_review | adopted | rejected
```

### Field rationale

**`robustness`** (`robust` | `contingent`): Captures the report's
"no regrets" / "necessary bets" distinction. "No regrets" actions have
positive expected value across all possible AI futures; "necessary bets" are
only worth pursuing if a particular scenario materializes. `robustness` names
this expected-value property rather than calling it a category or priority.

**`title`**: A short human-readable label alongside the longer `summary`,
following the pattern established in `data/artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml`
(`provisions` → `id`/`title`/`summary`).

**`scenarios`**: Present only on contingent items. References scenario IDs
defined within this artifact's context. This is a staging field for the
future risk→recommendation mapping (issue #33): once a risk taxonomy exists,
risks will carry scenario-probability data, and recommendations will gain an
`addresses` field referencing risk IDs. `scenarios` and `addresses` are
intentionally separate — scenarios are macro-level futures, risks are specific
failure modes whose likelihood varies across scenarios.

**`status`**: Existing field; unchanged.

### Scenario IDs

Used in `scenarios` for contingent items:

| ID | Scenario |
|----|----------|
| `scenario-ai-stall` | Scenario 1 — AI Stall |
| `scenario-precarious-precipice` | Scenario 2 — Precarious Precipice |
| `scenario-hypercompetition` | Scenario 3a — Hypercompetition |
| `scenario-hyperpower` | Scenario 3b — Hyperpower |
| `scenario-rogue-asi` | Scenario 4 — Rogue ASI |

## Data source

Figure 3 of the report (pp. 36–38): "Policy Responses." Items are drawn
verbatim or near-verbatim from the table and lightly edited for YAML
readability. The report organizes responses as:

- **No regrets** (11 items): cross-cutting, useful in all scenarios
- **Necessary bets** per scenario: 3 (S1) + 8 (S2) + 5 (S3a) + 3 (S3b) + 4 (S4) = 23 items

Total: ~34 entries. IDs are prefixed `rec-no-regrets-NNN` and
`rec-s1-NNN` / `rec-s2-NNN` / `rec-s3a-NNN` / `rec-s3b-NNN` / `rec-s4-NNN`.

## ADR changes

Three ADR-related deliverables:

1. **Update `docs/adr/0001`** — add a note that site/infrastructure decisions
   live in `docs/adr/` and data model decisions live in `docs/data-adr/`.

2. **`docs/data-adr/0001-record-data-architecture-decisions.md`** — bootstrap
   ADR establishing the `docs/data-adr/` directory, conventions (same NNNN
   format as site ADRs), and scope (data model: schema fields, cross-reference
   conventions, YAML structure, schema.org mappings, data directory layout).

3. **`docs/data-adr/0002-policy-recommendation-schema.md`** — captures the
   decisions in this spec: `robustness` field and values, `title`+`summary`
   pattern, `scenarios` as staging field for future risk linkage, `addresses`
   deferred to issue #33.

## Files changed

| File | Change |
|------|--------|
| `data/artifacts/2026-02-06-cigi-pco-ai-national-security-report.yaml` | Fill `policy_recommendations` block; remove TODO comment and placeholder |
| `docs/adr/0001-record-architecture-decisions.md` | Add note about `docs/data-adr/` split |
| `docs/data-adr/0001-record-data-architecture-decisions.md` | New — bootstrap data ADR |
| `docs/data-adr/0002-policy-recommendation-schema.md` | New — schema decisions for policy recommendations |

## Out of scope

- Risk taxonomy (`addresses` field, issue #33)
- UI changes to surface `robustness` or `scenarios` on the timeline or artifact pages
- People records for Duncan Cass-Beggs and Matthew da Mota (authors listed in the artifact)

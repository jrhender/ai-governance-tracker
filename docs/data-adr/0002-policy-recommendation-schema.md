# 2. Policy recommendation schema

Date: 2026-04-26

## Status

Accepted

## Context

The CIGI/PCO AI National Security Scenarios report (artifact
`cigi-pco-ai-national-security-report-2026`) organizes its policy recommendations
into two groups from Figure 3:

- **"No regrets"**: 11 cross-cutting actions useful in all scenarios.
- **"Necessary bets"**: scenario-specific actions (3, 8, 5, 3, 4 items for
  Scenarios 1–4).

The existing `policy_recommendations` schema had only `id`, `summary`, and
`status`. It needed extension to capture the no-regrets/necessary-bets
distinction, a short human-readable title, and scenario linkage for contingent
items.

Other artifacts use a `provisions` field (e.g., ISED code of practice) with
`id`/`title`/`summary`. The `policy_recommendations` field is kept as a
separate concept: provisions describe substantive principles; recommendations
describe actionable policy asks.

## Decision

**`robustness` field** (`robust` | `contingent`): Captures the expected-value
distinction the report makes. "No regrets" actions have positive value in all
possible AI futures (robust to the future); "necessary bets" are only worth
pursuing if a particular scenario materializes (contingent on it). The field
name describes the property rather than the report's colloquial label.

**`title` field**: A short (3–8 word) human-readable label alongside the
longer `summary`. Follows the `id`/`title`/`summary` pattern from ISED
provisions.

**`scenarios` field** (list of scenario IDs, present only on contingent items):
Records which scenario(s) a recommendation applies to. Omitted on robust items
to keep the YAML clean. This field is a staging ground for the future
risk→recommendation mapping (issue #33): once a risk taxonomy is built, risks
will carry scenario-probability data, and recommendations will gain an
`addresses` field referencing risk IDs. `scenarios` and the future `addresses`
are intentionally separate — scenarios are macro-level futures, risks are
specific failure modes whose likelihood varies across scenarios.

**`status` field**: Unchanged from existing schema (`untracked | under_review |
adopted | rejected`).

Scenario IDs used in `scenarios`:

| ID | Scenario |
|----|----------|
| `scenario-ai-stall` | Scenario 1 — AI Stall |
| `scenario-precarious-precipice` | Scenario 2 — Precarious Precipice |
| `scenario-hypercompetition` | Scenario 3a — Hypercompetition |
| `scenario-hyperpower` | Scenario 3b — Hyperpower |
| `scenario-rogue-asi` | Scenario 4 — Rogue ASI |

Recommendation IDs use prefixes: `rec-nr-NNN` (no regrets),
`rec-s1-NNN`, `rec-s2-NNN`, `rec-s3a-NNN`, `rec-s3b-NNN`, `rec-s4-NNN`.

## Consequences

- `policy_recommendations` entries now have `id`, `title`, `summary`,
  `robustness`, optionally `scenarios`, and `status`.
- Other artifacts that gain `policy_recommendations` in future should follow
  this schema; `provisions` remains a separate field for principle descriptions.
- When issue #33 risk taxonomy is built, add `addresses: []` to recommendations
  and populate with risk IDs. The `scenarios` field can remain as-is (it records
  the report's own scenario linkage, which may differ from the risk taxonomy's
  scenario-probability mapping).

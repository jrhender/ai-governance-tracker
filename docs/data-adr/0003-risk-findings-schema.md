# 3. Risk findings schema

Date: 2026-05-02

## Status

Accepted

## Context

The *International AI Safety Report 2026* (Bengio et al., DSIT 2026/001) explicitly
states "policy recommendations are outside the scope of this work." What it provides
instead are categorised risk findings across Chapter 2, with varying degrees of
supporting evidence.

The existing artifact schema has two structured list fields:
- `policy_recommendations` — actionable policy asks (with `status`, `robustness`)
- `provisions` — substantive principles in regulatory documents

Neither fits evidence-based risk findings. A `risk_findings` field is added as a
distinct concept: it describes what the report found about the world, not what
it recommends actors do.

This field also seeds the risk taxonomy planned in issue #33: once cross-artifact
risk IDs are established, `policy_recommendations` entries will gain an `addresses:`
field referencing risk IDs.

## Decision

**`risk_findings` field** — a top-level list on artifact records, parallel to
`policy_recommendations`. Each entry has:

- **`id`** (`risk-<source>-NNN`): Unique identifier scoped to the source artifact.
  The `iasr` prefix is used for entries from the International AI Safety Report.
- **`category`** (`misuse | structural | societal`): Maps to the report's Chapter 2
  subsections — §2.1 (misuse by actors), §2.2 (risks from AI system behaviour),
  §2.3 (broader socioeconomic impacts).
- **`title`**: Short (3–6 word) human-readable label.
- **`summary`**: 2–3 sentence synthesis of the finding.
- **`evidence_level`** (`established | emerging | uncertain`):
  - `established` — well-documented, systematic evidence exists
  - `emerging` — documented but limited, inconsistent, or early-stage evidence
  - `uncertain` — difficult to assess; material uncertainties acknowledged by report

`risk_findings` does not carry a `status` field (unlike `policy_recommendations`),
because risk findings describe observed or assessed states of the world, not
implementation progress of policy actions.

## Consequences

- `risk_findings` entries have: `id`, `category`, `title`, `summary`,
  `evidence_level`.
- Other artifacts that surface risk evidence may adopt `risk_findings` following
  this schema.
- When issue #33 risk taxonomy is built, `policy_recommendations` entries will
  gain an `addresses: []` field referencing risk IDs from across artifacts.
  The `risk_findings` entries here serve as the initial seed set.

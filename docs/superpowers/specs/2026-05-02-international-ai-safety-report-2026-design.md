# International AI Safety Report 2026 — Data Entry Design

**Date:** 2026-05-02  
**Branch:** feature/international-ai-safety-report-2026  
**Source doc:** `docs/international-ai-safety-report-2026-analysis.md`

---

## Goal

Add the *International AI Safety Report 2026* (Bengio et al., DSIT 2026/001) as a structured artifact, capturing the Chapter 2 risk findings in a new `risk_findings` field. This provides the foundational data for the planned risk taxonomy (issue #33) and makes the report's risk evidence browseable alongside other artifacts.

## Scope

- New artifact YAML: `data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml`
- New data ADR: `docs/data-adr/0003-risk-findings-schema.md`
- No UI changes; no new pages.

## Artifact

**File:** `data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml`

Standard fields:
- `id: international-ai-safety-report-2026`
- `type: Report`
- `schema_type: CreativeWork`
- `published_date: 2026-02-01`
- Authors inline (100+ contributors; list lead authors only): Yoshua Bengio (chair), and the DSIT commissioning body
- Organization: DSIT (UK) — no existing org file; use inline `name:` field
- `links`: publication page (`https://internationalaisafetyreport.org`) and PDF

The report explicitly states policy recommendations are outside its scope, so no `policy_recommendations` field.

## `risk_findings` Schema

Each entry under `risk_findings:` has five fields:

| Field | Type | Values |
|---|---|---|
| `id` | string | `risk-iasr-NNN` |
| `category` | enum | `misuse \| structural \| societal` |
| `title` | string | short label (3–6 words) |
| `summary` | block scalar | 2–3 sentence synthesis |
| `evidence_level` | enum | `established \| emerging \| uncertain` |

**Category mapping to report sections:**
- `misuse` → §2.1 (harmful use by actors)
- `structural` → §2.2 (risks from AI system behaviour)
- `societal` → §2.3 (broader socioeconomic impacts)

**Evidence level definitions:**
- `established` — well-documented, systematic evidence exists
- `emerging` — documented but limited, inconsistent, or early-stage evidence
- `uncertain` — difficult to assess; material uncertainties acknowledged by the report

## Risk Entries (8 total)

| id | category | title | evidence_level |
|---|---|---|---|
| risk-iasr-001 | misuse | AI-enabled crime and fraud | established |
| risk-iasr-002 | misuse | Influence and manipulation | emerging |
| risk-iasr-003 | misuse | AI-enabled cyberattacks | emerging |
| risk-iasr-004 | misuse | Biological and chemical risks | uncertain |
| risk-iasr-005 | structural | Reliability and AI agents | emerging |
| risk-iasr-006 | structural | Loss of control | uncertain |
| risk-iasr-007 | societal | Labour market impacts | emerging |
| risk-iasr-008 | societal | Risks to human autonomy | emerging |

Content for each `summary` is drawn from the extracted analysis in `docs/international-ai-safety-report-2026-analysis.md`.

## Data ADR

**File:** `docs/data-adr/0003-risk-findings-schema.md`

Records:
- Why a new `risk_findings` field (vs. `policy_recommendations` or `provisions`)
- The three categories and their section mappings
- The three evidence levels and their definitions
- That `risk-iasr-NNN` IDs are the seed for issue #33's cross-artifact risk taxonomy
- Future: recommendations will gain an `addresses:` field referencing risk IDs

## Out of Scope

- Chapter 3 (challenges for policymakers, resilience table) — omitted per decision to cover Chapter 2 only
- Frontier AI Safety Frameworks table (§2 appendix) — belongs to a separate artifact per developer, not this report
- UI changes to display `risk_findings` — deferred to a follow-on issue

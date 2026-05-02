# International AI Safety Report 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the International AI Safety Report 2026 (Bengio et al.) as a structured artifact with a new `risk_findings` field capturing Chapter 2's eight risk categories, and record the schema decision in a data ADR.

**Architecture:** Data-only change — two new files, no UI or API modifications. The `risk_findings` field is a new top-level list field on artifact records, parallel to `policy_recommendations`.

**Tech Stack:** YAML, Markdown

---

### Task 1: Write data-ADR-0003 — risk_findings schema

**Files:**
- Create: `docs/data-adr/0003-risk-findings-schema.md`

- [ ] **Step 1: Create the ADR**

Create `docs/data-adr/0003-risk-findings-schema.md` with this exact content:

```markdown
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
```

- [ ] **Step 2: Validate the file is well-formed Markdown**

```bash
python3 -c "
with open('docs/data-adr/0003-risk-findings-schema.md') as f:
    content = f.read()
assert '## Status' in content
assert '## Context' in content
assert '## Decision' in content
assert '## Consequences' in content
print('ADR structure valid')
"
```

Expected: `ADR structure valid`

- [ ] **Step 3: Commit**

```bash
git add docs/data-adr/0003-risk-findings-schema.md
git commit -m "Add data-ADR-0003: risk_findings schema (issue #33 seed)"
```

---

### Task 2: Create the artifact YAML

**Files:**
- Create: `data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml`

- [ ] **Step 1: Create the artifact file**

Create `data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml` with this exact content:

```yaml
# artifacts/2026-02-01-international-ai-safety-report-2026.yaml

id: international-ai-safety-report-2026
type: Report
schema_type: CreativeWork

title: "International AI Safety Report 2026"
published_date: 2026-02-01

authors:
  - name: "Yoshua Bengio"
    role: chair
  - name: "100+ independent experts from 30+ countries"
    role: contributing_authors

organizations:
  - name: "UK Department for Science, Innovation and Technology (DSIT)"
    role: publisher

description: >
  Comprehensive international assessment of AI safety, led by Yoshua Bengio and
  produced by over 100 independent experts from more than 30 countries. Commissioned
  by the UK government (DSIT 2026/001). The report covers the current state of AI
  capabilities, categorised risk findings across misuse, structural, and societal
  domains, risk management practices, and resilience-building measures. The report
  explicitly states that policy recommendations are outside its scope; it provides
  evidence-based findings and challenges for policymakers instead.

links:
  - label: "Publication Page"
    url: https://internationalaisafetyreport.org
    icon: document

risk_findings:
  # §2.1 — Misuse risks (harmful use by actors)
  - id: risk-iasr-001
    category: misuse
    title: "AI-enabled crime and fraud"
    summary: >
      AI systems are well-documented vectors for scams, fraud, blackmail, and
      non-consensual intimate imagery. While individual cases are well-established,
      systematic data on overall prevalence and severity remains limited.
    evidence_level: established

  - id: risk-iasr-002
    category: misuse
    title: "Influence and manipulation"
    summary: >
      AI-generated persuasion content matches human-written content in experimental
      settings. Real-world deployment for influence operations is documented but not
      yet widespread; the risk is expected to grow as AI capabilities improve.
    evidence_level: emerging

  - id: risk-iasr-003
    category: misuse
    title: "AI-enabled cyberattacks"
    summary: >
      AI agents can identify 77% of real software vulnerabilities in controlled
      settings, and criminal and state-associated groups are actively using
      general-purpose AI in cyber operations. The overall offence–defence balance
      remains uncertain.
    evidence_level: emerging

  - id: risk-iasr-004
    category: misuse
    title: "Biological and chemical risks"
    summary: >
      In 2025, multiple developers released models after being unable to exclude the
      possibility of assisting novices in developing bioweapons, prompting heightened
      safeguards as a precautionary measure. Material barriers to bioweapons
      development may still constrain actors, but the extent is difficult to assess.
    evidence_level: uncertain

  # §2.2 — Structural risks (risks from AI system behaviour)
  - id: risk-iasr-005
    category: structural
    title: "Reliability and AI agents"
    summary: >
      AI agents operating autonomously pose heightened risks because it is harder for
      humans to intervene before failures cause harm. Current techniques reduce failure
      rates but not to the level required in high-stakes settings.
    evidence_level: emerging

  - id: risk-iasr-006
    category: structural
    title: "Loss of control"
    summary: >
      Models increasingly distinguish between test and real-world contexts
      ("situational awareness"), and some find loopholes in evaluations — raising the
      risk that dangerous capabilities evade pre-deployment detection. Current systems
      lack the capabilities to pose a full loss-of-control risk, but are improving in
      relevant areas.
    evidence_level: uncertain

  # §2.3 — Societal impacts
  - id: risk-iasr-007
    category: societal
    title: "Labour market impacts"
    summary: >
      Early evidence shows no effect on overall employment, but declining demand for
      early-career workers in AI-exposed occupations such as writing. Economists
      disagree substantially on the long-run magnitude of labour displacement.
    evidence_level: emerging

  - id: risk-iasr-008
    category: societal
    title: "Risks to human autonomy"
    summary: >
      Evidence suggests AI reliance can weaken critical thinking and encourage
      automation bias. AI companion apps serve tens of millions of users; a small
      share show increased loneliness and reduced social engagement.
    evidence_level: emerging

tags:
  - ai-safety
  - ai-risks
  - international
  - report
  - bengio
```

- [ ] **Step 2: Validate YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 3: Verify 8 risk_findings entries**

```bash
python3 -c "
import yaml
data = yaml.safe_load(open('data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml'))
findings = data['risk_findings']
print(f'risk_findings count: {len(findings)}')
categories = [f['category'] for f in findings]
levels = [f['evidence_level'] for f in findings]
print(f'categories: {sorted(set(categories))}')
print(f'evidence_levels: {sorted(set(levels))}')
assert len(findings) == 8, f'Expected 8, got {len(findings)}'
assert set(categories) == {'misuse', 'structural', 'societal'}
assert set(levels) == {'established', 'emerging', 'uncertain'}
print('All checks passed')
"
```

Expected:
```
risk_findings count: 8
categories: ['misuse', 'societal', 'structural']
evidence_levels: ['emerging', 'established', 'uncertain']
All checks passed
```

- [ ] **Step 4: Commit**

```bash
git add data/artifacts/2026-02-01-international-ai-safety-report-2026.yaml
git commit -m "Add International AI Safety Report 2026 artifact with risk_findings (8 entries)"
```

---

### Self-review

**Spec coverage:**
- ✅ New artifact YAML — Task 2
- ✅ `risk_findings` with `id`, `category`, `title`, `summary`, `evidence_level` — Task 2
- ✅ 8 entries covering §2.1–§2.3 — Task 2
- ✅ data-ADR-0003 recording the schema decision — Task 1
- ✅ DSIT as inline organization (no org file) — Task 2
- ✅ No `policy_recommendations` field (explicitly out of scope per report) — Task 2
- ✅ Chapter 3 and Frontier Frameworks table excluded per design — N/A

**Placeholder scan:** No TBDs, no vague steps. All YAML and validation code shown in full.

**Type consistency:** `risk_findings` field name used consistently across ADR and artifact. `evidence_level` values (`established`, `emerging`, `uncertain`) and `category` values (`misuse`, `structural`, `societal`) consistent across ADR definition and artifact entries.

# Pan-Canadian Artificial Intelligence Strategy — Data Entry Design

**Date:** 2026-04-25
**Status:** Approved

## Background

The Pan-Canadian Artificial Intelligence Strategy (PCAIS) is a federal government funding program, not a published document. It was announced in Budget 2017 (Phase 1, $125M over 5 years) and renewed in Budget 2021 (Phase 2, $443.8M over 10 years). The federal government appointed CIFAR (Canadian Institute for Advanced Research) as administrator; CIFAR in turn funds and coordinates three national AI institutes: the Vector Institute (Toronto), Mila – Quebec AI Institute (Montréal), and the Alberta Machine Intelligence Institute (Amii, Edmonton).

Because there is no standalone strategy document, the artifact record functions as an anchor page summarizing the program across both phases rather than representing a specific publication.

## Files to Create

### 1. Artifact — `data/artifacts/2017-03-22-pan-canadian-ai-strategy.yaml`

| Field | Value |
|---|---|
| `id` | `pan-canadian-ai-strategy` |
| `type` | `GovernmentProgram` |
| `schema_type` | `CreativeWork` |
| `published_date` | `2017-03-22` |
| `lifecycle_status` | `active` |
| `current_stage` | `"Phase 2 underway (2021–2031)"` |
| `organizations` | `[{id: ised-canada, role: sponsor}]` |

**`description`:** Overview of the program — what it funds, who administers it (CIFAR), the three institutes by name (Vector, Mila, Amii), and the total funding across both phases. No `provisions[]` (the program doesn't impose obligations; it funds research).

**`stages[]`:** Key milestones in chronological order:
- `2017-03-22` — Phase 1 announced in Budget 2017 ($125M over 5 years)
- Vector Institute incorporation date (research exact date)
- Mila designation as national institute date (research exact date)
- Amii designation as national institute date (research exact date)
- `2021-04-19` — Phase 2 announced in Budget 2021 ($443.8M over 10 years)
- Any subsequent renewal, review, or evaluation events found during research

**`links[]`:** Budget 2017 Chapter 1 (science/innovation section), Budget 2021 relevant section, CIFAR PCAIS page.

**`tags`:** `cifar`, `pan-canadian-ai-strategy`, `federal-budget`, `federal-government`, `ai-research`, `national-ai-strategy`

---

### 2. Event — `data/events/2017-03-22-pan-canadian-ai-strategy-launched.yaml`

| Field | Value |
|---|---|
| `id` | `pan-canadian-ai-strategy-phase-1-2017` |
| `type` | `GovernmentAnnouncement` |
| `schema_type` | `Event` |
| `date` | `2017-03-22` |
| `status` | `completed` |
| `related_artifacts` | `[{id: pan-canadian-ai-strategy}]` |

**`title`:** `"Federal Budget 2017 launches Pan-Canadian Artificial Intelligence Strategy"`

**`description`:** Brief note that Budget 2017 committed $125M over 5 years, to be administered by CIFAR, to create three national AI institutes and attract/retain AI researchers.

**`tags`:** `cifar`, `pan-canadian-ai-strategy`, `federal-budget`, `federal-government`, `national-ai-strategy`

---

### 3. Event — `data/events/2021-04-19-pan-canadian-ai-strategy-phase-2-announced.yaml`

| Field | Value |
|---|---|
| `id` | `pan-canadian-ai-strategy-phase-2-2021` |
| `type` | `GovernmentAnnouncement` |
| `schema_type` | `Event` |
| `date` | `2021-04-19` |
| `status` | `completed` |
| `related_artifacts` | `[{id: pan-canadian-ai-strategy}]` |

**`title`:** `"Federal Budget 2021 renews Pan-Canadian AI Strategy with $443.8M Phase 2"`

**`description`:** Brief note that Budget 2021 committed $443.8M over 10 years to expand the strategy's mandate, including responsible AI and commercialization pillars alongside the original research/talent focus.

**`tags`:** `cifar`, `pan-canadian-ai-strategy`, `federal-budget`, `federal-government`, `national-ai-strategy`

## Research Required

Before writing the YAML files, look up exact dates for:
- Vector Institute incorporation (likely spring 2017)
- Mila's designation as a PCAIS national institute (likely 2017)
- Amii's designation as a PCAIS national institute (likely 2017)
- Any Phase 2 evaluation or progress reports published by CIFAR or the government

Primary sources: CIFAR PCAIS page (`cifar.ca/ai-and-society/ai-strategy/`), federal budget documents, individual institute "About" pages for founding dates.

## Out of Scope

- Organization records for CIFAR, Vector, Mila, or Amii (referenced by name in descriptions only for now)
- Provisions / policy obligations (the strategy funds research rather than imposing obligations)
- Phase 3 (not yet announced as of April 2026)

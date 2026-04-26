# Pan-Canadian AI Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Pan-Canadian Artificial Intelligence Strategy (both phases) to the tracker as one artifact and two timeline events.

**Architecture:** One `GovernmentProgram` artifact anchors the program across both phases; two `GovernmentAnnouncement` events (Budget 2017 and Budget 2021) appear on the main timeline and reference the artifact. No new organization records — CIFAR, Vector, Mila, and Amii are referenced by name in descriptions only.

**Tech Stack:** YAML data files, Astro static site. No code changes — data entry only.

**Spec:** `docs/superpowers/specs/2026-04-25-pan-canadian-ai-strategy-design.md`

---

### Task 1: Create feature branch

**Files:**
- No files changed — branch setup only

- [ ] **Step 1: Ensure main is up to date and create branch**

```bash
git checkout main && git pull
git checkout -b feature/pan-canadian-ai-strategy
```

Expected: branch `feature/pan-canadian-ai-strategy` checked out.

---

### Task 2: Extend event type enum in content schema

**Files:**
- Modify: `src/content.config.ts:23-29`

The events collection has a strict `type` enum. `GovernmentAnnouncement` must be added before the event files can pass validation.

- [ ] **Step 1: Add `GovernmentAnnouncement` to the events type enum**

In `src/content.config.ts`, find the `type` enum for the events collection (around line 23) and add `"GovernmentAnnouncement"`:

```typescript
    type: z.enum([
      "CommitteeHearing",
      "GovernmentAnnouncement",
      "LegislativeAction",
      "PoliticalEvent",
      "Publication",
      "Workshop",
    ]),
```

- [ ] **Step 2: Commit**

```bash
git add src/content.config.ts
git commit -m "Add GovernmentAnnouncement to events type enum"
```

---

### Task 3: Write the artifact YAML

**Files:**
- Create: `data/artifacts/2017-03-22-pan-canadian-ai-strategy.yaml`

- [ ] **Step 1: Create the artifact file**

Create `data/artifacts/2017-03-22-pan-canadian-ai-strategy.yaml` with this content:

```yaml
# artifacts/2017-03-22-pan-canadian-ai-strategy.yaml

id: pan-canadian-ai-strategy
type: GovernmentProgram
schema_type: CreativeWork

title: "Pan-Canadian Artificial Intelligence Strategy"
published_date: 2017-03-22

organizations:
  - id: ised-canada
    role: sponsor

lifecycle_status: active
current_stage: "Phase 2 underway (2021–2031)"

description: >
  The Pan-Canadian Artificial Intelligence Strategy (PCAIS) is a federal
  government funding program, first announced in Budget 2017, that established
  Canada as an early mover in national AI strategy. The strategy is administered
  by CIFAR (Canadian Institute for Advanced Research) and funds three national
  AI institutes: the Vector Institute (Toronto), Mila – Quebec AI Institute
  (Montréal), and the Alberta Machine Intelligence Institute (Amii, Edmonton).

  Phase 1 (2017–2022) committed $125 million over five years to attract and
  retain world-leading AI researchers, increase the number of AI-skilled
  graduates, and support a national research community. The three institutes
  were designated as national centres under the strategy in 2017.

  Phase 2 was announced in Budget 2021 with a significantly larger commitment
  of $443.8 million over ten years. It expanded the strategy's mandate beyond
  research and talent to include responsible AI development and
  commercialisation, with CIFAR continuing as administrator.

stages:
  - date: 2017-03-22
    stage: "Phase 1 announced in Budget 2017"
    note: "$125M over 5 years; CIFAR named as administrator"
  - date: 2017-03-01
    stage: "Vector Institute launched (Toronto)"
    note: "Exact date within March 2017 not confirmed from public sources; uses month-start as placeholder — verify against Vector Institute incorporation records"
  - date: 2017-01-01
    stage: "Mila and Amii designated as national AI institutes"
    note: "Exact dates in 2017 not confirmed from public sources; uses year-start as placeholder — verify against CIFAR/institute announcements"
  - date: 2021-04-19
    stage: "Phase 2 announced in Budget 2021"
    note: "$443.8M over 10 years; expanded mandate to include responsible AI and commercialisation"

links:
  - label: "ISED — Pan-Canadian Artificial Intelligence Strategy"
    url: https://ised-isde.canada.ca/site/ai-strategy/en
    icon: document
  - label: "CIFAR — AI Strategy"
    url: https://cifar.ca/ai-and-society/ai-strategy/
    icon: document
  - label: "Budget 2017 — Chapter 1 (Science and Technology)"
    url: https://www.budget.canada.ca/2017/docs/plan/chap-01-en.html
    icon: document
  - label: "Budget 2021 — Pan-Canadian AI Strategy (CBC summary)"
    url: https://www.cbc.ca/news/politics/federal-budget-2021-pan-canadian-ai-strategy-1.5997732
    icon: document

tags:
  - cifar
  - pan-canadian-ai-strategy
  - federal-budget
  - federal-government
  - ai-research
  - national-ai-strategy
```

- [ ] **Step 2: Commit**

```bash
git add data/artifacts/2017-03-22-pan-canadian-ai-strategy.yaml
git commit -m "Add Pan-Canadian AI Strategy artifact (both phases)"
```

---

### Task 4: Write the Phase 1 launch event

**Files:**
- Create: `data/events/2017-03-22-pan-canadian-ai-strategy-launched.yaml`

- [ ] **Step 1: Create the event file**

Create `data/events/2017-03-22-pan-canadian-ai-strategy-launched.yaml` with this content:

```yaml
# events/2017-03-22-pan-canadian-ai-strategy-launched.yaml

id: pan-canadian-ai-strategy-phase-1-2017
type: GovernmentAnnouncement
schema_type: Event

title: "Federal Budget 2017 launches Pan-Canadian Artificial Intelligence Strategy"
date: 2017-03-22
status: completed

organizations:
  - id: ised-canada
    role: organizer

description: >
  Budget 2017 committed $125 million over five years to establish the
  Pan-Canadian Artificial Intelligence Strategy — Canada's first dedicated
  national AI program. The federal government appointed CIFAR (Canadian
  Institute for Advanced Research) as administrator. Funding was directed
  to three newly designated national AI institutes: the Vector Institute
  (Toronto), Mila – Quebec AI Institute (Montréal), and Amii (Edmonton).
  The strategy's initial mandate focused on attracting and retaining
  world-leading researchers, increasing AI-skilled graduates, and building
  a cohesive national research community.

related_artifacts:
  - id: pan-canadian-ai-strategy

tags:
  - cifar
  - pan-canadian-ai-strategy
  - federal-budget
  - federal-government
  - national-ai-strategy
```

- [ ] **Step 2: Commit**

```bash
git add data/events/2017-03-22-pan-canadian-ai-strategy-launched.yaml
git commit -m "Add Budget 2017 PCAIS Phase 1 launch event"
```

---

### Task 5: Write the Phase 2 announcement event

**Files:**
- Create: `data/events/2021-04-19-pan-canadian-ai-strategy-phase-2-announced.yaml`

- [ ] **Step 1: Create the event file**

Create `data/events/2021-04-19-pan-canadian-ai-strategy-phase-2-announced.yaml` with this content:

```yaml
# events/2021-04-19-pan-canadian-ai-strategy-phase-2-announced.yaml

id: pan-canadian-ai-strategy-phase-2-2021
type: GovernmentAnnouncement
schema_type: Event

title: "Federal Budget 2021 renews Pan-Canadian AI Strategy with $443.8M Phase 2"
date: 2021-04-19
status: completed

organizations:
  - id: ised-canada
    role: organizer

description: >
  Budget 2021 committed $443.8 million over ten years to launch Phase 2 of
  the Pan-Canadian Artificial Intelligence Strategy. The renewal significantly
  expanded the strategy's scope beyond the Phase 1 focus on research and
  talent, adding pillars for responsible AI development and commercialisation.
  CIFAR continued as administrator, with the three national institutes
  (Vector, Mila, Amii) each eligible for up to $20 million over five years
  from the new envelope. Additional funding supported the Standards Council
  of Canada ($8.6M) and the Digital Research Alliance ($40M) as part of
  the broader package.

related_artifacts:
  - id: pan-canadian-ai-strategy

tags:
  - cifar
  - pan-canadian-ai-strategy
  - federal-budget
  - federal-government
  - national-ai-strategy
  - responsible-ai
```

- [ ] **Step 2: Commit**

```bash
git add data/events/2021-04-19-pan-canadian-ai-strategy-phase-2-announced.yaml
git commit -m "Add Budget 2021 PCAIS Phase 2 announcement event"
```

---

### Task 6: Verify site builds without errors

**Files:**
- No changes — build check only

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Expected: build completes with no errors. The new artifact and events should appear on the timeline and artifacts pages.

- [ ] **Step 2: Run unit tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 3: If build or tests fail, fix and recommit**

Common issues:
- Unknown `organizations[].id`: `ised-canada` must exist in `data/organizations/`. Verify: `ls data/organizations/ised-canada.yaml`.

---

### Task 7: Open PR

**Files:**
- No file changes — GitHub API call only

- [ ] **Step 1: Push branch**

```bash
git push -u origin feature/pan-canadian-ai-strategy
```

- [ ] **Step 2: Open PR via GitHub API**

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jrhender/ai-governance-tracker/pulls \
  -d '{
    "title": "Add Pan-Canadian Artificial Intelligence Strategy (both phases)",
    "body": "## Summary\n\n- Adds `pan-canadian-ai-strategy` artifact (`GovernmentProgram`) covering Phase 1 (2017) and Phase 2 (2021)\n- Adds Budget 2017 launch event and Budget 2021 Phase 2 announcement event\n- CIFAR, Vector, Mila, and Amii referenced by name in descriptions; no new org records\n\n**Spec:** `docs/superpowers/specs/2026-04-25-pan-canadian-ai-strategy-design.md`\n**Plan:** `docs/superpowers/plans/2026-04-25-pan-canadian-ai-strategy.md`\n\n## Test plan\n\n- [ ] `pnpm build` completes without errors\n- [ ] `pnpm test` passes\n- [ ] PCAIS artifact appears on artifacts/organizations pages\n- [ ] Both events appear on the timeline at correct dates (2017-03-22, 2021-04-19)\n- [ ] Links in artifact resolve\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)",
    "head": "feature/pan-canadian-ai-strategy",
    "base": "main"
  }'
```

Expected: JSON response with `"number"` and `"html_url"` fields. Note the PR URL.

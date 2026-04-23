# Bill C-27 / AIDA — data entry design

**Date:** 2026-04-23
**Status:** Approved

## Purpose

Add Bill C-27 — specifically the Artificial Intelligence and Data Act (AIDA) portion — to the tracker. The bill died on the Order Paper when Parliament was prorogued on 2025-01-06. We want to capture:

- A summary of what AIDA would have done (the regulatory obligations it proposed)
- The full legislative timeline through all its stages
- The bill's final status (died)
- That it was under review by INDU
- Two headline moments on the main timeline: introduction and prorogation

## Approach

**Option C (hybrid)** from brainstorming: the bill is modelled as a single artifact with an embedded `stages` array capturing the full legislative journey. Only two moments are elevated to standalone `event` records so the main timeline stays uncluttered: introduction and prorogation.

## Records

### New artifact — `data/artifacts/2022-06-16-bill-c27-aida.yaml`

```yaml
id: bill-c27-aida
type: Legislation
schema_type: CreativeWork

title: "Bill C-27 — Digital Charter Implementation Act, 2022 (including AIDA)"
published_date: 2022-06-16  # introduction date

lifecycle_status: died
current_stage: "Died on the Order Paper at committee stage (INDU) on prorogation, 6 January 2025"

organizations:
  - id: house-of-commons-indu-committee
    role: reviewed_by

description: >
  The Digital Charter Implementation Act, 2022 bundled three components: the
  Consumer Privacy Protection Act, the Personal Information and Data Protection
  Tribunal Act, and the Artificial Intelligence and Data Act (AIDA) — Canada's
  first proposed federal AI-specific legislation.

  AIDA would have regulated "high-impact" AI systems used in interprovincial
  and international trade, created an AI and Data Commissioner within ISED,
  and imposed obligations across the AI lifecycle. High-impact systems were
  to be defined by risk factors including potential for health/safety harm,
  human rights impacts, scale of use, severity of potential harms, and the
  extent to which users could opt out. Examples cited in the ISED companion
  document included hiring systems, biometric identification tools, behavioural
  influence systems, and autonomous vehicles.

  The bill was referred to the Standing Committee on Industry and Technology
  (INDU) after second reading in April 2023 and remained there through the
  end of the 44th Parliament. The committee paused clause-by-clause
  consideration on 29 May 2024, met once more on 26 September 2024, and on
  21 November 2024 confirmed the study would remain paused until at least
  February 2025. Parliament was prorogued on 6 January 2025, killing the
  bill before it reached report stage, third reading, or the Senate.

stages:
  - date: 2022-06-16
    stage: "Introduction and first reading"
    note: "Bill C-27 introduced in the House of Commons."
  - date: 2022-11-04
    stage: "Second reading debate begins"
  - date: 2023-04-24
    stage: "Second reading passed; referred to INDU"
    note: "Passed on two separate votes (300: 205–109; 301: 203–112)."
  - date: 2023-09-26
    stage: "INDU study begins"
    links:
      - label: "Michael Geist — Why Minister Champagne broke the Bill C-27 hearings on privacy and AI regulation in only 12 minutes"
        url: https://www.michaelgeist.ca/2023/09/why-industry-minister-champagne-broke-the-bill-c-27-hearings-on-privacy-and-ai-regulation-in-only-12-minutes/
        icon: document
  - date: 2023-11-28
    stage: "Minister tables proposed AIDA amendments"
    note: "Minister Champagne submits a letter to INDU with proposed amendments to AIDA."
  - date: 2024-05-29
    stage: "Clause-by-clause consideration pauses"
    note: "Meeting 126 — last clause-by-clause session before a summer pause."
  - date: 2024-09-26
    stage: "Last INDU meeting on C-27"
    note: "Meeting 136 — committee study not completed."
  - date: 2024-11-21
    stage: "INDU confirms study will remain paused"
    note: "Committee confirms the study will remain paused until at least February 2025."
  - date: 2025-01-06
    stage: "Died on the Order Paper"
    note: "Parliament prorogued; Bill C-27 dies along with all other legislation on the Order Paper."

provisions:
  - id: high-impact-scope
    title: "Scope: high-impact AI systems"
    summary: >
      Apply obligations to "high-impact" AI systems used in interprovincial
      or international trade, defined by risk factors including potential for
      health/safety harm, human rights impacts, scale of use, severity of
      potential harms, and the extent to which users cannot opt out.
  - id: human-oversight
    title: "Human oversight and monitoring"
    summary: >
      Require mechanisms for meaningful human oversight of high-impact AI
      systems across their lifecycle.
  - id: transparency
    title: "Transparency"
    summary: >
      Require plain-language disclosures about the AI system's purpose,
      intended use, content it generates, and its limitations.
  - id: fairness
    title: "Fairness and non-discrimination"
    summary: >
      Require measures to identify and mitigate biased outputs and
      discriminatory impacts.
  - id: safety
    title: "Safety"
    summary: >
      Require risk identification and mitigation so that reasonably
      foreseeable uses do not create unreasonable risks of harm.
  - id: accountability
    title: "Accountability"
    summary: >
      Require governance mechanisms (policies, processes, documentation)
      ensuring legal obligations are met across the AI lifecycle.
  - id: robustness
    title: "Validity and robustness"
    summary: >
      Require systems to perform consistently as intended under a range of
      conditions.
  - id: ai-data-commissioner
    title: "AI and Data Commissioner"
    summary: >
      Establish an AI and Data Commissioner within ISED to administer and
      enforce AIDA, separate from criminal prosecution handled by the Public
      Prosecution Service.
  - id: enforcement-tiers
    title: "Tiered enforcement"
    summary: >
      Education and voluntary compliance first; administrative monetary
      penalties and regulatory offences for non-compliance; criminal offences
      for knowing or reckless conduct causing serious harm.

links:
  - label: "LEGISinfo — Bill C-27"
    url: https://www.parl.ca/legisinfo/en/bill/44-1/c-27
    icon: document
  - label: "AIDA companion document (ISED)"
    url: https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act-aida-companion-document
    icon: document
  - label: "ISED — Artificial Intelligence and Data Act page"
    url: https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act
    icon: document
  - label: "INDU — Bill C-27 study activity"
    url: https://www.ourcommons.ca/committees/en/INDU/StudyActivity?studyActivityId=12157763
    icon: document
  - label: "Charter Statement (Justice Canada)"
    url: https://www.justice.gc.ca/eng/csj-sjc/pl/charter-charte/c27_1.html
    icon: document

tags:
  - bill-c-27
  - aida
  - digital-charter-implementation-act
  - federal-government
  - high-impact-ai-systems
  - ai-data-commissioner
```

### New event — `data/events/2022-06-16-bill-c27-introduced.yaml`

```yaml
id: bill-c27-introduced-2022
type: LegislativeAction
schema_type: Event

title: "Bill C-27 introduced in the House of Commons (first reading)"
date: 2022-06-16
status: completed

description: >
  The Digital Charter Implementation Act, 2022 (Bill C-27) is introduced and
  receives first reading in the House of Commons. The bill bundles three
  components: the Consumer Privacy Protection Act, the Personal Information
  and Data Protection Tribunal Act, and the Artificial Intelligence and Data
  Act (AIDA) — the first proposed federal AI-specific legislation in Canada.

related_artifacts:
  - id: bill-c27-aida

tags:
  - bill-c-27
  - aida
  - federal-government
  - house-of-commons

links:
  - label: "LEGISinfo — Bill C-27"
    url: https://www.parl.ca/legisinfo/en/bill/44-1/c-27
    icon: document
```

### New event — `data/events/2025-01-06-parliament-prorogued-44-1.yaml`

```yaml
id: parliament-prorogued-44-1-2025
type: PoliticalEvent
schema_type: Event

title: "Parliament prorogued — Bill C-27 dies on the Order Paper"
date: 2025-01-06
status: completed

description: >
  Prime Minister Justin Trudeau announces his resignation and Parliament is
  prorogued by proclamation of the Governor General. All legislation on the
  Order Paper, including Bill C-27 (and with it AIDA), dies. INDU's
  clause-by-clause study of the bill ceases.

related_artifacts:
  - id: bill-c27-aida

tags:
  - prorogation
  - parliament
  - bill-c-27
  - aida
  - federal-government

links:
  - label: "LEGISinfo — Bill C-27 (final status)"
    url: https://www.parl.ca/legisinfo/en/bill/44-1/c-27
    icon: document
```

## Schema changes — `src/content.config.ts`

Extend the artifacts schema with three new optional fields:

```ts
lifecycle_status: z
  .enum(["active", "enacted", "died", "withdrawn"])
  .optional(),

current_stage: z.string().optional(),

stages: z
  .array(
    z.object({
      date: z.coerce.date(),
      stage: z.string(),
      note: z.string().optional(),
      links: z.array(linkSchema).default([]),
    }),
  )
  .default([]),

provisions: z
  .array(
    z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
    }),
  )
  .default([]),
```

All four fields are optional / default `[]`, so existing artifact records continue to validate unchanged.

No changes to the events or organizations schemas.

No changes to `data/organizations/house-of-commons-indu-committee.yaml` — it already exists and is correct.

## Design decisions

- **Option C (hybrid)**: bill as one artifact with embedded `stages`; only introduction and prorogation as events. Intermediate stages don't stand alone as linkable moments and would bloat the timeline.
- **Coarse `lifecycle_status` enum + free-text `current_stage`**: avoids proliferating machine-readable enums for every parliamentary procedure across federal/provincial, Commons/Senate, government/private-member bills. The `stages` array carries precise history.
- **Separate `provisions` field** rather than overloading `policy_recommendations`: provisions describe what the instrument does/would do; recommendations track adoption of someone else's suggestions. Different semantics, different schemas.
- **No `headline` flag on events (YAGNI)**: headline/detail is handled structurally — headline = event file, detail = `stages` entry on the artifact. Revisit if we ever need to surface intermediate stages on the main timeline.
- **Partial dates avoided**: all stage dates are exact (researched from INDU minutes and LEGISinfo), so no schema relaxation needed.
- **Tag minimalism**: implicit site-wide tags (`ai-regulation`, `artificial-intelligence`, `legislation`, `canadian`) are omitted. Kept tags that distinguish records from each other.
- **Introduction event does not list INDU as an organization**: strictly, INDU only became involved after second reading (2023-04-24). The artifact's `organizations` field carries the INDU connection.

## Follow-up (not in scope)

- GitHub issue for a dedicated rendering of an artifact's `stages` array on the bill page.
- If the bill is reintroduced in a future Parliament, add a new artifact for the successor bill and cross-reference it from this one.

## Sources

- [LEGISinfo — C-27 (44-1)](https://www.parl.ca/legisinfo/en/bill/44-1/c-27)
- [INDU — Bill C-27 study activity](https://www.ourcommons.ca/committees/en/INDU/StudyActivity?studyActivityId=12157763)
- [AIDA companion document (ISED)](https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act-aida-companion-document)
- [Gowling WLG — Bill C-27 timeline of developments](https://gowlingwlg.com/en/insights-resources/articles/2024/bill-c27-timeline-of-developments)
- [Montreal AI Ethics Institute — The Death of AIDA](https://montrealethics.ai/the-death-of-canadas-artificial-intelligence-and-data-act-what-happened-and-whats-next-for-ai-regulation-in-canada/)
- [Charter Statement (Justice Canada)](https://www.justice.gc.ca/eng/csj-sjc/pl/charter-charte/c27_1.html)

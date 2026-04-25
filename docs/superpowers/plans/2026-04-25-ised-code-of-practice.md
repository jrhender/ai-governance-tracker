# ISED Gen AI Code of Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the ISED Canadian Guardrails for Generative AI initiative to the tracker as two linked artifacts, two timeline events, and one new organization record (issue #2).

**Architecture:** Five new YAML data files, no schema changes. Two schema constraints to respect: (1) event `type` must be one of `CommitteeHearing | LegislativeAction | PoliticalEvent | Publication | Workshop` — use `Publication` for both events; (2) `derives_from` on artifacts references the `events` collection only, so artifact 2 links back to artifact 1 via `links[]` instead.

**Tech Stack:** YAML data files validated by Astro content collections (Zod schema in `src/content.config.ts`); `pnpm test` runs Vitest unit tests; `pnpm build` runs the full Astro build which validates all YAML against the schema.

**Spec:** `docs/superpowers/specs/2026-04-25-ised-gen-ai-code-of-practice-design.md`

---

### Task 1: Confirm the two TODO dates

Two signatory wave dates in the spec are approximate and need confirmation before writing the YAML.

**Files:**
- No files created; findings feed Tasks 3 and 4.

- [ ] **Step 1: Fetch the November 2024 announcement page**

  Fetch: `https://www.canada.ca/en/innovation-science-economic-development/news/2024/11/even-more-organizations-adopting-canadas-voluntary-code-of-conduct-on-artificial-intelligence-development.html`

  Extract: the exact publication date, which organizations signed, and the running total of signatories.

- [ ] **Step 2: Fetch the March 2025 announcement page**

  Fetch: `https://www.canada.ca/en/innovation-science-economic-development/news/2025/03/canada-moves-toward-safe-and-responsible-artificial-intelligence.html`

  Extract: the exact publication date, which organizations signed (CIBC, Clir, Cofomo, Intel, Jolera, PaymentEvolution), and the running total.

- [ ] **Step 3: Note confirmed dates**

  Record the two exact dates. They will replace the placeholder `2024-11-01` and `2025-03-01` values used in Tasks 3 and 4.

---

### Task 2: Create the ISED organization record

**Files:**
- Create: `data/organizations/ised-canada.yaml`

- [ ] **Step 1: Create the file**

  ```yaml
  # organizations/ised-canada.yaml

  id: ised-canada
  type: GovernmentOrganization
  schema_type: GovernmentOrganization

  name: "Innovation, Science and Economic Development Canada"
  short_name: "ISED"
  url: https://ised-isde.canada.ca
  wikipedia: https://en.wikipedia.org/wiki/Innovation,_Science_and_Economic_Development_Canada

  tags:
    - federal-government
    - canadian
  ```

- [ ] **Step 2: Run unit tests**

  ```bash
  pnpm test
  ```

  Expected: all tests pass (the org file is referenced by artifacts/events in later tasks; no test directly covers it yet).

- [ ] **Step 3: Commit**

  ```bash
  git add data/organizations/ised-canada.yaml
  git commit -m "Add ISED organization record"
  ```

---

### Task 3: Create Artifact 1 — Code of Practice

**Files:**
- Create: `data/artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml`

- [ ] **Step 1: Create the file**

  Use the confirmed dates from Task 1 where applicable (none affect this artifact). The `2026-03-20` modification date is noted as unknown in a YAML comment — do not add it as a stage.

  ```yaml
  # artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml

  id: ised-gen-ai-code-of-practice
  type: PolicyDocument
  schema_type: CreativeWork

  title: "Canadian Guardrails for Generative AI – Code of Practice"
  published_date: 2023-08-16

  organizations:
    - id: ised-canada
      role: publisher

  lifecycle_status: active
  current_stage: "Published; consultation closed September 2023"

  description: >
    The substantive principles framework underlying Canada's voluntary approach
    to generative AI governance. Defines six outcomes that developers and
    deployers of advanced generative AI systems should achieve: Safety,
    Fairness and Equity, Transparency, Human Oversight and Monitoring,
    Validity and Robustness, and Accountability. Developed as an interim
    measure ahead of binding regulation under AIDA; following AIDA's death
    on prorogation in January 2025, the code remains the primary federal
    framework for AI governance.

  stages:
    - date: 2023-08-16
      stage: "Code of Practice elements published for consultation"
    - date: 2023-09-14
      stage: "Consultation closes"
    - date: 2023-09-27
      stage: "Voluntary Code of Conduct launched based on this framework"
      note: "See artifact: ised-voluntary-code-of-conduct-gen-ai"
    # TODO: Page last modified 2026-03-20 — cause unknown; likely CMS update

  provisions:
    - id: safety
      title: "Safety"
      summary: >
        Identify and prevent malicious, harmful, and inappropriate uses.
        Includes red-teaming and risk assessment across the AI lifecycle.
    - id: fairness-equity
      title: "Fairness and Equity"
      summary: >
        Assess training datasets and mitigate biased outputs to prevent
        discriminatory impacts.
    - id: transparency
      title: "Transparency"
      summary: >
        Detect and label AI-generated content; explain development processes
        and system limitations to users.
    - id: human-oversight
      title: "Human Oversight and Monitoring"
      summary: >
        Maintain human supervision mechanisms and incident reporting
        throughout the AI system lifecycle.
    - id: validity-robustness
      title: "Validity and Robustness"
      summary: >
        Conduct rigorous testing and apply cybersecurity measures to ensure
        systems perform consistently as intended.
    - id: accountability
      title: "Accountability"
      summary: >
        Implement multi-layered governance, audits, and staff training to
        ensure legal and ethical obligations are met.

  links:
    - label: "ISED — Canadian Guardrails for Generative AI"
      url: https://ised-isde.canada.ca/site/ised/en/canadian-guardrails-generative-ai-code-practice
      icon: document
    - label: "ISED — Consultation page"
      url: https://ised-isde.canada.ca/site/ised/en/consultation-development-canadian-code-practice-generative-artificial-intelligence-systems
      icon: document

  tags:
    - ised
    - voluntary-code
    - generative-ai
    - federal-government
  ```

- [ ] **Step 2: Run unit tests**

  ```bash
  pnpm test
  ```

  Expected: all tests pass.

- [ ] **Step 3: Run build to validate schema**

  ```bash
  pnpm build
  ```

  Expected: build succeeds with no content collection errors. If you see a Zod error mentioning `ised-canada`, check that Task 2 was completed. If you see a date parse error, verify YAML date values are not quoted.

- [ ] **Step 4: Commit**

  ```bash
  git add data/artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml
  git commit -m "Add ISED Gen AI Code of Practice artifact"
  ```

---

### Task 4: Create Artifact 2 — Voluntary Code of Conduct

**Files:**
- Create: `data/artifacts/2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml`

**Schema note:** `derives_from` in `content.config.ts` only accepts references to the `events` collection — not other artifacts. The link back to artifact 1 is expressed via `links[]` instead.

- [ ] **Step 1: Substitute the confirmed dates from Task 1**

  Replace `<NOV_2024_DATE>` and `<MAR_2025_DATE>` in the YAML below with the exact dates found in Task 1 before writing the file.

- [ ] **Step 2: Create the file**

  ```yaml
  # artifacts/2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml

  id: ised-voluntary-code-of-conduct-gen-ai
  type: PolicyDocument
  schema_type: CreativeWork

  title: "Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems"
  published_date: 2023-09-27

  organizations:
    - id: ised-canada
      role: publisher

  lifecycle_status: active
  current_stage: "Active; 51 signatories as of mid-2025"

  description: >
    The commitment instrument that Canadian organizations voluntarily sign to
    adopt the six outcomes defined in the Canadian Guardrails for Generative AI
    Code of Practice. Launched September 27, 2023 by Minister François-Philippe
    Champagne as an interim measure while AIDA was before Parliament. Following
    AIDA's death on prorogation in January 2025, the code remains the primary
    federal mechanism for AI accountability. As of mid-2025, 51 organizations
    have signed, including CIBC, Cohere, IBM, CGI, Mila, Vector Institute,
    Mastercard, and Salesforce.

  stages:
    - date: 2023-09-27
      stage: "Voluntary Code of Conduct launched; initial signatories"
      links:
        - label: "Minister Champagne announcement"
          url: https://www.newswire.ca/news-releases/minister-champagne-launches-voluntary-code-of-conduct-relating-to-advanced-generative-ai-systems-825731533.html
          icon: document
    - date: 2023-12-07
      stage: "8 more organizations sign"
      note: "AltaML, BlueDot, CGI, IBM, kama.ai, Protexxa, Resemble AI, Scale AI"
      links:
        - label: "Announcement"
          url: https://www.canada.ca/en/innovation-science-economic-development/news/2023/12/more-organizations-sign-on-to-canadas-voluntary-ai-code-of-conduct-including-cgi-and-ibm.html
          icon: document
    - date: 2024-05-27
      stage: "8 more organizations sign (30 total)"
      note: "Alloprof, Kyndryl, Lenovo, Levio, MaRS Discovery District, Mastercard, OACIQ, Salesforce"
      links:
        - label: "Announcement"
          url: https://www.canada.ca/en/innovation-science-economic-development/news/2024/05/eight-organizations-to-join-canadas-voluntary-ai-code-of-conduct.html
          icon: document
    - date: <NOV_2024_DATE>
      stage: "10 more organizations sign (40 total)"
      links:
        - label: "Announcement"
          url: https://www.canada.ca/en/innovation-science-economic-development/news/2024/11/even-more-organizations-adopting-canadas-voluntary-code-of-conduct-on-artificial-intelligence-development.html
          icon: document
    - date: <MAR_2025_DATE>
      stage: "6 more organizations sign (46 total)"
      note: "CIBC, Clir, Cofomo, Intel, Jolera, PaymentEvolution"
      links:
        - label: "Announcement"
          url: https://www.canada.ca/en/innovation-science-economic-development/news/2025/03/canada-moves-toward-safe-and-responsible-artificial-intelligence.html
          icon: document

  links:
    - label: "ISED — Voluntary Code of Conduct"
      url: https://ised-isde.canada.ca/site/ised/en/voluntary-code-conduct-responsible-development-and-management-advanced-generative-ai-systems
      icon: document
    - label: "Based on: Canadian Guardrails for Generative AI – Code of Practice"
      url: https://ised-isde.canada.ca/site/ised/en/canadian-guardrails-generative-ai-code-practice
      icon: document

  tags:
    - ised
    - voluntary-code
    - generative-ai
    - federal-government
  ```

- [ ] **Step 3: Run unit tests**

  ```bash
  pnpm test
  ```

  Expected: all tests pass.

- [ ] **Step 4: Run build to validate schema**

  ```bash
  pnpm build
  ```

  Expected: build succeeds. If you see a date parse error on one of the signatory wave stages, double-check that the date substituted from Task 1 is in `YYYY-MM-DD` format and not quoted.

- [ ] **Step 5: Commit**

  ```bash
  git add data/artifacts/2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml
  git commit -m "Add ISED Voluntary Code of Conduct artifact"
  ```

---

### Task 5: Create Event 1 — Consultation Launch

**Files:**
- Create: `data/events/2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml`

**Schema note:** Event `type` is an enum: `CommitteeHearing | LegislativeAction | PoliticalEvent | Publication | Workshop`. Use `Publication` for this announcement event.

- [ ] **Step 1: Create the file**

  ```yaml
  # events/2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml

  id: ised-gen-ai-code-of-practice-consultation-2023
  type: Publication
  schema_type: Event

  title: "ISED launches consultation on Canadian Guardrails for Generative AI"
  date: 2023-08-16
  status: completed

  organizations:
    - id: ised-canada
      role: organizer

  related_artifacts:
    - id: ised-gen-ai-code-of-practice

  tags:
    - ised
    - voluntary-code
    - generative-ai
    - federal-government
  ```

- [ ] **Step 2: Run build to validate schema**

  ```bash
  pnpm build
  ```

  Expected: build succeeds. If you see a reference error on `ised-gen-ai-code-of-practice`, confirm that Task 3 was completed and the artifact file exists.

- [ ] **Step 3: Commit**

  ```bash
  git add data/events/2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml
  git commit -m "Add ISED Code of Practice consultation launch event"
  ```

---

### Task 6: Create Event 2 — Voluntary Code Launch

**Files:**
- Create: `data/events/2023-09-27-ised-voluntary-code-of-conduct-launched.yaml`

- [ ] **Step 1: Create the file**

  ```yaml
  # events/2023-09-27-ised-voluntary-code-of-conduct-launched.yaml

  id: ised-voluntary-code-of-conduct-launched-2023
  type: Publication
  schema_type: Event

  title: "Minister Champagne launches Voluntary Code of Conduct for Advanced Generative AI"
  date: 2023-09-27
  status: completed

  organizations:
    - id: ised-canada
      role: organizer

  related_artifacts:
    - id: ised-voluntary-code-of-conduct-gen-ai

  links:
    - label: "Minister Champagne announcement"
      url: https://www.newswire.ca/news-releases/minister-champagne-launches-voluntary-code-of-conduct-relating-to-advanced-generative-ai-systems-825731533.html
      icon: document

  tags:
    - ised
    - voluntary-code
    - generative-ai
    - federal-government
  ```

- [ ] **Step 2: Run unit tests and build**

  ```bash
  pnpm test && pnpm build
  ```

  Expected: all Vitest tests pass, build succeeds with no schema errors.

- [ ] **Step 3: Commit**

  ```bash
  git add data/events/2023-09-27-ised-voluntary-code-of-conduct-launched.yaml
  git commit -m "Add ISED Voluntary Code of Conduct launch event"
  ```

---

### Task 7: Final verification

- [ ] **Step 1: Run full test suite**

  ```bash
  pnpm test
  ```

  Expected: all tests pass.

- [ ] **Step 2: Run build**

  ```bash
  pnpm build
  ```

  Expected: build completes with no errors. The five new data files should all validate cleanly against their Zod schemas.

- [ ] **Step 3: Verify files exist**

  ```bash
  ls data/organizations/ised-canada.yaml \
     data/artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml \
     data/artifacts/2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml \
     data/events/2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml \
     data/events/2023-09-27-ised-voluntary-code-of-conduct-launched.yaml
  ```

  Expected: all five paths printed with no "No such file" errors.

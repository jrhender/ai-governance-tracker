# Design: ISED Gen AI Code of Practice (Issue #2)

## Overview

Add the ISED Canadian Guardrails for Generative AI initiative to the tracker as two linked artifacts, two timeline events, and one new organization record.

## Background

In summer 2023, ISED published a Code of Practice framework for generative AI and shortly after launched a Voluntary Code of Conduct that Canadian organizations can sign. These are modelled as two separate artifacts because they serve distinct purposes, live at different URLs, and have independent update cycles. The Code of Practice defines the principles; the Voluntary Code of Conduct is the commitment instrument organizations sign.

With AIDA dying on prorogation in January 2025, the voluntary code has become the primary federal mechanism for AI governance in Canada.

## Files to Create

```
data/organizations/
  ised-canada.yaml

data/artifacts/
  2023-08-16-ised-gen-ai-code-of-practice.yaml
  2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml

data/events/
  2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml
  2023-09-27-ised-voluntary-code-of-conduct-launched.yaml
```

No schema changes required.

## Organization: `ised-canada.yaml`

```yaml
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

## Artifact 1: Code of Practice

**File:** `data/artifacts/2023-08-16-ised-gen-ai-code-of-practice.yaml`

```yaml
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

## Artifact 2: Voluntary Code of Conduct

**File:** `data/artifacts/2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml`

```yaml
id: ised-voluntary-code-of-conduct-gen-ai
type: PolicyDocument
schema_type: CreativeWork
title: "Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems"
published_date: 2023-09-27

organizations:
  - id: ised-canada
    role: publisher

derives_from:
  - id: ised-gen-ai-code-of-practice
    relationship: derived_from

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
  - date: 2024-11-08
    stage: "10 more organizations sign (40 total)"
    links:
      - label: "Announcement"
        url: https://www.canada.ca/en/innovation-science-economic-development/news/2024/11/even-more-organizations-adopting-canadas-voluntary-code-of-conduct-on-artificial-intelligence-development.html
        icon: document
  - date: 2025-03-06
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

tags:
  - ised
  - voluntary-code
  - generative-ai
  - federal-government
```

## Event 1: Consultation Launch

**File:** `data/events/2023-08-16-ised-gen-ai-code-of-practice-consultation-launched.yaml`

```yaml
id: ised-gen-ai-code-of-practice-consultation-2023
type: Publication
schema_type: Event
status: completed
title: "ISED launches consultation on Canadian Guardrails for Generative AI"
date: 2023-08-16
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

## Event 2: Voluntary Code Launch

**File:** `data/events/2023-09-27-ised-voluntary-code-of-conduct-launched.yaml`

```yaml
id: ised-voluntary-code-of-conduct-launched-2023
type: Publication
schema_type: Event
status: completed
title: "Minister Champagne launches Voluntary Code of Conduct for Advanced Generative AI"
date: 2023-09-27
organizations:
  - id: ised-canada
    role: organizer
related_artifacts:
  - id: ised-voluntary-code-of-conduct-gen-ai
tags:
  - ised
  - voluntary-code
  - generative-ai
  - federal-government
```

## Open TODOs

- Determine what changed on the Code of Practice page on 2026-03-20
- Confirm initial signatory count at September 2023 launch

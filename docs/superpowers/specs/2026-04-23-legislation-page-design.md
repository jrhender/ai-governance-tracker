# Dedicated Legislation Page — Design Spec

**Issue:** [#21](https://github.com/jrhender/ai-governance-tracker/issues/21)
**Date:** 2026-04-23
**Status:** Draft

## Goal

Create a dedicated `/legislation/` page listing all legislation artifacts, remove artifacts from the main timeline, and add a navigation link. The two standalone bill events (introduction, prorogation) remain on the timeline.

## Out of Scope

- Rendering `stages[]` and `provisions[]` on the artifact detail page (issue #19)

## Changes

### 1. `/legislation/` Index Page

**Route:** `src/pages/legislation/index.astro`

Fetches all artifacts from the `artifacts` collection, filters to `type === "Legislation"`, and renders a card for each.

**Card contents:**
- Bill title (links to `/artifacts/{id}/`)
- Colour-coded `lifecycle_status` badge pill:
  - `active` → blue (`bg-blue-600`)
  - `enacted` → green (`bg-green-600`)
  - `died` → red (`bg-red-600`)
  - `withdrawn` → grey (`bg-slate-500`)
- `current_stage` text
- Introduction date (`published_date`)

**Layout:** Cards are full-width, stacked vertically — one per bill. Uses the same `max-w-4xl` container as the rest of the site via `BaseLayout`.

**Page title:** "Legislation"
**Page subtitle:** "Canadian AI-related bills and acts."

**Sorting:** By `published_date` descending (newest first).

**Empty state:** If no legislation artifacts exist, show a short message: "No legislation tracked yet."

### 2. Remove Artifacts from the Main Timeline

**File:** `src/pages/index.astro`

Remove the artifacts mapping from the `items` array. The timeline will only contain events.

Specifically:
- Remove the `getCollection("artifacts")` call
- Remove the `...artifacts.map(...)` spread from the `items` array
- The org filter continues to work — it just counts event orgs only

**CIGI report discoverability:** Create a new event file `data/events/2026-02-06-cigi-pco-report-published.yaml` of type `Publication` so the report remains discoverable on the timeline. It should reference the artifact via `related_artifacts: [{ id: cigi-pco-ai-national-security-report-2026 }]`.

### 3. Navigation Link

**File:** `src/layouts/BaseLayout.astro`

Add a "Legislation" link to the header nav, after "Timeline":

```
Timeline | Legislation
```

Use the same styling as the existing "Timeline" link. Add a small gap between links (e.g. `space-x-4`).

### 4. Timeline Type Cleanup

**File:** `src/lib/timeline.ts`

The `kind` field on `TimelineItem` currently allows `"event" | "artifact"`. Since artifacts are no longer on the timeline, remove `"artifact"` from the union so `kind` is just `"event"`. Keep the field itself — it's low-cost and could be useful if other item types are added later. The `filterByOrg` function is unchanged.

## Data

### New Event: CIGI Report Published

```yaml
# data/events/2026-02-06-cigi-pco-report-published.yaml

id: cigi-pco-report-published-2026
type: Publication
schema_type: Event
title: "CIGI publishes AI and National Security Scenarios Workshop Summary Report"
date: 2026-02-06

organizations:
  - id: cigi-global-ai-risks-initiative
    role: publisher

description: >
  The Global AI Risks Initiative at CIGI publishes the summary report
  from the AI National Security Scenarios Workshop co-hosted with the
  Privy Council Office of Canada.

related_artifacts:
  - id: cigi-pco-ai-national-security-report-2026

tags:
  - national-security
  - policy-recommendations
  - federal-government
  - cigi
  - privy-council-office

links:
  - label: "Publication Page"
    url: https://www.cigionline.org/publications/ai-national-security-scenarios/
    icon: document
```

## Testing

- **Unit test:** Verify the legislation page filters artifacts correctly (only `type === "Legislation"` included)
- **Unit test:** Verify the badge colour mapping returns the correct class for each `lifecycle_status`
- **E2E test:** `/legislation/` page loads, shows Bill C-27 card with "Died" badge, links to detail page
- **E2E test:** Main timeline does not contain any artifact entries
- **E2E test:** Header nav contains "Legislation" link that navigates to `/legislation/`
- **Manual:** Verify the new CIGI "report published" event appears on the timeline

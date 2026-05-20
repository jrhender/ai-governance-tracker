# Source Category Filter — Design Spec

**Issue:** [#60 Separate government action from civil society output](https://github.com/jrhender/ai-governance-tracker/issues/60)  
**Branch:** `feature/source-category-filter`  
**Date:** 2026-05-20

## Problem

The Policy page mixes government-authored content (legislation, policy documents, government programs) with civil society output (whitepapers, think-tank reports) using identical visual styling. This gives civil society publications the same apparent authority as official government action, which is misleading.

The Timeline page has the same issue — government events and civil society publications look identical in the spine.

## Goal

Add a **source category filter** (Government / Civil Society) to both pages, backed by distinct visual treatment, so readers can instantly understand the provenance of each item.

## Categorisation Logic

Source category is **derived at build time** from the linked organization's `schema_type` — no new YAML fields needed.

| `schema_type` on any linked org | Source category |
|---|---|
| `GovernmentOrganization` | `government` |
| `Organization` | `civil_society` |

**Rule:** if an artifact or event has at least one `GovernmentOrganization` in its `organizations` array, it is classified as `government`. Otherwise `civil_society` — including the edge case of an artifact with no linked organizations at all.

This logic is encapsulated in a single `getSourceCategory(orgSchemaTypes: string[]): "government" | "civil_society"` helper in `src/lib/sourceCategory.ts`.

## Design Tokens

Two new semantic colours added to the CSS theme (no new Tailwind classes needed — inline styles or CSS variables):

| | CSS variable | Value |
|---|---|---|
| Gov border | `--color-gov-border` | `#2d5060` |
| Gov card bg | `--color-gov-bg` | `#f2f6f8` |
| Gov badge bg | `--color-gov-badge-bg` | `#dce8ed` |
| Gov badge text | `--color-gov-badge-text` | `#1a3a4a` |
| Gov badge border | `--color-gov-badge-border` | `#b0c8d4` |
| Civil border | `--color-civil-border` | `#4a6070` |
| Civil card bg | `--color-civil-bg` | `#f0f4f7` |
| Civil badge bg | `--color-civil-badge-bg` | `#e8f0f4` |
| Civil badge text | `--color-civil-badge-text` | `#2d4a5a` |
| Civil badge border | `--color-civil-badge-border` | `#b0ccd8` |

Both colours are in the same cool blue-grey family as the existing palette (`--color-muted: #4a5f6e`, `--color-border-lt: #e8f0f4`). Government is the darker shade; civil society the lighter, ensuring clear hierarchy without value-laden colour choices (no green).

## Visual Treatment

### Badge

A small pill badge appears top-right on every Policy card and inline with the chip row on every Timeline entry:

- Government: text `GOVERNMENT`, bg `--color-gov-badge-bg`, text `--color-gov-badge-text`, border `--color-gov-badge-border`
- Civil society: text `CIVIL SOCIETY`, bg `--color-civil-badge-bg`, text `--color-civil-badge-text`, border `--color-civil-badge-border`

### Policy page cards

- Left border colour: `--color-gov-border` or `--color-civil-border` (replaces the current uniform `border-l-accent`)
- Card background: `--color-gov-bg` or `--color-civil-bg` (replaces the current uniform `bg-surface`)

### Timeline entries

- Spine dot colour: `--color-gov-border` or `--color-civil-border` (replaces the current uniform `bg-accent`)
- No change to card background (timeline items don't have a card container — the dot carries the signal)
- Badge sits inline after the type chip and org chips

## Filter UI

### Policy page

A single filter bar above the existing type sections:

```
[ All ]  [ Government ]  [ Civil Society ]
```

- Active pill: `bg-header text-white border-header` — matches the existing `OrgFilter` pattern exactly
- Inactive pill: `bg-body text-muted border-border` with hover — matches `OrgFilter` exactly
- Filtering hides/shows entire type sections (Legislation, Reports, etc.) based on whether all items in that section match the active filter. If a section has a mix, items within it are shown/hidden individually and the section heading remains visible only when it has visible children.
- Default: All

This filter is implemented as a React island (`PolicyWithSourceFilter`) following the same `client:load` pattern as `OrgsWithCountryFilter`.

### Timeline page

Two stacked filter rows, rendered inside a labelled container above the existing timeline list:

```
Source
[ All ]  [ Government ]  [ Civil Society ]

Organization
[ All ]  [ ISED ]  [ AIGS ]  [ PCO ]  ...
```

- Both filters are independent and additive (Government + ISED = events that are both government-sourced and involve ISED)
- The existing `OrgFilter` component is reused unchanged for the Organization row
- A new `SourceFilter` component handles the Source row
- `TimelineWithFilter` is updated to manage both filter states and pass `sourceCategory` on each `TimelineItem`

## Data Flow

### Policy page

```
Astro build:
  getCollection("artifacts")
  getCollection("organizations")
  → for each artifact, resolve org schema_types → derive sourceCategory
  → pass ArtifactEntry[] (includes sourceCategory) to PolicyWithSourceFilter
  
PolicyWithSourceFilter (React island):
  state: selectedSource ("all" | "government" | "civil_society")
  → filters ArtifactEntry[] by sourceCategory
  → renders sections with colour-coded cards
```

### Timeline page

```
Astro build:
  getCollection("events")
  getCollection("organizations")
  → for each event, resolve org schema_types → derive sourceCategory
  → TimelineItem gains sourceCategory field
  → passed to TimelineWithFilter

TimelineWithFilter (React island):
  state: selectedSource + selectedOrgId (existing)
  → filters by both dimensions
  → passes filtered items to TimelineList
  → TimelineList renders coloured dot + badge per item
```

## Components

| File | Change |
|---|---|
| `src/lib/sourceCategory.ts` | New — `getSourceCategory()` helper + type |
| `src/styles/global.css` | Add CSS variables for gov/civil colours |
| `src/lib/timeline.ts` | Add `sourceCategory` field to `TimelineItem` |
| `src/components/SourceFilter.tsx` | New — source pill filter (reusable across both pages) |
| `src/components/PolicyWithSourceFilter.tsx` | New — replaces static policy sections with filterable React island |
| `src/components/TimelineWithFilter.tsx` | Update — add source filter state + SourceFilter row |
| `src/components/TimelineList.tsx` | Update — coloured dot + source badge per item |
| `src/pages/policy/index.astro` | Update — resolve sourceCategory, pass to PolicyWithSourceFilter |
| `src/pages/timeline/index.astro` | Update — resolve sourceCategory per event, add to TimelineItem |

## Out of Scope

- No changes to YAML data files
- No new `schema_type` values on organizations
- No changes to the Organizations page (already has country filter)
- No changes to artifact or event detail pages

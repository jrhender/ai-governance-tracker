# Design: Country Filter for Organizations Page

**Issue:** [#71](https://github.com/jrhender/ai-governance-tracker/issues/71)
**Date:** 2026-05-19
**Status:** Approved

## Problem

The organizations page lists all orgs regardless of country. DSIT is a UK body while all other current orgs are Canadian. Users need a way to filter by country, defaulting to Canadian orgs, with the filter auto-adapting as new countries are added.

## Design

### 1. Data Model

Add a required `country` enum field to the organizations schema in `content.config.ts`:

```ts
country: z.enum(["ca", "uk"])
```

- **Required** (not optional) — enforces data completeness; build fails if an org omits the field
- **Enum** — controlled vocabulary; adding a new country requires an intentional one-line schema change
- **ISO 2-letter codes, lowercase** — `"ca"` for Canada, `"uk"` for United Kingdom

Update all 6 existing org YAML files:
- `aigs-canada.yaml` → `country: ca`
- `cigi-global-ai-risks-initiative.yaml` → `country: ca`
- `house-of-commons-indu-committee.yaml` → `country: ca`
- `ised-canada.yaml` → `country: ca`
- `privy-council-office-canada.yaml` → `country: ca`
- `dsit-uk.yaml` → `country: uk`

### 2. Component: `OrgsWithCountryFilter.tsx`

A React island that replaces the static grid in `orgs/index.astro`.

**Props:**
```ts
type OrgEntry = {
  id: string;
  name: string;
  short_name?: string;
  country: "ca" | "uk";
  tags: string[];
  url?: string;
  events: number;
  artifacts: number;
};

type Props = {
  orgs: OrgEntry[];
};
```

**Behaviour:**
- `selected` state defaults to `"ca"` (Canada shown on first load)
- Available country pills are **derived from the data** — `[...new Set(orgs.map(o => o.country))].sort()` — so adding a new country to any org automatically adds a new pill with no component changes
- "All" pill sets `selected` to `null`; country pills set `selected` to the ISO code
- Filtered orgs: `selected === null ? orgs : orgs.filter(o => o.country === selected)`

**Country label map** (inline in component):
```ts
const COUNTRY_LABELS: Record<string, string> = { ca: "Canada", uk: "UK" };
```

**Filter pills** follow the same visual pattern as the existing `OrgFilter` component (rounded pills, active/inactive states, `aria-pressed`).

**Country badge on each card:** a small muted text label (e.g. "Canada" or "UK") rendered below the org name/short name — visible at a glance even without filtering active.

### 3. Updated `orgs/index.astro`

- Pre-compute `eventCounts` and `artifactCounts` as before
- Serialize orgs into an array of `OrgEntry` objects
- Replace the static `<div class="grid ...">` with `<OrgsWithCountryFilter client:load orgs={serializedOrgs} />`

### 4. Tests

New `OrgsWithCountryFilter.test.tsx` covering:
- Defaults to Canada filter on mount (only `ca` orgs visible)
- Clicking "All" shows all orgs
- Clicking a country pill filters to that country
- Country pills are derived from data (if a `"us"` org is added to props, a "US" pill appears)

## Out of Scope

- Multi-select country filtering (deferred — can revisit if more countries are added)
- Flag emoji on country badges (keep it text-only for simplicity)
- Country filter on the timeline or artifacts pages

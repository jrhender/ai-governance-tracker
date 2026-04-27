# Nav & Policy Page — Design Spec

**Issue:** #36  
**Date:** 2026-04-26

## Summary

Add a `/policy/` listing page covering all non-event artifacts (Legislation, Reports, Policy Documents, Government Programs), add it to the top nav as "Policy", remove the now-redundant "Home" and "Legislation" nav links, and make the nav mobile-responsive via flex-wrap.

## Nav Changes

### Items

Current nav: Home · Timeline · Legislation · Organizations  
New nav: Timeline · Organizations · Policy

- Remove "Home" — the site title (`<a href="/">AI Governance Tracker</a>`) already serves as a home link, consistent with modern convention.
- Remove "Legislation" — content moves to the new Policy page. The `/legislation/` URL is dropped (site is new, no inbound links to preserve).
- Add "Policy" linking to `/policy/`.

### Mobile responsiveness

The header `<nav>` currently uses `flex gap-4` with no mobile handling, which overflows on narrow screens.

Fix: add `flex-wrap: wrap` so links reflow to a second row on small screens. No JavaScript, no hamburger menu. The header becomes two rows on mobile:

```
Row 1: AI Governance Tracker
Row 2: Timeline · Organizations · Policy
```

Implementation: two changes in `BaseLayout.astro`:
1. Add `flex-wrap gap-y-2` to the header container `<div>` (currently `flex max-w-4xl items-center justify-between`) so the nav can wrap below the title on very narrow screens.
2. The `<nav>` itself needs no additional changes — with only 3 links, it fits on one row once it has the full width.

## Policy Page (`/policy/`)

### URL

`/policy/` — replaces `/legislation/`.

### Structure

Four sections rendered in this order, each with a heading, a short explanatory paragraph, and a list of artifact cards:

1. **Legislation** — Bills and acts
2. **Reports** — Research and analytical reports
3. **Policy Documents** — Codes of conduct, frameworks, guidelines
4. **Government Programs** — National strategies and ongoing federal initiatives

Each section only renders if it has at least one item. Empty sections are hidden entirely.

### Section copy

**Legislation**
> Canadian federal bills and acts related to artificial intelligence. Each entry tracks the bill's lifecycle — from introduction through readings, committee study, and royal assent (or death on the order paper).

**Reports**
> Research reports and analytical summaries published by think tanks, government agencies, and advisory bodies. These documents examine AI risks, policy options, and strategic considerations for Canada.

**Policy Documents**
> Voluntary codes of conduct, frameworks, and guidelines issued by government or industry bodies. These set expectations for responsible AI development and deployment without carrying the force of law.

**Government Programs**
> Ongoing federal programs and national strategies related to artificial intelligence. These represent long-term government commitments and investments rather than one-off publications.

### Card design

All cards follow the existing bordered card pattern from `/legislation/` and `/orgs/`: `block rounded-lg border p-5 transition-colors hover:border-slate-300`.

**Legislation cards** (type = `"Legislation"`): show title, published date, and — if present — a lifecycle status badge (reusing `badgeClass` / `statusLabel` from `src/lib/legislation.ts`) and current stage text.

**All other cards** (Report, PolicyDocument, GovernmentProgram): show title, published date, and description (if present). No status badge.

### Data

No data model changes. The page filters `getCollection("artifacts")` by `type` field:

```ts
const legislation    = artifacts.filter(a => a.data.type === "Legislation");
const reports        = artifacts.filter(a => a.data.type === "Report");
const policyDocs     = artifacts.filter(a => a.data.type === "PolicyDocument");
const govPrograms    = artifacts.filter(a => a.data.type === "GovernmentProgram");
```

Within each section, sort by `published_date` descending (newest first).

### Page meta

- Title: "Policy"
- Description: "Canadian AI legislation, reports, policy documents, and government programs."

## Files Affected

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | Remove "Home" and "Legislation" links; add "Policy" link; add `flex-wrap` to nav |
| `src/pages/policy/index.astro` | New file — the Policy listing page |
| `src/pages/legislation/index.astro` | Delete (replaced by Policy page) |

## Out of Scope

- Individual artifact pages (`/artifacts/[id]/`) — unchanged
- Data files — no changes
- Redirect from `/legislation/` to `/policy/` — not needed (site is new)

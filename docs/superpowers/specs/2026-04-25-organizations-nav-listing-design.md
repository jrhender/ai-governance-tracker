# Design: Organizations Nav Link + Listing Page

**Issue:** [#23](https://github.com/jrhender/ai-governance-tracker/issues/23)
**Date:** 2026-04-25

## Summary

Add an Organizations link to the site header nav and create the `/orgs/` listing page it points to. Also update the back-link on individual org detail pages.

## Files Changed

### 1. `src/layouts/BaseLayout.astro`

Add a fourth nav link after Legislation:

```html
<a href="/orgs/" class="hover:text-slate-900 dark:hover:text-slate-100">
  Organizations
</a>
```

### 2. `src/pages/orgs/index.astro` (new)

A listing page for all organizations in the `organizations` collection.

**Page metadata:**
- Title: "Organizations"
- Description: "Think tanks, government bodies, and advocacy groups tracked in this database."

**Layout:** Two-column responsive grid (`grid-cols-1 sm:grid-cols-2`), one card per org.

**Card design (Option B — accent grid cards):**
- Left border accent color derived from `schema_type`:
  - `Organization` → blue (`border-blue-500`)
  - `GovernmentOrganization` → green (`border-emerald-500`)
- `short_name` displayed prominently (bold, larger text) with full `name` below in secondary text
- Event and artifact counts fetched by filtering those collections on `org.id` (same pattern as `[id].astro`)
- Tag chips rendered inline
- Entire card is an `<a>` linking to `/orgs/[id]/`

**Empty state:** "No organizations tracked yet." paragraph when collection is empty.

**Data fetching:** Uses `getCollection` for `organizations`, `events`, and `artifacts` at build time. Counts derived by filtering `events` and `artifacts` by org reference.

### 3. `src/pages/orgs/[id].astro`

Change the back-link from:
```html
<a href="/timeline/" class="hover:underline">← Timeline</a>
```
to:
```html
<a href="/orgs/" class="hover:underline">← Organizations</a>
```

## What Is Not In Scope

- Sorting or filtering the org list (only 3 orgs; add when warranted)
- Adding a `type` or `category` field to org data (accent color derived from existing `schema_type`)
- Any changes to the org detail page beyond the back-link

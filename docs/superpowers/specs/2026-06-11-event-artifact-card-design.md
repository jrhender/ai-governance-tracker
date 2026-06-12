# Featured artifact card on event pages

**Date:** 2026-06-11
**Issue:** [#83 — Make the artifact more obvious from event](https://github.com/jrhender/ai-governance-tracker/issues/83)

## Problem

On event pages, the associated artifact (report, policy document, etc.) is rendered
as a plain "Related artifacts" link list — the third section down the page, after
Organizations and Links. Visitors have to scroll to discover that an event produced
an artifact at all. For publication-type events the artifact is usually the main
payload of the page, so it should be prominent near the top.

## Design

All page changes are in `src/pages/events/[id].astro`.

### Featured artifact card

- Rendered directly **after the event description** and **before the Organizations
  section**. One card per entry in `related_artifacts`, stacked vertically with a
  small gap when there are several.
- The existing "Related artifacts" list section at the bottom of the page is
  **removed** — the card replaces it.
- Events with no related artifacts render exactly as today (no card, no empty
  section).

### Card appearance ("gold trim" treatment)

White surface card lifted off the grey page background:

- Background `--color-surface` (white), 1px border `--color-border`, rounded
  corners, subtle shadow (`0 2px 8px rgba(15,42,56,0.08)`).
- 4px **antique-gold left border** — the warm accent against the site's teal/grey
  palette.
- Contents, top to bottom:
  1. Uppercase letter-spaced type label in dark gold (artifact `type`, humanized:
     `PolicyDocument` → "Policy Document").
  2. Artifact title, bold, `--color-ink`.
  3. Artifact description, `--color-muted`, clamped to 3 lines (`line-clamp-3`).
     Omitted when the artifact has no description.
  4. "Read the artifact →" link line, dark gold, semibold.
- The **whole card is a single `<a>`** to `/artifacts/{id}/` — large tap target;
  the arrow line makes the affordance explicit. Hover state: underline on the
  title.

### Colour tokens

Add to the `@theme` block in `src/styles/global.css` so the gold is reusable:

```css
--color-gold:      #b08d2e;  /* left border */
--color-gold-dark: #7a5f1a;  /* type label + link text (4.5:1+ on white) */
```

### Type label helper

Add `humanizeType(type: string): string` to `src/lib/format.ts` — splits
CamelCase enum values into spaced words ("WhitePaper" → "White Paper"). Used for
the card's type label.

## Testing

- **Unit:** `humanizeType` cases — single word ("Report"), multi-word
  ("PolicyDocument", "WhitePaper"), already-spaced input passthrough.
- **E2E (Playwright):** on an event page with a related artifact (e.g.
  `cigi-pco-report-published-2026`):
  - the artifact card appears before the Organizations section in DOM order;
  - the card links to the corresponding `/artifacts/{id}/` page;
  - an event without related artifacts shows no card.

## Out of scope

- Artifact pages (no changes to `/artifacts/[id].astro`).
- Timeline/list views.
- Surfacing artifact metadata beyond type/title/description (stages,
  recommendations, etc.).

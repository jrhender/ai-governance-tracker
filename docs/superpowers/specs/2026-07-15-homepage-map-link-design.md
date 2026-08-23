# Homepage link to the Map section — design

## Problem

The risk → mitigation → implementation map (`/map/`, added in #120) is reachable
only from the nav bar. The homepage — the main entry point — doesn't mention it,
while Organizations and Policy each get a card.

## Design

Two small edits to `src/pages/index.astro`, no new components or data changes:

1. **Intro mention.** Extend the opening paragraph with one sentence linking to
   the map:

   > …provide their own input into the ecosystem. The
   > [risk map](/map/) shows which AI risks have been identified, which
   > mitigations have been proposed, and whether Canada has implemented them.

   The link uses `text-accent-dark underline` — the site's usual
   `hover:underline` variant fails axe's `link-in-text-block` rule here,
   because a link sitting inside a paragraph of body text must be
   distinguishable from that text without relying on colour. Accent-dark
   against `text-muted` is only 1.09:1, well under the required 3:1, so the
   underline has to be present in the default state, not just on hover.

2. **Map card.** Add a third card to the existing card grid, using the exact
   same markup pattern as the Organizations and Policy cards:

   - Title: **Map** (matches the nav label)
   - Description: "How AI risks map to proposed mitigations and their
     implementation status."
   - Href: `/map/`

3. **Timeline card.** A third card alone would wrap to a second row and sit
   beside an empty half, which reads as an accident rather than a choice. A
   fourth card fills the `sm:grid-cols-2` grid evenly and makes the set mirror
   the four nav destinations:

   - Title: **Timeline** (matches the nav label)
   - Description: "The full record of hearings, reports, and announcements."
   - Href: `/timeline/`

   Three columns were the alternative, but the homepage content sits in a
   `max-w-2xl` (672px) reading-width wrapper, so three cards would be ~213px
   wide — around 173px of text once padding is subtracted — leaving the
   descriptions to wrap into two-to-four ragged lines. Two columns keep each
   card near 328px.

   Timeline is also linked by the "View full timeline →" button above the grid.
   That duplication is deliberate: the button continues the Latest activity
   list, while the card belongs to the set of site sections.

   The grid becomes `<nav aria-label="Explore">` so the four links form a named
   landmark, matching how the Latest activity list is labelled.

## Out of scope

- Live metrics / stat tiles on the homepage (considered, not chosen).
- Any change to the `/map/` page itself or the nav.

## Testing

- `pnpm test` and `pnpm build` locally (no Playwright in this sandbox).
- CI `Test / e2e` on the PR catches any homepage e2e assertions affected by
  the new text.

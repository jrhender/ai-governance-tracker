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

   The grid stays `sm:grid-cols-2`; the third card wraps to a second row.

## Out of scope

- Live metrics / stat tiles on the homepage (considered, not chosen).
- Any change to the `/map/` page itself or the nav.

## Testing

- `pnpm test` and `pnpm build` locally (no Playwright in this sandbox).
- CI `Test / e2e` on the PR catches any homepage e2e assertions affected by
  the new text.

# Site Redesign — Design Spec

**Issue:** #42  
**Date:** 2026-04-27  
**Status:** Approved

## Goal

Replace the current monochromatic slate/grey design with a polished, internationally credible aesthetic. The redesign targets credibility, engagement, and clarity — with no national colour associations. Light mode only (dark mode support removed).

## Design Decisions

### Aesthetic Direction
"Deep Teal" — an internationally neutral policy/think-tank register (Oxford Internet Institute, Brookings). Serious and editorial without feeling like a government department or any particular country.

### Colour Palette (CSS custom properties)

| Token             | Value     | Usage                                      |
|-------------------|-----------|--------------------------------------------|
| `--col-header`    | `#0f3040` | Site header and footer background          |
| `--col-accent`    | `#4ecdc4` | Timeline spine, dots, active states        |
| `--color-accent-dark` | `#2aada4` | Hover states, source link text             |
| `--col-body`      | `#f7f8f8` | Page background                            |
| `--col-surface`   | `#ffffff` | Cards, filter bar                          |
| `--col-border`    | `#d0dce0` | Borders on cards and inputs                |
| `--col-border-lt` | `#e8f0f4` | Lighter dividers                           |
| `--col-text`      | `#0f2a38` | Body text                                  |
| `--col-muted`     | `#5a7a88` | Secondary text, descriptions               |
| `--col-faint`     | `#8aa0aa` | Timestamps, section labels                 |

All tokens defined in `src/styles/global.css`.

### Typography

| Role              | Font               | Usage                                      |
|-------------------|--------------------|--------------------------------------------|
| Display / logo    | DM Serif Display   | Site logo, page headings (h1)              |
| Serif body        | Source Serif 4     | Timeline event titles                      |
| UI / body         | DM Sans            | Nav, descriptions, tags, all UI text       |

Loaded via Google Fonts in `BaseLayout.astro`.

### Dark Mode
Removed entirely. The `dark:` variant classes are stripped from all components. The inline `<script>` that reads `localStorage("theme")` and the `@variant dark` in `global.css` are removed.

---

## Components

### `BaseLayout.astro`

**Header:**
- Background `--col-header` (petrol blue), full width
- Logo: `<span class="logo-mark">AI</span>` teal rounded-square mark + "AI Governance Tracker" in DM Serif Display
- Nav links: muted teal (`#8ab8c8`), hover white, active state = white text + 3px teal bottom border
- No dark mode toggle

**Footer:**
- Background `--col-header`
- Centred text, muted teal colour

**Body:**
- `background: var(--col-body)` — replaces `bg-white`
- `color: var(--col-text)`
- No `dark:` variants anywhere

### `src/pages/index.astro` (Homepage)

- **Eyebrow:** small caps, `--color-accent-dark`, text "AI Policy · Governance · Safety"
- **H1:** DM Serif Display, 42px, `--col-header`
- **Body copy:** DM Sans, `--col-muted`
- **CTA buttons:** primary = petrol blue fill; secondary = ghost with `--col-border`
- **Feature cards:** white surface, `--col-border` border, 4px left border in `--col-accent`, rounded right corners only. On hover: darker accent left border + subtle shadow.

### `TimelineList.tsx`

**Spine:** `border-left: 2px solid var(--col-accent)` (teal line, not slate)

**Timeline dot:** `--col-accent` filled circle, white border ring, `--col-body` outer ring — replaces grey dot

**Each event item:**
1. **Date:** `--col-faint`, 11px, DM Sans
2. **Title:** Source Serif 4, 16px, `--col-header`, links to detail page
3. **Chips row:**
   - Type badge: `chip-type` — teal-tinted background, dark teal text
   - Org chips: `chip-org` — white surface, blue-teal border, link to `/orgs/<id>/`
4. **Description:** DM Sans 13px, `--col-muted`
5. **Source links:** rendered from `event.links[]`. Each link = small SVG icon + label text in `--color-accent-dark`. Icon is chosen by `link.icon` field: `document` → document SVG, `video` → play-circle SVG, anything else → external-link SVG.

**Data plumbing:** `TimelineItem` type gains a `links` field (`{label: string; url: string; icon?: string}[]`). The Astro page passes `e.data.links` through. Events with no links render no source-link row.

### `OrgFilter.tsx` / `TimelineWithFilter.tsx`

Filter chips restyled: `--col-body` background, `--col-border` border. Active chip: `--col-header` background, white text. No functional changes.

### `src/pages/timeline/index.astro`

No logic changes. Style updates inherited from `TimelineList` and `BaseLayout`.

### `src/pages/policy/index.astro`

- Section headings: DM Serif Display
- Artifact cards: white surface, `--col-border` border, 4px teal left border (matching homepage feature cards)
- Lifecycle status badges: keep existing colour logic, adjust to match new palette (remove dark: variants)

### `src/pages/orgs/index.astro` and `[id].astro`

- Org list: consistent card treatment with the rest of the site
- Org detail: links ("Website", "Wikipedia") use `--color-accent-dark` with underline on hover

### Event and artifact detail pages (`src/pages/events/[id].astro`, `src/pages/artifacts/[id].astro`)

- Consistent header/footer from BaseLayout
- Remove all `dark:` variants
- Section headings use DM Serif Display

---

## Favicon

An SVG favicon: the letters "AI" in a system serif (`Georgia, serif` — Google Fonts are unavailable inside SVG favicons without embedding), teal (`#4ecdc4`) on petrol blue (`#0f3040`) background, with a `rx="22%"` rounded rectangle. Delivered as `public/favicon.svg` referenced in `BaseLayout.astro` via `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

No `favicon.ico` is needed — all modern browsers support SVG favicons. The `public/` directory is created as part of this work.

---

## Scope

All pages and components in one PR:

1. `src/styles/global.css` — add CSS tokens, remove dark variant, import Google Fonts
2. `src/layouts/BaseLayout.astro` — new header/footer, remove dark mode script, add favicon link
3. `src/components/TimelineList.tsx` — new timeline styles, org chips, source links
4. `src/components/OrgFilter.tsx` — restyled filter chips
5. `src/pages/index.astro` — hero, feature cards
6. `src/pages/timeline/index.astro` — minor style cleanup
7. `src/pages/policy/index.astro` — card and heading styles
8. `src/pages/orgs/index.astro` and `[id].astro` — palette update
9. `src/pages/events/[id].astro` and `src/pages/artifacts/[id].astro` — dark mode removal, palette
10. `public/favicon.svg` — new SVG favicon (no .ico needed)

## Out of Scope

- Data entry for new Hansard/video links on existing events (separate issue)
- Dark mode toggle UI (removed, not deferred)
- Any new pages or data model changes

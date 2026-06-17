# Homepage tightening — design

**Date:** 2026-06-17
**Status:** Approved
**Branch:** `feature/homepage-latest-activity` (stacks on PR #93)

## Problem

The homepage just gained a "Latest activity" preview (PR #93), but the page now
links to the timeline in **four** places: the global nav (every page), a hero
"Browse the Timeline" button, the "View full timeline" link on the Latest
activity section, and a "Timeline" card in the bottom 2-card grid. That's
redundant. Separately, the hero opens with two dense paragraphs — the second
(risk scope + neutrality) buries the lede and makes the top of the page slow to
read.

Goal: a snappier front page with the timeline links tightened from 4 to 2.

## Design

Implements layout option **B** (lean hero, section link) with the Contribute CTA
moved to the global footer.

### 1. Hero — `src/pages/index.astro`
- Keep the `<h1>` and **paragraph 1** (mission sentence).
- Remove **paragraph 2** from the hero (moves to a new About section, §4).
- Remove the hero button row entirely — both "Browse the Timeline →" and
  "Contribute via GitHub". The hero becomes headline + one paragraph.

### 2. Latest activity — `src/pages/index.astro`
- Reduce the preview from **5 items to 3**: `buildTimelineItems(...).slice(0, 3)`.
- Keep the "View full timeline →" link in the section header. This is the single
  on-page timeline entry point.

### 3. Explore cards — `src/pages/index.astro`
- The 2-card grid keeps **Policy** and replaces the **Timeline** card with an
  **Organizations** card linking to `/orgs/`.
  - Organizations card: heading "Organizations", description
    "Government bodies, think tanks, and advocacy groups." (matches the
    Policy card's one-line tone).
- Rationale: `/orgs/` is a real page with no homepage entry point today; the
  Timeline card was redundant with the nav link and the activity section.

### 4. About this project — `src/pages/index.astro`
- New section at the bottom of the page, heading "About this project".
- Contains **paragraph 2** (the risk-scope + neutrality text moved out of the hero).
- Placed after the explore cards.

### 5. Footer — `src/layouts/BaseLayout.astro`
- Add a **"Contribute on GitHub"** link to the footer meta line, alongside the
  existing "Cloudflare Web Analytics" and "RSS" links.
- Link target: `https://github.com/jrhender/ai-governance-tracker/issues/new`
  — keeps the old button's destination, so "contribute" still means "file an
  issue / suggest an edit". Opens in a new tab (`target="_blank"`,
  `rel="noopener noreferrer"`), styled to match the adjacent footer links
  (the underlined `#8ab8c8` link style).
- Because the footer is global, this surfaces "contribute" on every page.

### 6. Housekeeping — `.gitignore`
- Add `.pnpm-store/`, `.claude/`, and `.superpowers/` (brainstorm artifacts) to
  `.gitignore`. These are currently untracked noise.

## Net effect

- Timeline links: **4 → 2** (global nav + Latest activity section link).
- Hero: 2 paragraphs + 2 buttons → 1 paragraph, no buttons.
- Latest activity: 5 → 3 items.
- New homepage entry point to Organizations; new global Contribute link.

## Out of scope

- The other homepage ideas in `docs/homepage-ideas.md` (#2 stat strip,
  #3 policy scoreboard, #4 sparkline, #5 tag chips). Tracked separately.
- A standalone `/about` page — the 2nd paragraph lives in a homepage section,
  not a new route.

## Testing

- Existing unit tests (`buildTimelineItems`, filters) remain green; `slice(0, 3)`
  needs no new logic.
- `pnpm build` succeeds; built `dist/index.html` contains exactly 3 activity
  items, the About section, no hero buttons, and the bottom cards link to
  `/policy/` and `/orgs/`.

### e2e changes (`e2e/homepage.spec.ts`)

The current file has three tests that touch what we're changing — they must be
updated, not left to "stay green":

1. **"primary CTA links to /timeline/"** — asserts a "Browse the Timeline" hero
   link. That link is removed. **Replace** with a test that the Latest activity
   "View full timeline →" link has `href="/timeline/"`.
2. **"contribute link points to GitHub new issue page"** — still valid: the
   footer link keeps the `/issues/new` href and a name matching `/Contribute/i`.
   Optionally strengthen it to also assert the link appears on a non-home page
   (it's now global via the footer).
3. **"section cards link to /timeline/ and /policy/"** — the Timeline card is
   gone. **Rewrite** to assert the two cards link to `/policy/` and `/orgs/`.
   (Note: scope card assertions so they don't accidentally match the
   "View full timeline" link, which also matches `/Timeline/i` in `main`.)
- The "renders site title and values statement" test checks for
  `/transformational impact/i` — that text is in paragraph 1, which stays in the
  hero, so this test is unaffected.

# Homepage & Site Rename — Design Spec

**Date:** 2026-04-25  
**Status:** Approved

## Overview

Add a homepage that explains the project's objective, audience, and how to contribute. Simultaneously rename the site from "AI Safety Gov Tracker" to "AI Governance Tracker" throughout the codebase.

## Goals

- Give first-time visitors a clear explanation of what the tracker is and why it exists
- Express a values position (AI safety matters; Canada's policy response deserves scrutiny) without editorialising the content itself
- Direct visitors to the Timeline as the primary entry point
- Make it easy to contribute via a GitHub issue
- Rename the site consistently to "AI Governance Tracker"

## Audience

Engaged citizens and advocates who care about AI safety and want to stay informed about Canada's policy response. Policy researchers and industry practitioners may also use the site but have deeper specialist sources; this site serves the broader informed public.

## URL Structure

| Route | Before | After |
|---|---|---|
| `/` | Timeline page | **Homepage (new)** |
| `/timeline/` | — | Timeline page (moved) |
| `/legislation/` | Legislation | Legislation (unchanged) |
| `/events/[id]/` | Event detail | Event detail (unchanged) |
| `/artifacts/[id]/` | Artifact detail | Artifact detail (unchanged) |
| `/orgs/[id]/` | Org detail | Org detail (unchanged) |

## Navigation

Header nav order: **Home · Timeline · Legislation**

A link to Organizations (`/orgs/`) is tracked separately in [issue #23](https://github.com/jrhender/ai-governance-tracker/issues/23) and is out of scope here.

## Homepage Layout (Option A — Compact hero + section cards)

### Hero
- **Title:** "AI Governance Tracker"
- **Subtitle:** "Tracking Canadian AI governance and policy"
- **Values statement (2–3 sentences):** AI is one of the most consequential technologies in human history. AI safety in particular deserves serious attention. This tracker follows Canada's policy response — so that anyone who cares can stay informed.

### CTAs
- **Primary:** "Browse the Timeline →" — links to `/timeline/`
- **Secondary:** "Contribute via GitHub" — links to the repo's new-issue page (`https://github.com/jrhender/ai-governance-tracker/issues/new`)

### Section cards (2-column grid)
Two cards below the CTAs, each with a title, short description, and a link:

| Card | Title | Description | Link |
|---|---|---|---|
| 1 | Timeline | Senate hearings, reports, and government announcements | `/timeline/` |
| 2 | Legislation | Bills and acts tracked through Parliament | `/legislation/` |

## Site Rename

Replace "AI Safety Gov Tracker" → "AI Governance Tracker" in:

- `src/layouts/BaseLayout.astro` — `siteTitle` constant, nav link text
- `src/pages/index.astro` — page `title` and `description` props (these become the homepage content)
- `src/pages/legislation/index.astro` — `title` prop if it references the old name
- `README.md` — title and any references
- `package.json` — `name` field (cosmetic only, not a published package)

## Implementation Notes

- The timeline page (`src/pages/timeline/index.astro`) is a move of the current `src/pages/index.astro` timeline logic — no functional change to the timeline itself.
- The new homepage is a new `src/pages/index.astro` that renders a static Astro page (no React needed — no interactivity required).
- Styling follows the existing Tailwind conventions in `BaseLayout.astro`.
- No new data fetching or content collections needed for the homepage.

## Out of Scope

- Organizations nav link (tracked in issue #23)
- Any changes to timeline functionality, legislation page, or detail pages
- A full "about" or FAQ page

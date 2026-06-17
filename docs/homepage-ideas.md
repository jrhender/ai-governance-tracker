# Homepage improvement ideas

The current homepage (`src/pages/index.astro`) is entirely static: two paragraphs
of mission copy, two buttons, and two generic cards ("Timeline" / "Policy") that
only *describe* sub-pages. It shows none of the actual content the site tracks,
and it looks identical whether the dataset holds 1 event or 1,000.

Meanwhile the data layer is rich: events, artifacts, organizations, dated entries,
tags, source categories, org roles, and policy recommendations with `status`
fields. The overarching opportunity is to **make the homepage show the living
state of Canadian AI governance, not just describe the site.**

Ideas, roughly ordered by impact-per-effort:

## High impact, low effort

### 1. "Latest activity" preview — the 3–5 most recent timeline entries
Render the newest events at the top with date, title, and source badge, each
linking through. Instantly signals the site is alive and current, and gives a
returning visitor a reason to look. The list is already computed in
`timeline/index.astro` — a small refactor into a shared helper.

### 2. At-a-glance stat strip
A row of numbers: *events tracked · reports & legislation · organizations ·
last updated [date]*. Cheap to compute, conveys scope + freshness. The
"last updated" date is especially good for trust.

### 3. Policy implementation scoreboard
The most *unique* data and arguably the site's whole point ("Track implementation
status of policy recommendations"). A small visual breakdown — e.g.
`X adopted · Y under review · Z rejected · N untracked` — that exists nowhere
else. Links into `/policy/`.

## Medium effort, high "useful"

### 4. Compact visual timeline / activity sparkline
A horizontal mini-timeline (by year, 2017→present) showing where activity
density is. Turns an abstract list into a glanceable shape of how AI governance
has accelerated.

### 5. Topic / tag entry points
Instead of two generic cards, surface the actual top tags (e.g. `bill-c27`,
`pan-canadian-ai-strategy`, `federal-budget`) as clickable chips. Lets people
jump straight to what they care about.

## Polish

### 6. Tighten the hero copy
The two dense paragraphs bury the lede. A short headline + one-sentence value
prop, with the nuance moved to an About page, would let the *content* below
become the eye-catching part.

---

**Recommended first cut:** #1 + #2 + #3 together — recent activity + stat strip +
policy scoreboard — all built from data already loaded, no new data model,
fully static-renderable in Astro.

## Status

- [x] #1 Latest activity preview — *done*
- [ ] #2 At-a-glance stat strip
- [ ] #3 Policy implementation scoreboard
- [ ] #4 Activity sparkline
- [ ] #5 Topic / tag entry points
- [ ] #6 Hero copy polish

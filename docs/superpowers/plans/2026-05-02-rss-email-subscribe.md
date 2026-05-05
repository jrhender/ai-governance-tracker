# RSS Feed + Email Subscribe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static `/rss.xml` feed (events + artifacts, deduplicated) and a Buttondown subscribe form in the site footer.

**Architecture:** A pure TypeScript utility (`src/lib/rss.ts`) handles deduplication and item mapping — kept separate from Astro so it can be unit-tested with Vitest. An Astro API endpoint (`src/pages/rss.xml.ts`) calls `getCollection`, maps the results to the utility's input types, and returns the feed. `BaseLayout.astro` gains an RSS auto-discovery `<link>` in `<head>` and a subscribe form in the footer.

**Tech Stack:** Astro 5, `@astrojs/rss`, Vitest, Tailwind CSS

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `package.json` / `pnpm-lock.yaml` | add `@astrojs/rss` dependency |
| Create | `src/lib/rss.ts` | pure deduplication + item-mapping utility |
| Create | `src/lib/rss.test.ts` | Vitest unit tests for the utility |
| Create | `src/pages/rss.xml.ts` | Astro API endpoint — loads collections, calls utility, returns feed |
| Modify | `src/layouts/BaseLayout.astro` | RSS `<link>` in `<head>` + subscribe form in footer |

---

## Task 1: Install `@astrojs/rss`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the package**

```bash
pnpm add @astrojs/rss
```

Expected: package added, `pnpm-lock.yaml` updated, no errors.

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Add @astrojs/rss dependency"
```

---

## Task 2: RSS utility — tests then implementation

**Files:**
- Create: `src/lib/rss.ts`
- Create: `src/lib/rss.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/rss.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildRssItems, type RssEvent, type RssArtifact } from "./rss";

const SITE = "https://ai-governance-tracker.com";

function makeEvent(overrides: Partial<RssEvent> = {}): RssEvent {
  return {
    id: "evt-1",
    title: "A Senate Hearing",
    date: new Date("2026-01-01"),
    description: "A short description.",
    ...overrides,
  };
}

function makeArtifact(overrides: Partial<RssArtifact> = {}): RssArtifact {
  return {
    id: "art-1",
    title: "A Report",
    date: new Date("2026-01-02"),
    description: "Report summary.",
    derivedFromEventIds: [],
    ...overrides,
  };
}

describe("buildRssItems", () => {
  it("includes all artifacts", () => {
    const items = buildRssItems([], [makeArtifact()], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Report");
  });

  it("includes events with no derived artifact", () => {
    const items = buildRssItems([makeEvent()], [], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Senate Hearing");
  });

  it("excludes events that are derived from by an artifact", () => {
    const event = makeEvent({ id: "evt-source" });
    const artifact = makeArtifact({ derivedFromEventIds: ["evt-source"] });
    const items = buildRssItems([event], [artifact], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Report");
  });

  it("includes an event not referenced by any artifact when others are referenced", () => {
    const standalone = makeEvent({ id: "evt-standalone", title: "Standalone" });
    const referenced = makeEvent({ id: "evt-ref", title: "Referenced" });
    const artifact = makeArtifact({ derivedFromEventIds: ["evt-ref"] });
    const items = buildRssItems([standalone, referenced], [artifact], SITE);
    expect(items.map((i) => i.title)).toContain("Standalone");
    expect(items.map((i) => i.title)).not.toContain("Referenced");
  });

  it("sorts items descending by date", () => {
    const old = makeEvent({ id: "old", title: "Old", date: new Date("2025-01-01") });
    const recent = makeArtifact({ id: "new", title: "New", date: new Date("2026-06-01") });
    const items = buildRssItems([old], [recent], SITE);
    expect(items[0].title).toBe("New");
    expect(items[1].title).toBe("Old");
  });

  it("sets event link to /events/<id>/", () => {
    const items = buildRssItems([makeEvent({ id: "my-event" })], [], SITE);
    expect(items[0].link).toBe(`${SITE}/events/my-event/`);
  });

  it("sets artifact link to /artifacts/<id>/", () => {
    const items = buildRssItems([], [makeArtifact({ id: "my-artifact" })], SITE);
    expect(items[0].link).toBe(`${SITE}/artifacts/my-artifact/`);
  });

  it("truncates description longer than 300 chars and appends ellipsis", () => {
    const long = "x".repeat(350);
    const items = buildRssItems([makeEvent({ description: long })], [], SITE);
    expect(items[0].description.length).toBeLessThanOrEqual(301); // 300 chars + "…"
    expect(items[0].description.endsWith("…")).toBe(true);
  });

  it("does not truncate description of exactly 300 chars", () => {
    const exact = "y".repeat(300);
    const items = buildRssItems([makeEvent({ description: exact })], [], SITE);
    expect(items[0].description).toBe(exact);
  });

  it("uses title as description fallback when description is undefined", () => {
    const items = buildRssItems([makeEvent({ description: undefined })], [], SITE);
    expect(items[0].description).toBe("A Senate Hearing");
  });

  it("returns empty array when given no events or artifacts", () => {
    expect(buildRssItems([], [], SITE)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
pnpm test src/lib/rss.test.ts
```

Expected: multiple failures like `Cannot find module './rss'`.

- [ ] **Step 3: Implement `src/lib/rss.ts`**

Create `src/lib/rss.ts`:

```typescript
const DESCRIPTION_MAX = 300;

function truncate(text: string): string {
  if (text.length <= DESCRIPTION_MAX) return text;
  return text.slice(0, DESCRIPTION_MAX).trimEnd() + "…";
}

export type RssEvent = {
  id: string;
  title: string;
  date: Date;
  description?: string;
};

export type RssArtifact = {
  id: string;
  title: string;
  date: Date;
  description?: string;
  derivedFromEventIds: string[];
};

export type RssItem = {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
};

export function buildRssItems(
  events: RssEvent[],
  artifacts: RssArtifact[],
  siteUrl: string,
): RssItem[] {
  const derivedEventIds = new Set(
    artifacts.flatMap((a) => a.derivedFromEventIds),
  );

  const eventItems: RssItem[] = events
    .filter((e) => !derivedEventIds.has(e.id))
    .map((e) => ({
      title: e.title,
      description: truncate(e.description ?? e.title),
      pubDate: e.date,
      link: `${siteUrl}/events/${e.id}/`,
    }));

  const artifactItems: RssItem[] = artifacts.map((a) => ({
    title: a.title,
    description: truncate(a.description ?? a.title),
    pubDate: a.date,
    link: `${siteUrl}/artifacts/${a.id}/`,
  }));

  return [...eventItems, ...artifactItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
pnpm test src/lib/rss.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/rss.ts src/lib/rss.test.ts
git commit -m "Add buildRssItems utility with deduplication and tests"
```

---

## Task 3: Astro RSS endpoint

**Files:**
- Create: `src/pages/rss.xml.ts`

This endpoint runs at build time and returns the feed XML. It uses Astro's `getCollection` to load events and artifacts, maps them to the types expected by `buildRssItems`, then calls `@astrojs/rss`'s `rss()` helper.

Note: `d.id.id` (double `.id`) is required because Astro's `reference()` schema wraps the raw ID in an object — as seen in `src/pages/artifacts/[id].astro` line 27.

- [ ] **Step 1: Create the endpoint**

Create `src/pages/rss.xml.ts`:

```typescript
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { buildRssItems } from "../lib/rss";

export async function GET(context: APIContext) {
  const events = await getCollection("events");
  const artifacts = await getCollection("artifacts");

  const rssEvents = events.map((e) => ({
    id: e.id,
    title: e.data.title,
    date: e.data.date,
    description: e.data.description,
  }));

  const rssArtifacts = artifacts.map((a) => ({
    id: a.id,
    title: a.data.title,
    date: a.data.published_date,
    description: a.data.description,
    derivedFromEventIds: a.data.derives_from.map((d) => d.id.id),
  }));

  const siteUrl = (context.site?.toString() ?? "").replace(/\/$/, "");
  const items = buildRssItems(rssEvents, rssArtifacts, siteUrl);

  return rss({
    title: "AI Governance Tracker",
    description:
      "Canadian AI governance and policy updates — Senate hearings, legislation, and government action.",
    site: context.site!,
    items,
  });
}
```

- [ ] **Step 2: Build the site and verify the feed**

```bash
pnpm build
```

Expected: build succeeds with no errors.

```bash
cat dist/rss.xml | head -40
```

Expected: valid RSS XML with `<channel>` and `<item>` elements. Confirm that items appear, links point to `/events/` or `/artifacts/`, and no event that has a derived artifact appears twice.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "Add /rss.xml Astro endpoint with event+artifact feed"
```

---

## Task 4: RSS auto-discovery + subscribe form in BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

Two changes to `BaseLayout.astro`:
1. Add a `<link rel="alternate">` tag in `<head>` for RSS reader auto-discovery.
2. Add a Buttondown subscribe form to the footer above the existing text.

The Buttondown username is defined as a named constant at the top of the frontmatter so it is easy to find and update after account creation.

- [ ] **Step 1: Add the RSS auto-discovery link and subscribe form**

In `src/layouts/BaseLayout.astro`, make the following changes:

**In the frontmatter (after existing imports), add the constant:**

```typescript
const BUTTONDOWN_USERNAME = "your-username"; // update after creating Buttondown account
```

**In `<head>`, add after the `<link rel="icon">` line:**

```html
<link
  rel="alternate"
  type="application/rss+xml"
  title="AI Governance Tracker"
  href="/rss.xml"
/>
```

**In the footer, replace the existing footer content:**

```html
<footer class="bg-header">
  <div class="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-[#8ab8c8]">
    <p class="mb-4">
      Get weekly updates on Canadian AI governance delivered to your inbox.
    </p>
    <form
      action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
      method="post"
      target="popupwindow"
      onsubmit={`window.open('https://buttondown.com/${BUTTONDOWN_USERNAME}', 'popupwindow')`}
      class="inline-flex gap-2 justify-center"
    >
      <input
        type="email"
        name="email"
        id="bd-email"
        placeholder="you@example.com"
        required
        class="rounded px-3 py-1.5 text-sm text-ink bg-white border border-border focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        class="rounded bg-accent px-4 py-1.5 text-sm font-semibold text-header hover:bg-accent-dark transition-colors"
      >
        Subscribe
      </button>
    </form>
    <p class="mt-6">
      A Canadian AI governance and policy timeline. &nbsp;·&nbsp;
      Anonymous usage statistics via&nbsp;
      <a
        href="https://www.cloudflare.com/web-analytics/"
        class="text-[#8ab8c8] hover:text-white underline"
      >
        Cloudflare Web Analytics
      </a>
      &nbsp;·&nbsp;
      <a href="/rss.xml" class="text-[#8ab8c8] hover:text-white underline">RSS</a>
    </p>
  </div>
</footer>
```

- [ ] **Step 2: Build and visually verify**

```bash
pnpm build && npx astro preview --port 4321
```

Open `http://localhost:4321` in a browser. Confirm:
- Footer shows the subscribe form with an email input and Subscribe button
- Footer still shows the existing "A Canadian AI governance..." line and RSS link
- Page source includes `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add RSS auto-discovery link and Buttondown subscribe form to footer"
```

---

## Post-Implementation: Buttondown Setup (manual)

After the code ships, complete these steps in Buttondown:

1. Create a Buttondown account at [buttondown.com](https://buttondown.com).
2. Note your username and update `BUTTONDOWN_USERNAME` in `src/layouts/BaseLayout.astro`.
3. In Buttondown → Automations, create an RSS automation:
   - Feed URL: `https://ai-governance-tracker.com/rss.xml`
   - Cadence: weekly
4. Commit the username update and push to trigger a redeploy.

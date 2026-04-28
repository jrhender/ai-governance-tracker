# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monochromatic slate/grey design with a Deep Teal palette (petrol blue header, teal-mint accent, warm white body), DM Serif Display + Source Serif 4 + DM Sans typography, teal-accented timeline with inline org chips and source icon links, and an SVG favicon. Light mode only.

**Architecture:** CSS custom properties defined via Tailwind v4's `@theme` block create new utility classes (`bg-header`, `text-accent`, `font-display`, etc.) used consistently across all Astro pages and TSX components. The `TimelineItem` type gains `orgs` and `links` fields, plumbed through from the Astro page, enabling org chips and source icon links in `TimelineList`. Dark mode is removed entirely.

**Tech Stack:** Astro, Tailwind CSS v4 (`@import "tailwindcss"` / `@theme`), React TSX components, Vitest + Testing Library, Google Fonts (DM Serif Display, Source Serif 4, DM Sans).

**Branch:** `feature/site-redesign`  
**Spec:** `docs/superpowers/specs/2026-04-27-site-redesign-design.md`  
**Issue:** #42

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/styles/global.css` | Modify | Tailwind v4 `@theme` color + font tokens, base body styles, chip component classes, remove dark variant |
| `public/favicon.svg` | Create | SVG favicon mark |
| `src/layouts/BaseLayout.astro` | Modify | Google Fonts, favicon link, petrol blue header with logo-mark + active nav, petrol blue footer, remove dark mode script |
| `src/lib/timeline.ts` | Modify | Add `orgs` and `links` fields to `TimelineItem` type |
| `src/pages/timeline/index.astro` | Modify | Pass `orgs` and `links` through when building `TimelineItem` array |
| `src/components/TimelineList.tsx` | Modify | Full restyle — teal spine/dots, Source Serif 4 titles, org chips, source icon links |
| `src/components/TimelineList.test.tsx` | Create | Tests for org chip rendering and source link rendering |
| `src/components/OrgFilter.tsx` | Modify | Restyle filter chips (remove dark:, new active/inactive colours) |
| `src/pages/index.astro` | Modify | Hero with eyebrow + DM Serif Display headline, teal-left-border feature cards |
| `src/pages/policy/index.astro` | Modify | DM Serif Display headings, teal-left-border artifact cards, remove dark: |
| `src/pages/orgs/index.astro` | Modify | Unified teal-left-border card treatment, remove dark: |
| `src/pages/orgs/[id].astro` | Modify | New palette, accent-dark links, remove dark: |
| `src/pages/events/[id].astro` | Modify | New palette, remove dark: |
| `src/pages/artifacts/[id].astro` | Modify | New palette, remove dark: |

---

## Task 1: CSS Tokens + Favicon

**Files:**
- Modify: `src/styles/global.css`
- Create: `public/favicon.svg`

- [ ] **Step 1: Replace global.css contents**

```css
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-sans:    'DM Sans', system-ui, sans-serif;
  --font-serif:   'Source Serif 4', Georgia, serif;
  --font-display: 'DM Serif Display', Georgia, serif;

  /* Colours */
  --color-header:    #0f3040;
  --color-accent:    #4ecdc4;
  --color-accent-dark: #2aada4;
  --color-body:      #f7f8f8;
  --color-surface:   #ffffff;
  --color-border:    #d0dce0;
  --color-border-lt: #e8f0f4;
  --color-ink:       #0f2a38;
  --color-muted:     #5a7a88;
  --color-faint:     #8aa0aa;
}

:root {
  color-scheme: light;
}

@layer base {
  body {
    font-family: var(--font-sans);
    background-color: var(--color-body);
    color: var(--color-ink);
  }
}

@layer components {
  .chip-type {
    @apply inline-block text-xs px-2 py-0.5 rounded-full font-semibold;
    background: #e0f4f4;
    color: #0a5858;
    border: 1px solid #a8dcdc;
  }

  .chip-org {
    @apply inline-block text-xs px-2 py-0.5 rounded-full font-semibold no-underline;
    background: white;
    color: #1a5878;
    border: 1px solid #b0d4e4;
  }

  .chip-org:hover {
    background: #e8f4f8;
    border-color: #7ab8d0;
  }
}
```

- [ ] **Step 2: Create the public directory and favicon**

Create `public/favicon.svg` (the `public/` directory doesn't exist yet — create it with the file):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0f3040"/>
  <text
    x="16" y="22"
    font-family="Georgia, serif"
    font-size="14"
    font-weight="700"
    fill="#4ecdc4"
    text-anchor="middle"
  >AI</text>
</svg>
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css public/favicon.svg
git commit -m "Add Deep Teal design tokens and SVG favicon (issue #42)"
```

---

## Task 2: BaseLayout — Header, Footer, Fonts, Dark Mode Removal

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Replace BaseLayout.astro contents**

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const siteTitle = "AI Governance Tracker";
const fullTitle = title === siteTitle ? title : `${title} — ${siteTitle}`;

const path = Astro.url.pathname;
const navLinks = [
  { href: "/timeline/", label: "Timeline" },
  { href: "/orgs/", label: "Organizations" },
  { href: "/policy/", label: "Policy" },
];
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{fullTitle}</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="min-h-screen antialiased">
    <header class="bg-header">
      <div class="mx-auto flex max-w-4xl items-stretch justify-between px-6">
        <a
          href="/"
          class="flex items-center gap-2.5 py-4 font-display text-base text-white no-underline"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-accent text-xs font-bold font-sans text-header"
          >
            AI
          </span>
          {siteTitle}
        </a>
        <nav class="flex" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const active = path.startsWith(href);
            return (
              <a
                href={href}
                class={[
                  "flex items-center px-4 text-sm font-medium border-b-[3px] transition-colors no-underline",
                  active
                    ? "text-white border-accent"
                    : "text-[#8ab8c8] border-transparent hover:text-white",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-6 py-10">
      <slot />
    </main>
    <footer class="bg-header">
      <div class="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-[#5a8a9a]">
        <p>
          A Canadian AI governance and policy timeline. &nbsp;·&nbsp;
          <a
            href="https://www.cloudflare.com/web-analytics/"
            class="text-[#8ab8c8] hover:text-white underline"
          >
            Cloudflare Web Analytics
          </a>
        </p>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: build completes. Site pages now have petrol blue header/footer.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Restyle BaseLayout with Deep Teal header/footer and Google Fonts (issue #42)"
```

---

## Task 3: TimelineItem Type — Add `orgs` and `links` Fields

**Files:**
- Modify: `src/lib/timeline.ts`
- Modify: `src/pages/timeline/index.astro`

- [ ] **Step 1: Update `TimelineItem` type in `src/lib/timeline.ts`**

Replace the `TimelineItem` type (keep `OrgOption` and `filterByOrg` unchanged):

```typescript
export type TimelineItem = {
  id: string;
  kind: "event";
  title: string;
  date: string; // ISO string — sorted in Astro before passing
  description?: string;
  tags: string[];
  href: string;
  badge: string;
  orgIds: string[]; // flattened org IDs for filtering
  orgs: { id: string; label: string }[]; // for displaying org chips
  links: { label: string; url: string; icon?: string }[]; // source links
};
```

- [ ] **Step 2: Update `src/pages/timeline/index.astro` to populate the new fields**

Replace the `items` mapping (keep all other logic — orgMap, orgCounts, orgs — unchanged):

```typescript
const items: TimelineItem[] = events
  .map((e) => ({
    id: e.id,
    kind: "event" as const,
    title: e.data.title,
    date: e.data.date.toISOString(),
    description: e.data.description,
    tags: e.data.tags,
    href: `/events/${e.id}/`,
    badge: e.data.type,
    orgIds: e.data.organizations.map((o) => o.id.id),
    orgs: e.data.organizations.map((o) => {
      const org = orgMap.get(o.id.id);
      return { id: o.id.id, label: org?.short_name ?? org?.name ?? o.id.id };
    }),
    links: e.data.links,
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/timeline.ts src/pages/timeline/index.astro
git commit -m "Add orgs and links fields to TimelineItem (issue #42)"
```

---

## Task 4: TimelineList — Restyle + Org Chips + Source Links

**Files:**
- Modify: `src/components/TimelineList.tsx`
- Create: `src/components/TimelineList.test.tsx`

- [ ] **Step 1: Write the failing tests first**

Create `src/components/TimelineList.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TimelineList from "./TimelineList";
import type { TimelineItem } from "../lib/timeline";

const baseItem: TimelineItem = {
  id: "test-1",
  kind: "event",
  title: "Senate Committee Hearing on AI Safety",
  date: "2025-04-15T00:00:00.000Z",
  tags: [],
  href: "/events/test-1/",
  badge: "CommitteeHearing",
  orgIds: ["senate"],
  orgs: [{ id: "senate", label: "Senate SOCI" }],
  links: [],
};

describe("TimelineList", () => {
  it("renders org chips as links to /orgs/<id>/", () => {
    render(<TimelineList items={[baseItem]} />);
    const chip = screen.getByRole("link", { name: "Senate SOCI" });
    expect(chip).toHaveAttribute("href", "/orgs/senate/");
  });

  it("renders source links when item.links is non-empty", () => {
    const item: TimelineItem = {
      ...baseItem,
      links: [
        { label: "Hansard", url: "https://example.com/hansard", icon: "document" },
        { label: "Video", url: "https://example.com/video", icon: "video" },
      ],
    };
    render(<TimelineList items={[item]} />);
    expect(screen.getByRole("link", { name: /Hansard/ })).toHaveAttribute(
      "href",
      "https://example.com/hansard",
    );
    expect(screen.getByRole("link", { name: /Video/ })).toHaveAttribute(
      "href",
      "https://example.com/video",
    );
  });

  it("does not render a source-links row when item.links is empty", () => {
    render(<TimelineList items={[baseItem]} />);
    // The only links should be the title and the org chip
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).not.toContain("https://example.com/hansard");
  });

  it("renders an empty-state message when items list is empty", () => {
    render(<TimelineList items={[]} />);
    expect(screen.getByText("No items match this filter.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- TimelineList
```

Expected: tests fail — `TimelineList` doesn't accept `orgs` or `links` yet.

- [ ] **Step 3: Replace `src/components/TimelineList.tsx`**

```typescript
import type { TimelineItem } from "../lib/timeline";
import { fmtDate } from "../lib/format";

type Props = {
  items: TimelineItem[];
};

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 2h6l4 4v8H2V2h2z" />
      <path d="M10 2v4h4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="6.5" />
      <polygon points="6.5,5.5 11.5,8 6.5,10.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M7 3H3v10h10V9" />
      <path d="M10 2h4v4" />
      <path d="M13 3l-6 6" />
    </svg>
  );
}

function LinkIcon({ icon }: { icon?: string }) {
  if (icon === "video") return <VideoIcon />;
  if (icon === "document") return <DocumentIcon />;
  return <ExternalIcon />;
}

export default function TimelineList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-muted">No items match this filter.</p>
    );
  }

  return (
    <ol aria-label="Timeline" className="mt-8 border-l-2 border-accent">
      {items.map((item) => (
        <li key={item.id} className="relative pl-7 pb-8">
          <span className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-body" />
          <time
            dateTime={item.date}
            className="block text-xs text-faint font-medium mb-1"
          >
            {fmtDate(item.date)}
          </time>
          <a
            href={item.href}
            className="block font-serif text-base font-semibold text-header leading-snug hover:text-accent-dark mb-2 no-underline"
          >
            {item.title}
          </a>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="chip-type">{item.badge}</span>
            {item.orgs.map((org) => (
              <a key={org.id} href={`/orgs/${org.id}/`} className="chip-org">
                {org.label}
              </a>
            ))}
          </div>
          {item.description && (
            <p className="text-sm text-muted leading-relaxed mb-2 max-w-2xl">
              {item.description}
            </p>
          )}
          {item.links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {item.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent-dark hover:text-header font-medium no-underline"
                >
                  <LinkIcon icon={link.icon} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- TimelineList
```

Expected: all 4 tests pass.

- [ ] **Step 5: Full build check**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/TimelineList.tsx src/components/TimelineList.test.tsx
git commit -m "Restyle TimelineList with org chips and source icon links (issue #42)"
```

---

## Task 5: OrgFilter — Restyle Filter Chips

**Files:**
- Modify: `src/components/OrgFilter.tsx`

- [ ] **Step 1: Confirm existing tests pass before touching anything**

```bash
npm test -- OrgFilter
```

Expected: 3 tests pass (they test behaviour, not styles — they will still pass after the restyle).

- [ ] **Step 2: Replace the className strings in `src/components/OrgFilter.tsx`**

Replace the three `const` declarations at the top of the component function and nothing else:

```typescript
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active =
    "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";
```

- [ ] **Step 3: Run tests to confirm they still pass**

```bash
npm test -- OrgFilter
```

Expected: all 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/OrgFilter.tsx
git commit -m "Restyle OrgFilter chips with Deep Teal palette (issue #42)"
```

---

## Task 6: Homepage + Timeline Page

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/timeline/index.astro`

- [ ] **Step 1: Replace `src/pages/index.astro` contents**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="AI Governance Tracker"
  description="Tracking Canadian AI governance and policy — Senate hearings, legislation, and government action."
>
  <div class="py-8">
    <p class="text-xs font-semibold uppercase tracking-widest text-accent-dark mb-3">
      AI Policy · Governance · Safety
    </p>
    <h1 class="font-display text-5xl leading-tight text-header tracking-tight">
      AI Governance Tracker
    </h1>
    <p class="mt-4 max-w-xl text-base text-muted leading-relaxed">
      Tracking government responses to artificial intelligence — Senate hearings,
      legislation, and policy action — so that anyone who cares can stay informed.
    </p>

    <div class="mt-8 flex flex-wrap gap-3">
      <a
        href="/timeline/"
        class="inline-flex items-center rounded bg-header px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a4a60] no-underline transition-colors"
      >
        Browse the Timeline →
      </a>
      <a
        href="https://github.com/jrhender/ai-governance-tracker/issues/new"
        class="inline-flex items-center rounded border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:border-[#aabbcc] hover:text-ink no-underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contribute via GitHub
      </a>
    </div>

    <div class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <a
        href="/timeline/"
        class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
      >
        <h2 class="font-display text-lg text-header">Timeline</h2>
        <p class="mt-1 text-sm text-muted">
          Senate hearings, reports, and government announcements.
        </p>
      </a>
      <a
        href="/policy/"
        class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
      >
        <h2 class="font-display text-lg text-header">Policy</h2>
        <p class="mt-1 text-sm text-muted">
          Legislation, reports, and policy documents.
        </p>
      </a>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Update `src/pages/timeline/index.astro` heading styles**

The page heading block (lines 49–58 in the original) currently reads:
```astro
<BaseLayout
  title="Timeline"
  description="..."
>
  <h1 class="text-3xl font-bold tracking-tight">Timeline</h1>
  <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
    Canadian AI governance and policy events, reports, and government action.
  </p>

  <TimelineWithFilter client:load items={items} orgs={orgs} />
</BaseLayout>
```

Replace it with:
```astro
<BaseLayout
  title="Timeline"
  description="Canadian AI governance and policy events, reports, and government action."
>
  <h1 class="font-display text-4xl text-header">Timeline</h1>
  <p class="mt-2 max-w-2xl text-muted">
    Canadian AI governance and policy events, reports, and government action.
  </p>

  <TimelineWithFilter client:load items={items} orgs={orgs} />
</BaseLayout>
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/timeline/index.astro
git commit -m "Restyle homepage and timeline page with Deep Teal design (issue #42)"
```

---

## Task 7: Policy + Orgs Pages

**Files:**
- Modify: `src/pages/policy/index.astro`
- Modify: `src/pages/orgs/index.astro`
- Modify: `src/pages/orgs/[id].astro`

- [ ] **Step 1: Replace `src/pages/policy/index.astro` contents**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { badgeClass, statusLabel } from "../../lib/legislation";
import { fmtDate } from "../../lib/format";

const artifacts = await getCollection("artifacts");

function byDateDesc(a: { data: { published_date: Date } }, b: { data: { published_date: Date } }) {
  return b.data.published_date.getTime() - a.data.published_date.getTime();
}

const legislation = artifacts.filter((a) => a.data.type === "Legislation").sort(byDateDesc);
const reports     = artifacts.filter((a) => a.data.type === "Report").sort(byDateDesc);
const policyDocs  = artifacts.filter((a) => a.data.type === "PolicyDocument").sort(byDateDesc);
const govPrograms = artifacts.filter((a) => a.data.type === "GovernmentProgram").sort(byDateDesc);
---

<BaseLayout
  title="Policy"
  description="Canadian AI legislation, reports, policy documents, and government programs."
>
  <h1 class="font-display text-4xl text-header">Policy</h1>

  {legislation.length > 0 && (
    <section class="mt-10">
      <h2 class="font-display text-2xl text-header">Legislation</h2>
      <p class="mt-2 max-w-2xl text-muted">
        Canadian federal bills and acts related to artificial intelligence. Each entry tracks
        the bill's lifecycle — from introduction through readings, committee study, and royal
        assent (or death on the order paper).
      </p>
      <div class="mt-6 space-y-4">
        {legislation.map((bill) => (
          <a
            href={`/artifacts/${bill.id}/`}
            class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-semibold text-header">{bill.data.title}</h3>
              {bill.data.lifecycle_status && (
                <span
                  class={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass(bill.data.lifecycle_status)}`}
                >
                  {statusLabel(bill.data.lifecycle_status)}
                </span>
              )}
            </div>
            {bill.data.current_stage && (
              <p class="mt-2 text-sm text-muted">{bill.data.current_stage}</p>
            )}
            <p class="mt-2 text-xs text-faint">
              Introduced: {fmtDate(bill.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {reports.length > 0 && (
    <section class="mt-10">
      <h2 class="font-display text-2xl text-header">Reports</h2>
      <p class="mt-2 max-w-2xl text-muted">
        Research reports and analytical summaries published by think tanks, government
        agencies, and advisory bodies.
      </p>
      <div class="mt-6 space-y-4">
        {reports.map((r) => (
          <a
            href={`/artifacts/${r.id}/`}
            class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
          >
            <h3 class="text-base font-semibold text-header">{r.data.title}</h3>
            {r.data.description && (
              <p class="mt-2 text-sm text-muted">{r.data.description}</p>
            )}
            <p class="mt-2 text-xs text-faint">
              Published: {fmtDate(r.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {policyDocs.length > 0 && (
    <section class="mt-10">
      <h2 class="font-display text-2xl text-header">Policy Documents</h2>
      <p class="mt-2 max-w-2xl text-muted">
        Voluntary codes of conduct, frameworks, and guidelines issued by government or
        industry bodies.
      </p>
      <div class="mt-6 space-y-4">
        {policyDocs.map((d) => (
          <a
            href={`/artifacts/${d.id}/`}
            class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
          >
            <h3 class="text-base font-semibold text-header">{d.data.title}</h3>
            {d.data.description && (
              <p class="mt-2 text-sm text-muted">{d.data.description}</p>
            )}
            <p class="mt-2 text-xs text-faint">
              Published: {fmtDate(d.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}

  {govPrograms.length > 0 && (
    <section class="mt-10">
      <h2 class="font-display text-2xl text-header">Government Programs</h2>
      <p class="mt-2 max-w-2xl text-muted">
        Ongoing federal programs and national strategies related to artificial intelligence.
      </p>
      <div class="mt-6 space-y-4">
        {govPrograms.map((p) => (
          <a
            href={`/artifacts/${p.id}/`}
            class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
          >
            <h3 class="text-base font-semibold text-header">{p.data.title}</h3>
            {p.data.description && (
              <p class="mt-2 text-sm text-muted">{p.data.description}</p>
            )}
            <p class="mt-2 text-xs text-faint">
              Published: {fmtDate(p.data.published_date)}
            </p>
          </a>
        ))}
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 2: Replace `src/pages/orgs/index.astro` contents**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

const orgs = await getCollection("organizations");
const allEvents = await getCollection("events");
const allArtifacts = await getCollection("artifacts");

const eventCounts = new Map<string, number>();
const artifactCounts = new Map<string, number>();
for (const e of allEvents) {
  for (const o of e.data.organizations) {
    eventCounts.set(o.id.id, (eventCounts.get(o.id.id) ?? 0) + 1);
  }
}
for (const a of allArtifacts) {
  for (const o of a.data.organizations) {
    artifactCounts.set(o.id.id, (artifactCounts.get(o.id.id) ?? 0) + 1);
  }
}

const sorted = [...orgs].sort((a, b) => a.data.name.localeCompare(b.data.name));
---

<BaseLayout
  title="Organizations"
  description="Think tanks, government bodies, and advocacy groups tracked in this database."
>
  <h1 class="font-display text-4xl text-header">Organizations</h1>
  <p class="mt-2 max-w-2xl text-muted">
    Think tanks, government bodies, and advocacy groups tracked in this database.
  </p>

  {sorted.length === 0 ? (
    <p class="mt-10 text-faint">No organizations tracked yet.</p>
  ) : (
    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sorted.map((org) => {
        const events = eventCounts.get(org.id) ?? 0;
        const artifacts = artifactCounts.get(org.id) ?? 0;
        return (
          <a
            href={`/orgs/${org.id}/`}
            class="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
          >
            {org.data.short_name && (
              <div class="text-base font-bold text-header">{org.data.short_name}</div>
            )}
            <div class={`text-sm text-muted ${org.data.short_name ? "mt-0.5" : "font-semibold text-base text-header"}`}>
              {org.data.name}
            </div>
            <div class="mt-3 text-xs text-faint">
              {[
                events > 0 && `${events} event${events === 1 ? "" : "s"}`,
                artifacts > 0 && `${artifacts} artifact${artifacts === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(" · ") || "No events yet"}
            </div>
            {org.data.tags.length > 0 && (
              <div class="mt-3 flex flex-wrap gap-1">
                {org.data.tags.map((t) => (
                  <span class="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </a>
        );
      })}
    </div>
  )}
</BaseLayout>
```

- [ ] **Step 3: Replace `src/pages/orgs/[id].astro` contents**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const orgs = await getCollection("organizations");
  return orgs.map((org) => ({
    params: { id: org.id },
    props: { org },
  }));
}

const { org } = Astro.props;
const { data } = org;

const allEvents = await getCollection("events");
const allArtifacts = await getCollection("artifacts");

const events = allEvents.filter((e) =>
  e.data.organizations.some((o) => o.id.id === org.id),
);
const artifacts = allArtifacts.filter((a) =>
  a.data.organizations.some((o) => o.id.id === org.id),
);
---

<BaseLayout title={data.name} description={`Organization: ${data.name}`}>
  <p class="text-sm text-faint">
    <a href="/orgs/" class="hover:underline text-accent-dark">← Organizations</a>
  </p>
  <h1 class="mt-4 font-display text-3xl text-header">{data.name}</h1>
  {data.short_name && (
    <p class="mt-1 text-faint">{data.short_name}</p>
  )}

  <div class="mt-4 flex flex-wrap gap-4 text-sm">
    {data.url && (
      <a
        href={data.url}
        class="text-accent-dark hover:underline"
        rel="noopener noreferrer"
      >
        Website ↗
      </a>
    )}
    {data.wikipedia && (
      <a
        href={data.wikipedia}
        class="text-accent-dark hover:underline"
        rel="noopener noreferrer"
      >
        Wikipedia ↗
      </a>
    )}
  </div>

  {events.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Events
      </h2>
      <ul class="space-y-1">
        {events.map((e) => (
          <li>
            <a href={`/events/${e.id}/`} class="text-sm text-ink hover:text-accent-dark hover:underline">
              {e.data.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )}

  {artifacts.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Artifacts
      </h2>
      <ul class="space-y-1">
        {artifacts.map((a) => (
          <li>
            <a href={`/artifacts/${a.id}/`} class="text-sm text-ink hover:text-accent-dark hover:underline">
              {a.data.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )}

  {data.tags.length > 0 && (
    <section class="mt-8 flex flex-wrap gap-2">
      {data.tags.map((t) => (
        <span class="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt">
          #{t}
        </span>
      ))}
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/policy/index.astro src/pages/orgs/index.astro src/pages/orgs/\[id\].astro
git commit -m "Restyle policy and orgs pages with Deep Teal design (issue #42)"
```

---

## Task 8: Detail Pages — Events and Artifacts

**Files:**
- Modify: `src/pages/events/[id].astro`
- Modify: `src/pages/artifacts/[id].astro`

- [ ] **Step 1: Replace `src/pages/events/[id].astro` contents**

```astro
---
import { getCollection, getEntry } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { fmtDate } from "../../lib/format";

export async function getStaticPaths() {
  const events = await getCollection("events");
  return events.map((event) => ({
    params: { id: event.id },
    props: { event },
  }));
}

const { event } = Astro.props;
const { data } = event;

const orgs = await Promise.all(
  data.organizations.map(async (o) => {
    const org = await getEntry("organizations", o.id.id);
    return { role: o.role, org };
  }),
);

const relatedArtifacts = await Promise.all(
  data.related_artifacts.map((a) => getEntry("artifacts", a.id.id)),
);
---

<BaseLayout title={data.title} description={data.description}>
  <p class="text-sm text-faint">
    <a href="/timeline/" class="text-accent-dark hover:underline">← Timeline</a>
  </p>
  <h1 class="mt-4 font-display text-3xl text-header">{data.title}</h1>
  <div class="mt-2 flex flex-wrap gap-3 text-sm text-faint">
    <time datetime={data.date.toISOString()}>{fmtDate(data.date)}</time>
    <span>·</span>
    <span>{data.type}</span>
    {data.location && (
      <>
        <span>·</span>
        <span>{data.location.name}</span>
      </>
    )}
    {data.status && (
      <>
        <span>·</span>
        <span>{data.status}</span>
      </>
    )}
  </div>

  {data.description && (
    <p class="mt-6 text-ink leading-relaxed">{data.description}</p>
  )}

  {orgs.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Organizations
      </h2>
      <ul class="space-y-1">
        {orgs.map(({ role, org }) =>
          org ? (
            <li>
              <a href={`/orgs/${org.id}/`} class="font-medium text-ink hover:text-accent-dark hover:underline">
                {org.data.short_name ?? org.data.name}
              </a>
              <span class="text-faint"> — {role}</span>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )}

  {data.links.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Links
      </h2>
      <ul class="space-y-1">
        {data.links.map((l) => (
          <li>
            <a
              href={l.url}
              class="text-accent-dark hover:underline"
              rel="noopener noreferrer"
            >
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  )}

  {relatedArtifacts.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Related artifacts
      </h2>
      <ul class="space-y-1">
        {relatedArtifacts.map((a) =>
          a ? (
            <li>
              <a href={`/artifacts/${a.id}/`} class="text-ink hover:text-accent-dark hover:underline">
                {a.data.title}
              </a>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )}

  {data.tags.length > 0 && (
    <section class="mt-8 flex flex-wrap gap-2">
      {data.tags.map((t) => (
        <span class="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt">
          #{t}
        </span>
      ))}
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 2: Replace `src/pages/artifacts/[id].astro` contents**

```astro
---
import { getCollection, getEntry } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { fmtDate } from "../../lib/format";

export async function getStaticPaths() {
  const artifacts = await getCollection("artifacts");
  return artifacts.map((artifact) => ({
    params: { id: artifact.id },
    props: { artifact },
  }));
}

const { artifact } = Astro.props;
const { data } = artifact;

const orgs = await Promise.all(
  data.organizations.map(async (o) => {
    const org = await getEntry("organizations", o.id.id);
    return { role: o.role, org };
  }),
);

const sources = await Promise.all(
  data.derives_from.map(async (d) => {
    const event = await getEntry("events", d.id.id);
    return { relationship: d.relationship, event };
  }),
);

const statusLabels: Record<string, string> = {
  untracked: "Untracked",
  under_review: "Under review",
  adopted: "Adopted",
  rejected: "Rejected",
};
---

<BaseLayout title={data.title} description={data.description}>
  <p class="text-sm text-faint">
    <a href="/policy/" class="text-accent-dark hover:underline">← Policy</a>
  </p>
  <h1 class="mt-4 font-display text-3xl text-header">{data.title}</h1>
  <div class="mt-2 flex flex-wrap gap-3 text-sm text-faint">
    <time datetime={data.published_date.toISOString()}>
      Published {fmtDate(data.published_date)}
    </time>
    <span>·</span>
    <span>{data.type}</span>
  </div>

  {data.description && (
    <p class="mt-6 text-ink leading-relaxed">{data.description}</p>
  )}

  {orgs.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Organizations
      </h2>
      <ul class="space-y-1">
        {orgs.map(({ role, org }) =>
          org ? (
            <li>
              <a href={`/orgs/${org.id}/`} class="font-medium text-ink hover:text-accent-dark hover:underline">
                {org.data.short_name ?? org.data.name}
              </a>
              <span class="text-faint"> — {role}</span>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )}

  {sources.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Derives from
      </h2>
      <ul class="space-y-1">
        {sources.map(({ relationship, event }) =>
          event ? (
            <li>
              <a href={`/events/${event.id}/`} class="text-ink hover:text-accent-dark hover:underline">
                {event.data.title}
              </a>
              <span class="text-faint"> — {relationship}</span>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )}

  {data.links.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Links
      </h2>
      <ul class="space-y-1">
        {data.links.map((l) => (
          <li>
            <a
              href={l.url}
              class="text-accent-dark hover:underline"
              rel="noopener noreferrer"
            >
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  )}

  {data.policy_recommendations.length > 0 && (
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-faint mb-2">
        Policy recommendations
      </h2>
      <ul class="space-y-2">
        {data.policy_recommendations.map((r) => (
          <li class="rounded border border-border bg-surface p-3">
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-xs text-faint">{r.id}</span>
              <span class="rounded-full bg-body px-2 py-0.5 text-xs text-muted border border-border-lt">
                {statusLabels[r.status] ?? r.status}
              </span>
            </div>
            {r.summary && (
              <p class="mt-2 text-sm text-ink">{r.summary}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )}

  {data.tags.length > 0 && (
    <section class="mt-8 flex flex-wrap gap-2">
      {data.tags.map((t) => (
        <span class="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt">
          #{t}
        </span>
      ))}
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: Run full test suite and build**

```bash
npm test && npm run build
```

Expected: all tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/events/\[id\].astro src/pages/artifacts/\[id\].astro
git commit -m "Restyle event and artifact detail pages with Deep Teal design (issue #42)"
```

---

## Final Verification

- [ ] **Run all tests**

```bash
npm test
```

Expected: all tests pass (OrgFilter × 3, TimelineList × 4).

- [ ] **Run build**

```bash
npm run build
```

Expected: clean build, no type errors or warnings.

- [ ] **Check `.gitignore` for `.superpowers/`**

```bash
grep superpowers .gitignore
```

If not present, add it:

```bash
echo '.superpowers/' >> .gitignore
git add .gitignore
git commit -m "Ignore .superpowers/ brainstorm session files"
```

# Source Category Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Government / Civil Society source filter with colour-coded visual treatment to the Policy page and Timeline, derived from linked organization schema types.

**Architecture:** A pure `getSourceCategory()` helper derives the category from org `schema_type` values at build time (Astro pages). The category is passed as a serializable field into React islands (`PolicyWithSourceFilter`, updated `TimelineWithFilter`) which manage filter state client-side. A shared `SourceFilter` component renders the pill UI used on both pages.

**Tech Stack:** Astro 5, React 19, TypeScript, Vitest + Testing Library, Tailwind CSS v4 with CSS custom properties.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/lib/sourceCategory.ts` | **Create** | `SourceCategory` type + `getSourceCategory()` helper |
| `src/lib/sourceCategory.test.ts` | **Create** | Unit tests for the helper |
| `src/styles/global.css` | **Modify** | Add 10 CSS variables for gov/civil colours |
| `src/lib/timeline.ts` | **Modify** | Add `sourceCategory` field to `TimelineItem`; add `filterBySource()` |
| `src/lib/timeline.test.ts` | **Modify** | Update `make()` helper; add `filterBySource` tests |
| `src/components/SourceFilter.tsx` | **Create** | Source pill filter component (reused on both pages) |
| `src/components/SourceFilter.test.tsx` | **Create** | Unit tests for SourceFilter |
| `src/components/TimelineList.tsx` | **Modify** | Coloured spine dot + source badge per item |
| `src/components/TimelineList.test.tsx` | **Modify** | Tests for badge rendering |
| `src/components/TimelineWithFilter.tsx` | **Modify** | Add source filter state + SourceFilter row above OrgFilter |
| `src/pages/timeline/index.astro` | **Modify** | Resolve `sourceCategory` for each event; add to `TimelineItem` |
| `src/components/PolicyWithSourceFilter.tsx` | **Create** | Filterable React island replacing static policy sections |
| `src/components/PolicyWithSourceFilter.test.tsx` | **Create** | Render tests for filter behaviour |
| `src/pages/policy/index.astro` | **Modify** | Resolve `sourceCategory` per artifact; pass to `PolicyWithSourceFilter` |

---

### Task 1: `getSourceCategory` helper

**Files:**
- Create: `src/lib/sourceCategory.ts`
- Create: `src/lib/sourceCategory.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/sourceCategory.test.ts
import { describe, it, expect } from "vitest";
import { getSourceCategory } from "./sourceCategory";

describe("getSourceCategory", () => {
  it("returns 'government' when any org is GovernmentOrganization", () => {
    expect(getSourceCategory(["GovernmentOrganization"])).toBe("government");
  });

  it("returns 'government' when mixed org types include GovernmentOrganization", () => {
    expect(getSourceCategory(["Organization", "GovernmentOrganization"])).toBe("government");
  });

  it("returns 'civil_society' when all orgs are Organization", () => {
    expect(getSourceCategory(["Organization"])).toBe("civil_society");
  });

  it("returns 'civil_society' when array is empty", () => {
    expect(getSourceCategory([])).toBe("civil_society");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/lib/sourceCategory.test.ts
```

Expected: FAIL — `Cannot find module './sourceCategory'`

- [ ] **Step 3: Implement the helper**

```typescript
// src/lib/sourceCategory.ts
export type SourceCategory = "government" | "civil_society";

export function getSourceCategory(orgSchemaTypes: string[]): SourceCategory {
  if (orgSchemaTypes.some((t) => t === "GovernmentOrganization")) {
    return "government";
  }
  return "civil_society";
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/lib/sourceCategory.test.ts
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/sourceCategory.ts src/lib/sourceCategory.test.ts
git commit -m "Add getSourceCategory helper with tests"
```

---

### Task 2: CSS design tokens

**Files:**
- Modify: `src/styles/global.css`

No test needed — visual tokens verified by browser during later tasks.

- [ ] **Step 1: Add CSS variables to the `@theme` block**

In `src/styles/global.css`, add after `--color-faint: #5a6e78;` inside the `@theme` block:

```css
  /* Source category colours */
  --color-gov-border:       #2d5060;
  --color-gov-bg:           #f2f6f8;
  --color-gov-badge-bg:     #dce8ed;
  --color-gov-badge-text:   #1a3a4a;
  --color-gov-badge-border: #b0c8d4;
  --color-civil-border:     #4a6070;
  --color-civil-bg:         #f0f4f7;
  --color-civil-badge-bg:   #e8f0f4;
  --color-civil-badge-text: #2d4a5a;
  --color-civil-badge-border: #b0ccd8;
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "Add gov/civil source category CSS variables"
```

---

### Task 3: Add `sourceCategory` to `TimelineItem` and `filterBySource`

**Files:**
- Modify: `src/lib/timeline.ts`
- Modify: `src/lib/timeline.test.ts`

- [ ] **Step 1: Write the failing tests**

Update `src/lib/timeline.test.ts` — replace the entire file:

```typescript
import { describe, it, expect } from "vitest";
import { filterByOrg, filterBySource, type TimelineItem } from "./timeline";
import type { SourceCategory } from "./sourceCategory";

function make(id: string, orgIds: string[], sourceCategory: SourceCategory = "government"): TimelineItem {
  return {
    id,
    kind: "event",
    title: id,
    date: "2026-01-01",
    tags: [],
    href: "#",
    badge: "Event",
    orgIds,
    orgs: [],
    links: [],
    sourceCategory,
  };
}

describe("filterByOrg", () => {
  const items: TimelineItem[] = [
    make("a", ["senate"]),
    make("b", ["senate", "indu"]),
    make("c", ["cigi"]),
  ];

  it("returns all items when orgId is null", () => {
    expect(filterByOrg(items, null)).toEqual(items);
  });

  it("returns [] when orgId is unknown", () => {
    expect(filterByOrg(items, "nope")).toEqual([]);
  });

  it("matches items whose orgIds includes the selected org (multi-org item)", () => {
    const result = filterByOrg(items, "indu");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("returns [] for empty input", () => {
    expect(filterByOrg([], "senate")).toEqual([]);
  });
});

describe("filterBySource", () => {
  const items: TimelineItem[] = [
    make("a", [], "government"),
    make("b", [], "civil_society"),
    make("c", [], "government"),
  ];

  it("returns all items when 'all' is selected", () => {
    expect(filterBySource(items, "all")).toEqual(items);
  });

  it("returns only government items", () => {
    const result = filterBySource(items, "government");
    expect(result.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("returns only civil_society items", () => {
    const result = filterBySource(items, "civil_society");
    expect(result.map((i) => i.id)).toEqual(["b"]);
  });

  it("returns [] for empty input", () => {
    expect(filterBySource([], "government")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/lib/timeline.test.ts
```

Expected: FAIL — `filterBySource is not exported`, `sourceCategory` missing from type

- [ ] **Step 3: Update `timeline.ts`**

Replace the entire file:

```typescript
import type { SourceCategory } from "./sourceCategory";

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
  sourceCategory: SourceCategory;
};

export type OrgOption = {
  id: string;
  label: string; // short_name ?? name
  count: number; // pre-counted items referencing this org
};

export function filterByOrg(
  items: TimelineItem[],
  orgId: string | null,
): TimelineItem[] {
  if (!orgId) return items;
  return items.filter((i) => i.orgIds.includes(orgId));
}

export function filterBySource(
  items: TimelineItem[],
  sourceCategory: SourceCategory | "all",
): TimelineItem[] {
  if (sourceCategory === "all") return items;
  return items.filter((i) => i.sourceCategory === sourceCategory);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/lib/timeline.test.ts
```

Expected: 8 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/timeline.ts src/lib/timeline.test.ts
git commit -m "Add sourceCategory to TimelineItem; add filterBySource"
```

---

### Task 4: `SourceFilter` component

**Files:**
- Create: `src/components/SourceFilter.tsx`
- Create: `src/components/SourceFilter.test.tsx`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/components/SourceFilter.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceFilter from "./SourceFilter";

describe("SourceFilter", () => {
  it("renders All, Government, and Civil Society buttons", () => {
    render(<SourceFilter selected="all" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Government" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Civil Society" })).toBeInTheDocument();
  });

  it("sets aria-pressed='true' on the active button only", () => {
    render(<SourceFilter selected="government" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Government" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Civil Society" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelect with 'government' when Government is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(onSelect).toHaveBeenCalledWith("government");
  });

  it("calls onSelect with 'civil_society' when Civil Society is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Civil Society" }));
    expect(onSelect).toHaveBeenCalledWith("civil_society");
  });

  it("calls onSelect with 'all' when All is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="government" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith("all");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/SourceFilter.test.tsx
```

Expected: FAIL — `Cannot find module './SourceFilter'`

- [ ] **Step 3: Implement the component**

```tsx
// src/components/SourceFilter.tsx
import type { SourceCategory } from "../lib/sourceCategory";

type Props = {
  selected: SourceCategory | "all";
  onSelect: (cat: SourceCategory | "all") => void;
};

export default function SourceFilter({ selected, onSelect }: Props) {
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active = "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

  return (
    <div role="group" aria-label="Filter by source" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selected === "all"}
        className={`${pillBase} ${selected === "all" ? active : inactive}`}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      <button
        type="button"
        aria-pressed={selected === "government"}
        className={`${pillBase} ${selected === "government" ? active : inactive}`}
        onClick={() => onSelect("government")}
      >
        Government
      </button>
      <button
        type="button"
        aria-pressed={selected === "civil_society"}
        className={`${pillBase} ${selected === "civil_society" ? active : inactive}`}
        onClick={() => onSelect("civil_society")}
      >
        Civil Society
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/components/SourceFilter.test.tsx
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/SourceFilter.tsx src/components/SourceFilter.test.tsx
git commit -m "Add SourceFilter component with tests"
```

---

### Task 5: Update `TimelineList` — coloured dot + source badge

**Files:**
- Modify: `src/components/TimelineList.tsx`
- Modify: `src/components/TimelineList.test.tsx`

- [ ] **Step 1: Add failing tests**

Add these two cases to the existing `describe("TimelineList")` block in `src/components/TimelineList.test.tsx`. First, update `baseItem` to include `sourceCategory`, then add the new tests.

Replace the entire file:

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
  sourceCategory: "government",
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
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).not.toContain("https://example.com/hansard");
  });

  it("renders an empty-state message when items list is empty", () => {
    render(<TimelineList items={[]} />);
    expect(screen.getByText("No items match this filter.")).toBeInTheDocument();
  });

  it("renders GOVERNMENT badge for government items", () => {
    render(<TimelineList items={[{ ...baseItem, sourceCategory: "government" }]} />);
    expect(screen.getByText("GOVERNMENT")).toBeInTheDocument();
  });

  it("renders CIVIL SOCIETY badge for civil_society items", () => {
    render(<TimelineList items={[{ ...baseItem, sourceCategory: "civil_society" }]} />);
    expect(screen.getByText("CIVIL SOCIETY")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm badge tests fail**

```bash
npx vitest run src/components/TimelineList.test.tsx
```

Expected: 4 pass, 2 fail — badge text not found

- [ ] **Step 3: Update `TimelineList.tsx`**

Replace the entire file:

```tsx
// src/components/TimelineList.tsx
import type { TimelineItem } from "../lib/timeline";
import { fmtDate } from "../lib/format";

type Props = {
  items: TimelineItem[];
};

function DocumentIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2h6l4 4v8H2V2h2z" />
      <path d="M10 2v4h4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <polygon points="6.5,5.5 11.5,8 6.5,10.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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

const sourceBadge = {
  government: {
    label: "GOVERNMENT",
    style: {
      background: "var(--color-gov-badge-bg)",
      color: "var(--color-gov-badge-text)",
      border: "1px solid var(--color-gov-badge-border)",
    },
  },
  civil_society: {
    label: "CIVIL SOCIETY",
    style: {
      background: "var(--color-civil-badge-bg)",
      color: "var(--color-civil-badge-text)",
      border: "1px solid var(--color-civil-badge-border)",
    },
  },
} as const;

const dotColor = {
  government: "var(--color-gov-border)",
  civil_society: "var(--color-civil-border)",
} as const;

export default function TimelineList({ items }: Props) {
  if (items.length === 0) {
    return <p className="mt-10 text-muted">No items match this filter.</p>;
  }

  return (
    <ol aria-label="Timeline" className="mt-8 border-l-2 border-accent">
      {items.map((item) => {
        const badge = sourceBadge[item.sourceCategory];
        return (
          <li key={item.id} className="relative pl-7 pb-8">
            <span
              className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full ring-2 ring-body"
              style={{ background: dotColor[item.sourceCategory] }}
            />
            <time dateTime={item.date} className="block text-xs text-faint font-medium mb-1">
              {fmtDate(item.date)}
            </time>
            <h2 className="font-serif text-base font-semibold text-header leading-snug mb-2">
              <a href={item.href} className="hover:text-accent-dark no-underline">
                {item.title}
              </a>
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-2 items-center">
              <span className="chip-type">{item.badge}</span>
              {item.orgs.map((org) => (
                <a key={org.id} href={`/orgs/${org.id}/`} className="chip-org">
                  {org.label}
                </a>
              ))}
              <span
                className="text-xs font-bold rounded-full px-2 py-0.5"
                style={badge.style}
              >
                {badge.label}
              </span>
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
                    key={`${link.url}-${link.label}`}
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
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 4: Run tests to confirm all pass**

```bash
npx vitest run src/components/TimelineList.test.tsx
```

Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/TimelineList.tsx src/components/TimelineList.test.tsx
git commit -m "Add coloured dot and source badge to TimelineList"
```

---

### Task 6: Wire source filter into the Timeline page

**Files:**
- Modify: `src/components/TimelineWithFilter.tsx`
- Modify: `src/pages/timeline/index.astro`

No new unit tests needed — the components being composed are already tested. Verify in browser after wiring.

- [ ] **Step 1: Update `TimelineWithFilter.tsx`**

Replace the entire file:

```tsx
// src/components/TimelineWithFilter.tsx
import { useState, useEffect, useMemo } from "react";
import type { TimelineItem, OrgOption } from "../lib/timeline";
import { filterByOrg, filterBySource } from "../lib/timeline";
import type { SourceCategory } from "../lib/sourceCategory";
import OrgFilter from "./OrgFilter";
import SourceFilter from "./SourceFilter";
import TimelineList from "./TimelineList";

type Props = {
  items: TimelineItem[];
  orgs: OrgOption[];
};

export default function TimelineWithFilter({ items, orgs }: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceCategory | "all">("all");

  useEffect(() => {
    function resolveOrg(): string | null {
      const params = new URLSearchParams(window.location.search);
      const org = params.get("org");
      return org && orgs.some((o) => o.id === org) ? org : null;
    }

    const initial = resolveOrg();
    setSelectedOrgId(initial);
    const raw = new URLSearchParams(window.location.search).get("org");
    if (raw && !initial) {
      history.replaceState({}, "", window.location.pathname);
    }

    function onPopState() {
      setSelectedOrgId(resolveOrg());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [orgs]);

  function handleSelectOrg(orgId: string | null) {
    setSelectedOrgId(orgId);
    const url = orgId !== null ? "?org=" + orgId : window.location.pathname;
    history.pushState({}, "", url);
  }

  const filteredItems = useMemo(
    () => filterBySource(filterByOrg(items, selectedOrgId), selectedSource),
    [items, selectedOrgId, selectedSource],
  );

  return (
    <>
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Source</p>
          <SourceFilter selected={selectedSource} onSelect={setSelectedSource} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Organization</p>
          <OrgFilter orgs={orgs} selected={selectedOrgId} onSelect={handleSelectOrg} />
        </div>
      </div>
      <TimelineList items={filteredItems} />
    </>
  );
}
```

- [ ] **Step 2: Update `src/pages/timeline/index.astro`**

Replace the entire file:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import TimelineWithFilter from "../../components/TimelineWithFilter";
import type { TimelineItem, OrgOption } from "../../lib/timeline";
import { getSourceCategory } from "../../lib/sourceCategory";

const events = await getCollection("events");
const organizations = await getCollection("organizations");

const orgMap = new Map<string, { name: string; short_name?: string; schema_type: string }>();
for (const org of organizations) {
  orgMap.set(org.id, {
    name: org.data.name,
    short_name: org.data.short_name,
    schema_type: org.data.schema_type,
  });
}

const items: TimelineItem[] = events
  .map((e) => {
    const orgSchemaTypes = e.data.organizations
      .map((o) => orgMap.get(o.id.id)?.schema_type ?? "Organization");
    return {
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
      sourceCategory: getSourceCategory(orgSchemaTypes),
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const orgCounts = new Map<string, number>();
for (const item of items) {
  for (const orgId of item.orgIds) {
    orgCounts.set(orgId, (orgCounts.get(orgId) ?? 0) + 1);
  }
}

const orgs: OrgOption[] = [];
for (const [orgId, count] of orgCounts.entries()) {
  const org = orgMap.get(orgId);
  if (!org) continue;
  orgs.push({
    id: orgId,
    label: org.short_name ?? org.name,
    count,
  });
}
orgs.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
---

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

- [ ] **Step 3: Build and verify in browser**

```bash
npm run build && npx astro preview --port 4321
```

Open http://localhost:4321/timeline/ and verify:
- Source filter row appears above Organization filter row, both labelled
- Items have coloured spine dots (darker for Government, lighter for Civil Society)
- Each item has a GOVERNMENT or CIVIL SOCIETY badge inline with chips
- Selecting "Government" hides civil society items; "Civil Society" hides government items
- Both filters work simultaneously (e.g. "Government" + "ISED" narrows correctly)

- [ ] **Step 4: Commit**

```bash
git add src/components/TimelineWithFilter.tsx src/pages/timeline/index.astro
git commit -m "Wire source filter into Timeline page"
```

---

### Task 7: `PolicyWithSourceFilter` component

**Files:**
- Create: `src/components/PolicyWithSourceFilter.tsx`
- Create: `src/components/PolicyWithSourceFilter.test.tsx`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/components/PolicyWithSourceFilter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PolicyWithSourceFilter from "./PolicyWithSourceFilter";
import type { ArtifactEntry } from "./PolicyWithSourceFilter";

const govArtifact: ArtifactEntry = {
  id: "bill-c27-aida",
  type: "Legislation",
  title: "Bill C-27",
  publishedDate: "2022-06-16",
  sourceCategory: "government",
};

const civilArtifact: ArtifactEntry = {
  id: "aigs-governing-ai-2023",
  type: "WhitePaper",
  title: "Governing AI: A Plan for Canada",
  publishedDate: "2023-10-18",
  sourceCategory: "civil_society",
};

describe("PolicyWithSourceFilter", () => {
  it("renders all artifacts when 'All' is selected", () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    expect(screen.getByText("Bill C-27")).toBeInTheDocument();
    expect(screen.getByText("Governing AI: A Plan for Canada")).toBeInTheDocument();
  });

  it("shows only government artifacts after clicking Government", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(screen.getByText("Bill C-27")).toBeInTheDocument();
    expect(screen.queryByText("Governing AI: A Plan for Canada")).not.toBeInTheDocument();
  });

  it("shows only civil society artifacts after clicking Civil Society", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Civil Society" }));
    expect(screen.queryByText("Bill C-27")).not.toBeInTheDocument();
    expect(screen.getByText("Governing AI: A Plan for Canada")).toBeInTheDocument();
  });

  it("renders GOVERNMENT badge on government card", () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact]} />);
    expect(screen.getByText("GOVERNMENT")).toBeInTheDocument();
  });

  it("renders CIVIL SOCIETY badge on civil society card", () => {
    render(<PolicyWithSourceFilter artifacts={[civilArtifact]} />);
    expect(screen.getByText("CIVIL SOCIETY")).toBeInTheDocument();
  });

  it("hides a section heading when all its items are filtered out", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(screen.queryByText("White Papers")).not.toBeInTheDocument();
    expect(screen.getByText("Legislation")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/PolicyWithSourceFilter.test.tsx
```

Expected: FAIL — `Cannot find module './PolicyWithSourceFilter'`

- [ ] **Step 3: Implement the component**

```tsx
// src/components/PolicyWithSourceFilter.tsx
import { useState, useMemo } from "react";
import type { SourceCategory } from "../lib/sourceCategory";
import SourceFilter from "./SourceFilter";
import { fmtDate } from "../lib/format";
import { badgeClass, statusLabel } from "../lib/legislation";

export type ArtifactEntry = {
  id: string;
  type:
    | "GovernmentProgram"
    | "JointStatement"
    | "Legislation"
    | "PolicyDocument"
    | "Report"
    | "WhitePaper";
  title: string;
  publishedDate: string; // ISO string
  description?: string;
  lifecycleStatus?: string;
  currentStage?: string;
  sourceCategory: SourceCategory;
};

type Props = {
  artifacts: ArtifactEntry[];
};

const SECTIONS: {
  type: ArtifactEntry["type"];
  heading: string;
  description: string;
}[] = [
  {
    type: "Legislation",
    heading: "Legislation",
    description:
      "Canadian federal bills and acts related to artificial intelligence. Each entry tracks the bill's lifecycle — from introduction through readings, committee study, and royal assent (or death on the order paper).",
  },
  {
    type: "PolicyDocument",
    heading: "Policy Documents",
    description:
      "Voluntary codes of conduct, frameworks, and guidelines issued by government or industry bodies.",
  },
  {
    type: "GovernmentProgram",
    heading: "Government Programs",
    description:
      "Ongoing federal programs and national strategies related to artificial intelligence.",
  },
  {
    type: "JointStatement",
    heading: "Joint Statements",
    description:
      "Bilateral and multilateral statements on AI governance issued jointly by Canada and partner governments.",
  },
  {
    type: "Report",
    heading: "Reports",
    description:
      "Research reports and analytical summaries published by think tanks, government agencies, and advisory bodies.",
  },
  {
    type: "WhitePaper",
    heading: "White Papers",
    description:
      "Position and advocacy papers published by think tanks and civil society organizations making the case for specific AI policy approaches.",
  },
];

const cardStyle = {
  government: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-gov-border)",
    background: "var(--color-gov-bg)",
  },
  civil_society: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-civil-border)",
    background: "var(--color-civil-bg)",
  },
} as const;

const badgeStyle = {
  government: {
    label: "GOVERNMENT",
    style: {
      background: "var(--color-gov-badge-bg)",
      color: "var(--color-gov-badge-text)",
      border: "1px solid var(--color-gov-badge-border)",
    },
  },
  civil_society: {
    label: "CIVIL SOCIETY",
    style: {
      background: "var(--color-civil-badge-bg)",
      color: "var(--color-civil-badge-text)",
      border: "1px solid var(--color-civil-badge-border)",
    },
  },
} as const;

export default function PolicyWithSourceFilter({ artifacts }: Props) {
  const [selectedSource, setSelectedSource] = useState<SourceCategory | "all">("all");

  const filtered = useMemo(
    () =>
      selectedSource === "all"
        ? artifacts
        : artifacts.filter((a) => a.sourceCategory === selectedSource),
    [artifacts, selectedSource],
  );

  return (
    <div>
      <div className="mt-6">
        <SourceFilter selected={selectedSource} onSelect={setSelectedSource} />
      </div>

      {SECTIONS.map(({ type, heading, description }) => {
        const items = filtered.filter((a) => a.type === type);
        if (items.length === 0) return null;
        return (
          <section key={type} className="mt-10">
            <h2 className="font-display text-2xl text-header">{heading}</h2>
            <p className="mt-2 max-w-2xl text-muted">{description}</p>
            <div className="mt-6 space-y-4">
              {items.map((artifact) => {
                const src = badgeStyle[artifact.sourceCategory];
                return (
                  <a
                    key={artifact.id}
                    href={`/artifacts/${artifact.id}/`}
                    className="block rounded-r-lg p-5 hover:shadow-sm transition-all no-underline"
                    style={cardStyle[artifact.sourceCategory]}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-header">{artifact.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {artifact.type === "Legislation" && artifact.lifecycleStatus && (
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass(artifact.lifecycleStatus as Parameters<typeof badgeClass>[0])}`}>
                            {statusLabel(artifact.lifecycleStatus as Parameters<typeof statusLabel>[0])}
                          </span>
                        )}
                        <span
                          className="text-xs font-bold rounded-full px-2 py-0.5"
                          style={src.style}
                        >
                          {src.label}
                        </span>
                      </div>
                    </div>
                    {artifact.type === "Legislation" && artifact.currentStage && (
                      <p className="mt-2 text-sm text-muted">{artifact.currentStage}</p>
                    )}
                    {artifact.description && (
                      <p className="mt-2 text-sm text-muted">{artifact.description}</p>
                    )}
                    <p className="mt-2 text-xs text-faint">
                      {artifact.type === "Legislation" ? "Introduced" : "Published"}:{" "}
                      {fmtDate(artifact.publishedDate)}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/components/PolicyWithSourceFilter.test.tsx
```

Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/PolicyWithSourceFilter.tsx src/components/PolicyWithSourceFilter.test.tsx
git commit -m "Add PolicyWithSourceFilter component with tests"
```

---

### Task 8: Wire `PolicyWithSourceFilter` into the Policy page

**Files:**
- Modify: `src/pages/policy/index.astro`

- [ ] **Step 1: Replace `src/pages/policy/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import PolicyWithSourceFilter from "../../components/PolicyWithSourceFilter";
import type { ArtifactEntry } from "../../components/PolicyWithSourceFilter";
import { getSourceCategory } from "../../lib/sourceCategory";

const artifactCollection = await getCollection("artifacts");
const organizations = await getCollection("organizations");

const orgSchemaTypeMap = new Map<string, string>();
for (const org of organizations) {
  orgSchemaTypeMap.set(org.id, org.data.schema_type);
}

const artifacts: ArtifactEntry[] = artifactCollection
  .map((a) => {
    const orgSchemaTypes = a.data.organizations.map(
      (o) => orgSchemaTypeMap.get(o.id.id) ?? "Organization",
    );
    return {
      id: a.id,
      type: a.data.type,
      title: a.data.title,
      publishedDate: a.data.published_date.toISOString(),
      description: a.data.description,
      lifecycleStatus: a.data.lifecycle_status,
      currentStage: a.data.current_stage,
      sourceCategory: getSourceCategory(orgSchemaTypes),
    };
  })
  .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
---

<BaseLayout
  title="Policy"
  description="Canadian AI legislation, reports, policy documents, and government programs."
>
  <h1 class="font-display text-4xl text-header">Policy</h1>
  <PolicyWithSourceFilter client:load artifacts={artifacts} />
</BaseLayout>
```

- [ ] **Step 2: Build and verify in browser**

```bash
npm run build && npx astro preview --port 4321
```

Open http://localhost:4321/policy/ and verify:
- Source filter pills appear at the top (All / Government / Civil Society)
- All six section types render correctly under "All"
- Government cards have a darker blue-grey left border and badge
- Civil society cards have a lighter blue-grey left border and badge
- "Government" filter shows: Legislation, Policy Documents, Government Programs, Joint Statements only
- "Civil Society" filter shows: Reports, White Papers only (AIGS entries)
- Legislation cards still show their lifecycle status badge alongside the source badge

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/policy/index.astro
git commit -m "Wire PolicyWithSourceFilter into Policy page (closes #60)"
```

---

### Task 9: Push branch and open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feature/source-category-filter
```

- [ ] **Step 2: Open PR via GitHub API**

```bash
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jrhender/ai-governance-tracker/pulls \
  -d '{
    "title": "Add source category filter (gov vs civil society) to Policy and Timeline pages",
    "body": "## Summary\n\n- Derives Government / Civil Society category from linked org `schema_type` at build time — no new YAML fields\n- Policy page: coloured left border + source badge per card, filter pills to show/hide by category\n- Timeline page: coloured spine dot + inline badge per entry, stacked Source + Organization filter rows\n- New `SourceFilter` component shared across both pages\n- Artifact schema now enforces `organizations.min(1)`\n- Fixed two events missing org links; added PCO as co-host to CIGI report\n\n**Spec:** `docs/superpowers/specs/2026-05-20-source-category-filter-design.md`\n\n**Closes #60**\n\n## Test plan\n\n- [ ] `npm test` passes\n- [ ] Policy page: All / Government / Civil Society filter works; cards colour-coded correctly\n- [ ] Timeline page: stacked filters work independently and together; dots and badges render correctly\n- [ ] Legislation cards retain lifecycle status badge alongside source badge",
    "head": "feature/source-category-filter",
    "base": "main"
  }'
```

Note the PR number from the response for the code review step.

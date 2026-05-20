# Org Country Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required `country` field to org data and a client-side country filter (defaulting to Canada) to the Organizations page.

**Architecture:** Add `country: z.enum(["ca", "uk"])` to the organizations schema, update all 6 YAML files, then replace the static grid in `orgs/index.astro` with a new React island `OrgsWithCountryFilter` that owns filter state and derives available country pills from its props.

**Tech Stack:** Astro 5, React 19, Vitest 4 + Testing Library, happy-dom, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-05-19-org-country-filter-design.md`

---

### Task 1: Add `country` to the organizations schema and all YAML files

**Files:**
- Modify: `src/content.config.ts:135-147`
- Modify: `data/organizations/aigs-canada.yaml`
- Modify: `data/organizations/cigi-global-ai-risks-initiative.yaml`
- Modify: `data/organizations/dsit-uk.yaml`
- Modify: `data/organizations/house-of-commons-indu-committee.yaml`
- Modify: `data/organizations/ised-canada.yaml`
- Modify: `data/organizations/privy-council-office-canada.yaml`

- [ ] **Step 1: Add `country` to the organizations schema**

In `src/content.config.ts`, update the `organizations` collection schema to add a required `country` enum field. Change the `organizations` schema block (starting around line 135) to:

```ts
const organizations = defineCollection({
  loader: yamlGlob({ pattern: "*.yaml", base: dataDir("organizations") }),
  schema: z.object({
    id: z.string(),
    type: z.string(),
    schema_type: z.enum(["Organization", "GovernmentOrganization"]),
    name: z.string(),
    short_name: z.string().optional(),
    url: z.string().url().optional(),
    wikipedia: z.string().url().optional(),
    country: z.enum(["ca", "uk"]),
    tags: z.array(z.string()).default([]),
  }),
});
```

- [ ] **Step 2: Add `country: ca` to Canadian org YAML files**

Add `country: ca` to each of the following files (after the `schema_type` line is a natural place):

`data/organizations/aigs-canada.yaml` — add `country: ca`
`data/organizations/cigi-global-ai-risks-initiative.yaml` — add `country: ca`
`data/organizations/house-of-commons-indu-committee.yaml` — add `country: ca`
`data/organizations/ised-canada.yaml` — add `country: ca`
`data/organizations/privy-council-office-canada.yaml` — add `country: ca`

Example result for `aigs-canada.yaml`:
```yaml
id: aigs-canada
type: Organization
schema_type: Organization
country: ca

name: "AI Governance and Safety Canada"
```

- [ ] **Step 3: Add `country: uk` to `dsit-uk.yaml`**

```yaml
id: dsit-uk
type: GovernmentOrganization
schema_type: GovernmentOrganization
country: uk

name: "Department for Science, Innovation and Technology"
```

- [ ] **Step 4: Verify the build passes**

```bash
npm run build
```

Expected: build completes without errors. If any org YAML is missing `country`, the build will fail with a Zod validation error naming the offending file — fix it.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts data/organizations/
git commit -m "Add required country field to organizations schema and data"
```

---

### Task 2: Write failing tests for `OrgsWithCountryFilter`

**Files:**
- Create: `src/components/OrgsWithCountryFilter.test.tsx`

- [ ] **Step 1: Create the test file**

Create `src/components/OrgsWithCountryFilter.test.tsx` with the following content:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrgsWithCountryFilter from "./OrgsWithCountryFilter";

const orgs = [
  {
    id: "aigs-canada",
    name: "AI Governance and Safety Canada",
    short_name: "AIGS",
    country: "ca" as const,
    tags: ["think-tank"],
    events: 2,
    artifacts: 1,
  },
  {
    id: "dsit-uk",
    name: "Department for Science, Innovation and Technology",
    short_name: "DSIT",
    country: "uk" as const,
    tags: ["government"],
    events: 1,
    artifacts: 0,
  },
  {
    id: "ised-canada",
    name: "Innovation, Science and Economic Development Canada",
    short_name: "ISED",
    country: "ca" as const,
    tags: ["government"],
    events: 3,
    artifacts: 2,
  },
];

describe("OrgsWithCountryFilter", () => {
  it("defaults to Canada filter on mount — shows CA orgs, hides UK orgs", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByText("AIGS")).toBeInTheDocument();
    expect(screen.getByText("ISED")).toBeInTheDocument();
    expect(screen.queryByText("DSIT")).not.toBeInTheDocument();
  });

  it("shows all orgs when All pill is clicked", async () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("AIGS")).toBeInTheDocument();
    expect(screen.getByText("DSIT")).toBeInTheDocument();
    expect(screen.getByText("ISED")).toBeInTheDocument();
  });

  it("filters to UK orgs when UK pill is clicked", async () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    await userEvent.click(screen.getByRole("button", { name: "UK" }));
    expect(screen.queryByText("AIGS")).not.toBeInTheDocument();
    expect(screen.queryByText("ISED")).not.toBeInTheDocument();
    expect(screen.getByText("DSIT")).toBeInTheDocument();
  });

  it("derives country pill labels from data", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByRole("button", { name: "Canada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UK" })).toBeInTheDocument();
  });

  it("marks the active country pill with aria-pressed=true", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByRole("button", { name: "Canada" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "UK" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows country label on each org card", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    // Two CA orgs visible by default; both should show "Canada"
    expect(screen.getAllByText("Canada").length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
npm test -- OrgsWithCountryFilter
```

Expected: all tests FAIL with something like `Cannot find module './OrgsWithCountryFilter'`. This confirms the tests are wired up correctly before the implementation exists.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/components/OrgsWithCountryFilter.test.tsx
git commit -m "Add failing tests for OrgsWithCountryFilter"
```

---

### Task 3: Implement `OrgsWithCountryFilter`

**Files:**
- Create: `src/components/OrgsWithCountryFilter.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/OrgsWithCountryFilter.tsx`:

```tsx
import { useState, useMemo } from "react";

const COUNTRY_LABELS: Record<string, string> = { ca: "Canada", uk: "UK" };

export type OrgEntry = {
  id: string;
  name: string;
  short_name?: string;
  country: "ca" | "uk";
  tags: string[];
  events: number;
  artifacts: number;
};

type Props = {
  orgs: OrgEntry[];
};

export default function OrgsWithCountryFilter({ orgs }: Props) {
  const [selected, setSelected] = useState<string | null>("ca");

  const countries = useMemo(
    () => [...new Set(orgs.map((o) => o.country))].sort(),
    [orgs],
  );

  const filtered = useMemo(
    () => (selected === null ? orgs : orgs.filter((o) => o.country === selected)),
    [orgs, selected],
  );

  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active = "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by country"
        className="flex flex-wrap gap-2 mb-6"
      >
        <button
          type="button"
          aria-pressed={selected === null}
          className={`${pillBase} ${selected === null ? active : inactive}`}
          onClick={() => setSelected(null)}
        >
          All
        </button>
        {countries.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={selected === code}
            className={`${pillBase} ${selected === code ? active : inactive}`}
            onClick={() => setSelected(code)}
          >
            {COUNTRY_LABELS[code] ?? code.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-faint">No organizations found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((org) => (
            <a
              key={org.id}
              href={`/orgs/${org.id}/`}
              className="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
            >
              {org.short_name && (
                <div className="text-base font-bold text-header">
                  {org.short_name}
                </div>
              )}
              <div
                className={`text-sm text-muted ${org.short_name ? "mt-0.5" : "font-semibold text-base text-header"}`}
              >
                {org.name}
              </div>
              <div className="mt-1 text-xs text-faint">
                {COUNTRY_LABELS[org.country] ?? org.country.toUpperCase()}
              </div>
              <div className="mt-3 text-xs text-faint">
                {[
                  org.events > 0 &&
                    `${org.events} event${org.events === 1 ? "" : "s"}`,
                  org.artifacts > 0 &&
                    `${org.artifacts} artifact${org.artifacts === 1 ? "" : "s"}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No events yet"}
              </div>
              {org.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {org.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run the tests and verify they all pass**

```bash
npm test -- OrgsWithCountryFilter
```

Expected: 6 tests PASS. If any fail, check that:
- `short_name` is rendered in its own `<div>` (tests query by text content of `AIGS`, `DSIT`, `ISED`)
- The country label appears in a separate element below the org name
- `aria-pressed` is set as a string `"true"` / `"false"` (React does this automatically for boolean props on `<button>`)

- [ ] **Step 3: Commit**

```bash
git add src/components/OrgsWithCountryFilter.tsx
git commit -m "Implement OrgsWithCountryFilter React island with country filter pills"
```

---

### Task 4: Wire up the orgs index page

**Files:**
- Modify: `src/pages/orgs/index.astro`

- [ ] **Step 1: Replace the static grid with the React island**

Replace the entire content of `src/pages/orgs/index.astro` with:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import OrgsWithCountryFilter from "../../components/OrgsWithCountryFilter";
import type { OrgEntry } from "../../components/OrgsWithCountryFilter";

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

const orgEntries: OrgEntry[] = [...orgs]
  .sort((a, b) => a.data.name.localeCompare(b.data.name))
  .map((org) => ({
    id: org.id,
    name: org.data.name,
    short_name: org.data.short_name,
    country: org.data.country,
    tags: org.data.tags,
    events: eventCounts.get(org.id) ?? 0,
    artifacts: artifactCounts.get(org.id) ?? 0,
  }));
---

<BaseLayout
  title="Organizations"
  description="Think tanks, government bodies, and advocacy groups tracked in this database."
>
  <h1 class="font-display text-4xl text-header">Organizations</h1>
  <p class="mt-2 max-w-2xl text-muted">
    Think tanks, government bodies, and advocacy groups tracked in this database.
  </p>

  {orgEntries.length === 0 ? (
    <p class="mt-10 text-faint">No organizations tracked yet.</p>
  ) : (
    <div class="mt-10">
      <OrgsWithCountryFilter client:load orgs={orgEntries} />
    </div>
  )}
</BaseLayout>
```

- [ ] **Step 2: Run the full build**

```bash
npm run build
```

Expected: build completes without TypeScript or Astro errors.

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```

Expected: all tests pass including the new `OrgsWithCountryFilter` tests.

- [ ] **Step 4: Commit**

```bash
git add src/pages/orgs/index.astro
git commit -m "Wire OrgsWithCountryFilter island into orgs index page"
```

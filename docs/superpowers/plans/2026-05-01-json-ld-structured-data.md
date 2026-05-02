# JSON-LD Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emit `<script type="application/ld+json">` blocks on the three detail page types (events, artifacts, organizations) using schema.org types already stored in the data model.

**Architecture:** Pure builder functions in `src/lib/jsonld.ts` accept plain data objects and return JSON-LD POJOs; detail pages call these in their frontmatter and pass the result to `BaseLayout` via a new `jsonLd` prop; `BaseLayout` serializes and injects the script tag in `<head>`. This keeps schema logic testable with Vitest (no Astro runtime needed) and keeps templates thin.

**Tech Stack:** Astro 5, Vitest 4, TypeScript

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/jsonld.ts` | Builder functions for each schema type |
| Create | `src/lib/jsonld.test.ts` | Vitest unit tests for all builders |
| Modify | `src/layouts/BaseLayout.astro:3–11` | Accept `jsonLd?: Record<string, unknown>` prop, emit `<script>` in `<head>` |
| Modify | `src/pages/events/[id].astro:14–28` | Compute `canonicalURL`, call `buildEventJsonLd`, pass to `BaseLayout` |
| Modify | `src/pages/artifacts/[id].astro:14–37` | Compute `canonicalURL`, call `buildCreativeWorkJsonLd`, pass to `BaseLayout` |
| Modify | `src/pages/orgs/[id].astro:13–25` | Compute `canonicalURL`, call `buildOrgJsonLd`, pass to `BaseLayout` |

---

### Task 1: Write failing tests for `jsonld.ts` helpers

**Files:**
- Create: `src/lib/jsonld.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/jsonld.test.ts
import { describe, it, expect } from "vitest";
import { buildEventJsonLd, buildCreativeWorkJsonLd, buildOrgJsonLd } from "./jsonld";

describe("buildEventJsonLd", () => {
  it("sets context, type, name, startDate, url", () => {
    const result = buildEventJsonLd({
      title: "Test Event",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/test/",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Event");
    expect(result.name).toBe("Test Event");
    expect(result.startDate).toBe("2023-01-01T00:00:00.000Z");
    expect(result.url).toBe("https://ai-governance-tracker.com/events/test/");
  });

  it("omits description when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("description" in result).toBe(false);
  });

  it("includes description when provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      description: "A test event",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.description).toBe("A test event");
  });

  it("omits location when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("location" in result).toBe(false);
  });

  it("includes location as Place when provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      location: "Ottawa, ON",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.location).toEqual({ "@type": "Place", name: "Ottawa, ON" });
  });

  it("includes organizer array from orgs", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "Senate of Canada", url: "https://senate.ca" }],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.organizer).toEqual([
      { "@type": "Organization", name: "Senate of Canada", url: "https://senate.ca" },
    ]);
  });

  it("omits url from organizer entry when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "Senate of Canada" }],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    const organizer = result.organizer as Array<Record<string, unknown>>;
    expect("url" in organizer[0]).toBe(false);
  });

  it("omits organizer key when orgs is empty", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("organizer" in result).toBe(false);
  });
});

describe("buildCreativeWorkJsonLd", () => {
  it("sets context, type, name, datePublished, url", () => {
    const result = buildCreativeWorkJsonLd({
      title: "Test Report",
      datePublished: "2023-06-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/test/",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("CreativeWork");
    expect(result.name).toBe("Test Report");
    expect(result.datePublished).toBe("2023-06-01T00:00:00.000Z");
    expect(result.url).toBe("https://ai-governance-tracker.com/artifacts/test/");
  });

  it("omits description when not provided", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect("description" in result).toBe(false);
  });

  it("includes description when provided", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      description: "A policy document",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect(result.description).toBe("A policy document");
  });

  it("includes author array from orgs", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "CIGI", url: "https://www.cigionline.org" }],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect(result.author).toEqual([
      { "@type": "Organization", name: "CIGI", url: "https://www.cigionline.org" },
    ]);
  });

  it("omits author key when orgs is empty", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect("author" in result).toBe(false);
  });
});

describe("buildOrgJsonLd", () => {
  it("sets context, type, name", () => {
    const result = buildOrgJsonLd({
      name: "Senate of Canada",
      schemaType: "GovernmentOrganization",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("GovernmentOrganization");
    expect(result.name).toBe("Senate of Canada");
  });

  it("omits url when not provided", () => {
    const result = buildOrgJsonLd({ name: "N", schemaType: "Organization" });
    expect("url" in result).toBe(false);
  });

  it("includes url when provided", () => {
    const result = buildOrgJsonLd({
      name: "CIGI",
      schemaType: "Organization",
      url: "https://www.cigionline.org",
    });
    expect(result.url).toBe("https://www.cigionline.org");
  });

  it("omits sameAs when not provided", () => {
    const result = buildOrgJsonLd({ name: "N", schemaType: "Organization" });
    expect("sameAs" in result).toBe(false);
  });

  it("includes sameAs when wikipedia provided", () => {
    const result = buildOrgJsonLd({
      name: "Senate",
      schemaType: "GovernmentOrganization",
      sameAs: "https://en.wikipedia.org/wiki/Senate_of_Canada",
    });
    expect(result.sameAs).toBe("https://en.wikipedia.org/wiki/Senate_of_Canada");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail (module not found)**

```bash
npx vitest run src/lib/jsonld.test.ts
```

Expected: FAIL — `Cannot find module './jsonld'`

---

### Task 2: Implement `src/lib/jsonld.ts`

**Files:**
- Create: `src/lib/jsonld.ts`

- [ ] **Step 1: Implement the module**

```typescript
// src/lib/jsonld.ts

export type OrgRef = { name: string; url?: string };

function orgEntry(o: OrgRef): Record<string, unknown> {
  const entry: Record<string, unknown> = { "@type": "Organization", name: o.name };
  if (o.url) entry.url = o.url;
  return entry;
}

export function buildEventJsonLd(params: {
  title: string;
  startDate: string;
  description?: string;
  location?: string;
  orgs: OrgRef[];
  url: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: params.title,
    startDate: params.startDate,
    url: params.url,
  };
  if (params.description) ld.description = params.description;
  if (params.location) ld.location = { "@type": "Place", name: params.location };
  if (params.orgs.length > 0) ld.organizer = params.orgs.map(orgEntry);
  return ld;
}

export function buildCreativeWorkJsonLd(params: {
  title: string;
  datePublished: string;
  description?: string;
  orgs: OrgRef[];
  url: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    datePublished: params.datePublished,
    url: params.url,
  };
  if (params.description) ld.description = params.description;
  if (params.orgs.length > 0) ld.author = params.orgs.map(orgEntry);
  return ld;
}

export function buildOrgJsonLd(params: {
  name: string;
  schemaType: string;
  url?: string;
  sameAs?: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": params.schemaType,
    name: params.name,
  };
  if (params.url) ld.url = params.url;
  if (params.sameAs) ld.sameAs = params.sameAs;
  return ld;
}
```

- [ ] **Step 2: Run tests to verify all pass**

```bash
npx vitest run src/lib/jsonld.test.ts
```

Expected: all 16 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/jsonld.ts src/lib/jsonld.test.ts
git commit -m "Add JSON-LD builder helpers with Vitest tests"
```

---

### Task 3: Update BaseLayout to emit JSON-LD in `<head>`

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add `jsonLd` prop and emit script tag**

Replace the `Props` interface and destructuring (lines 3–10) with:

```astro
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

const { title, description, ogImage, jsonLd } = Astro.props;
```

Then, inside `<head>`, after the `<link rel="canonical">` line (line 33), add:

```astro
{jsonLd && (
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
)}
```

The final `<head>` section around canonical + JSON-LD should look like:

```astro
<link rel="canonical" href={canonicalURL} />
{jsonLd && (
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
)}
<!-- Open Graph -->
```

- [ ] **Step 2: Verify the build compiles**

```bash
npx astro check
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add jsonLd prop to BaseLayout, emit script tag in head"
```

---

### Task 4: Wire event detail page

**Files:**
- Modify: `src/pages/events/[id].astro`

- [ ] **Step 1: Import helper and compute JSON-LD in frontmatter**

Add the import at the top of the frontmatter (after existing imports):

```typescript
import { buildEventJsonLd, type OrgRef } from "../../lib/jsonld";
```

After the `const relatedArtifacts = ...` block (after line 26), add:

```typescript
const canonicalURL = new URL(Astro.url.pathname, Astro.site).toString();

const orgRefs: OrgRef[] = orgs
  .filter(({ org }) => org !== undefined)
  .map(({ org }) => ({
    name: org!.data.short_name ?? org!.data.name,
    ...(org!.data.url ? { url: org!.data.url } : {}),
  }));

const jsonLd = buildEventJsonLd({
  title: data.title,
  startDate: data.date.toISOString(),
  description: data.description,
  location: data.location?.name,
  orgs: orgRefs,
  url: canonicalURL,
});
```

- [ ] **Step 2: Pass `jsonLd` to BaseLayout**

Change the `<BaseLayout>` opening tag from:

```astro
<BaseLayout title={data.title} description={data.description}>
```

to:

```astro
<BaseLayout title={data.title} description={data.description} jsonLd={jsonLd}>
```

- [ ] **Step 3: Verify build**

```bash
npx astro check
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/events/[id].astro
git commit -m "Emit JSON-LD structured data on event detail pages"
```

---

### Task 5: Wire artifact detail page

**Files:**
- Modify: `src/pages/artifacts/[id].astro`

- [ ] **Step 1: Import helper and compute JSON-LD in frontmatter**

Add the import after existing imports:

```typescript
import { buildCreativeWorkJsonLd, type OrgRef } from "../../lib/jsonld";
```

After the `statusLabels` block (after line 36), add:

```typescript
const canonicalURL = new URL(Astro.url.pathname, Astro.site).toString();

const orgRefs: OrgRef[] = orgs
  .filter(({ org }) => org !== undefined)
  .map(({ org }) => ({
    name: org!.data.short_name ?? org!.data.name,
    ...(org!.data.url ? { url: org!.data.url } : {}),
  }));

const jsonLd = buildCreativeWorkJsonLd({
  title: data.title,
  datePublished: data.published_date.toISOString(),
  description: data.description,
  orgs: orgRefs,
  url: canonicalURL,
});
```

- [ ] **Step 2: Pass `jsonLd` to BaseLayout**

Change the `<BaseLayout>` opening tag from:

```astro
<BaseLayout title={data.title} description={data.description}>
```

to:

```astro
<BaseLayout title={data.title} description={data.description} jsonLd={jsonLd}>
```

- [ ] **Step 3: Verify build**

```bash
npx astro check
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/artifacts/[id].astro
git commit -m "Emit JSON-LD structured data on artifact detail pages"
```

---

### Task 6: Wire organization detail page

**Files:**
- Modify: `src/pages/orgs/[id].astro`

- [ ] **Step 1: Import helper and compute JSON-LD in frontmatter**

Add the import after existing imports:

```typescript
import { buildOrgJsonLd } from "../../lib/jsonld";
```

After the `const artifacts = ...` filter (after line 24), add:

```typescript
const canonicalURL = new URL(Astro.url.pathname, Astro.site).toString();

const jsonLd = buildOrgJsonLd({
  name: data.name,
  schemaType: data.schema_type,
  url: data.url,
  sameAs: data.wikipedia,
});
```

- [ ] **Step 2: Pass `jsonLd` to BaseLayout**

Change the `<BaseLayout>` opening tag from:

```astro
<BaseLayout title={data.name} description={`Organization: ${data.name}`}>
```

to:

```astro
<BaseLayout title={data.name} description={`Organization: ${data.name}`} jsonLd={jsonLd}>
```

- [ ] **Step 3: Verify build**

```bash
npx astro check
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/orgs/[id].astro
git commit -m "Emit JSON-LD structured data on organization detail pages"
```

---

### Task 7: Full build and browser verification

**Files:** none (verification only)

- [ ] **Step 1: Run unit tests**

```bash
npx vitest run
```

Expected: all tests pass (no regressions)

- [ ] **Step 2: Build and start preview server**

```bash
npm run build && npx astro preview --port 4321 &
```

- [ ] **Step 3: Check JSON-LD on an event detail page**

Using Playwright MCP `browser_navigate` → `https://localhost:4321/events/pan-canadian-ai-strategy-phase-1-2017/`

Then use `browser_evaluate` to confirm the script tag is present and well-formed:

```javascript
const script = document.querySelector('script[type="application/ld+json"]');
return script ? JSON.parse(script.textContent) : null;
```

Expected: object with `@context: "https://schema.org"`, `@type: "Event"`, `name`, `startDate`, `url`.

- [ ] **Step 4: Check JSON-LD on an artifact detail page**

Navigate to `https://localhost:4321/artifacts/pan-canadian-ai-strategy/`

Run same `browser_evaluate` snippet.

Expected: `@type: "CreativeWork"`, `name`, `datePublished`, `url`.

- [ ] **Step 5: Check JSON-LD on an org detail page**

Navigate to `https://localhost:4321/orgs/house-of-commons-indu-committee/`

Run same `browser_evaluate` snippet.

Expected: `@type: "GovernmentOrganization"`, `name: "Standing Committee on Industry and Technology"`, `url`, `sameAs`.

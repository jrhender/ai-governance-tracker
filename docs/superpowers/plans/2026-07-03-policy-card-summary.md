# Policy Card Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the full artifact description on Policy page cards with a short hand-written `summary`, fixing issue #117's wall of text.

**Architecture:** A new optional `summary` field on the artifacts content collection flows through `src/pages/policy/index.astro` into `PolicyWithSourceFilter.tsx`, which renders it on the card. Artifacts without a summary fall back to the existing `leadText()` first-paragraph helper clamped to three lines. The artifact detail page keeps the full description.

**Tech Stack:** Astro content collections (zod schema), React + Vitest + Testing Library, Tailwind 4 (`line-clamp-3`), YAML data files.

**Spec:** `docs/superpowers/specs/2026-07-03-policy-card-summary-design.md`

## Global Constraints

- Summaries are 1–2 plain-text sentences, no markdown, ≤ 300 characters (enforced by `z.string().max(300)`).
- In YAML files, `summary` sits directly above `description`.
- Work happens on branch `feature/policy-card-summary`; merge to `main` via PR only (branch protection).
- Test commands: `pnpm test` (Vitest unit), `pnpm build` (validates content schema), `pnpm test:e2e` (Playwright).

---

### Task 1: Summary rendering in PolicyWithSourceFilter (schema + component + pass-through)

**Files:**
- Modify: `src/content.config.ts` (artifacts collection schema, ~line 76)
- Modify: `src/components/PolicyWithSourceFilter.tsx` (ArtifactEntry type ~line 22, card body ~line 150)
- Modify: `src/pages/policy/index.astro` (artifact mapping ~line 37)
- Test: `src/components/PolicyWithSourceFilter.test.tsx`

**Interfaces:**
- Consumes: `leadText(markdown: string): string` from `src/lib/format.ts` (exists).
- Produces: `ArtifactEntry.summary?: string`; artifacts schema accepts optional `summary` ≤ 300 chars. Task 2's YAML `summary:` fields validate against this schema.

- [ ] **Step 1: Write the failing tests**

Append inside the `describe("PolicyWithSourceFilter", ...)` block in `src/components/PolicyWithSourceFilter.test.tsx`:

```tsx
it("renders the summary instead of the description when a summary is present", () => {
  const withSummary: ArtifactEntry = {
    ...govArtifact,
    summary: "Canada's first proposed federal AI law.",
    description: "Part 3 of Bill C-27 contained AIDA.\n\nIt died on prorogation.",
  };
  render(<PolicyWithSourceFilter artifacts={[withSummary]} />);
  expect(screen.getByText("Canada's first proposed federal AI law.")).toBeInTheDocument();
  expect(screen.queryByText(/Part 3 of Bill C-27/)).not.toBeInTheDocument();
});

it("falls back to the description's first paragraph, clamped, when summary is absent", () => {
  const noSummary: ArtifactEntry = {
    ...govArtifact,
    description: "First paragraph text.\n\nSecond paragraph text.",
  };
  render(<PolicyWithSourceFilter artifacts={[noSummary]} />);
  const fallback = screen.getByText("First paragraph text.");
  expect(fallback).toHaveClass("line-clamp-3");
  expect(screen.queryByText(/Second paragraph text/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/components/PolicyWithSourceFilter.test.tsx`
Expected: the first new test FAILS (full description currently rendered, and `summary` is not in the `ArtifactEntry` type — TypeScript error is also acceptable evidence). The second FAILS on the `line-clamp-3` class assertion and on the second paragraph being visible.

- [ ] **Step 3: Implement**

In `src/content.config.ts`, in the `artifacts` collection schema, directly above `description`:

```ts
summary: z.string().max(300).optional(),
description: z.string().optional(),
```

In `src/components/PolicyWithSourceFilter.tsx`:

1. Add the import:

```tsx
import { fmtDate, leadText } from "../lib/format";
```

(replacing the existing `import { fmtDate } from "../lib/format";`)

2. Add `summary?: string;` to `ArtifactEntry` directly above `description?: string;`.

3. Replace the description paragraph:

```tsx
{artifact.description && (
  <p className="mt-2 text-sm text-muted">{artifact.description}</p>
)}
```

with:

```tsx
{artifact.summary ? (
  <p className="mt-2 text-sm text-muted">{artifact.summary}</p>
) : artifact.description ? (
  <p className="mt-2 text-sm text-muted line-clamp-3">
    {leadText(artifact.description)}
  </p>
) : null}
```

In `src/pages/policy/index.astro`, add to the returned object in the `.map()` (below `description`):

```ts
summary: a.data.summary,
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all unit tests PASS (the two new ones plus all pre-existing).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/components/PolicyWithSourceFilter.tsx src/components/PolicyWithSourceFilter.test.tsx src/pages/policy/index.astro
git commit -m "Show summary on policy cards, clamped lead paragraph as fallback (#117)"
```

---

### Task 2: Write summaries for all 23 artifacts

**Files:**
- Modify: every file in `data/artifacts/` (23 YAML files)

**Interfaces:**
- Consumes: the `summary: z.string().max(300).optional()` schema from Task 1.
- Produces: card-ready `summary` values rendered by Task 1's component.

- [ ] **Step 1: Add `summary` to each YAML file, directly above `description`**

Use exactly these values (each is a quoted single-line YAML string):

`2017-03-22-pan-canadian-ai-strategy.yaml`:
```yaml
summary: "Federal funding program from Budget 2017 that made Canada an early mover in national AI strategy — administered by CIFAR and funding the Vector Institute, Mila, and Amii to build research talent."
```

`2021-04-19-scc-ai-program.yaml`:
```yaml
summary: "The Standards Council of Canada's federal program for AI and data governance standardization — the standards-and-certification layer of Canada's AI governance toolkit, complementing legislation and voluntary codes."
```

`2022-06-16-bill-c27-aida.yaml`:
```yaml
summary: "Bundled privacy reform with the Artificial Intelligence and Data Act (AIDA), Canada's first proposed federal AI-specific legislation. Died on the order paper when Parliament was prorogued in January 2025."
```

`2023-05-19-hiroshima-ai-process.yaml`:
```yaml
summary: "The G7's initiative for international governance of advanced AI, launched in May 2023. Produced voluntary guiding principles, a code of conduct for advanced AI developers, and the OECD-run HAIP reporting framework."
```

`2023-08-16-ised-gen-ai-code-of-practice.yaml`:
```yaml
summary: "Principles framework defining six outcomes — safety, fairness, transparency, human oversight, robustness, and accountability — that Canadian developers and deployers of advanced generative AI should achieve."
```

`2023-09-27-ised-voluntary-code-of-conduct-gen-ai.yaml`:
```yaml
summary: "The voluntary commitment instrument organizations sign to adopt the Guardrails for Generative AI outcomes. With AIDA dead, it remains the primary federal mechanism for AI accountability — 51 signatories as of March 2025."
```

`2023-10-18-aigs-governing-ai-2023.yaml`:
```yaml
summary: "White paper by AI Governance and Safety Canada outlining five high-impact actions for the federal government to significantly advance AI governance by mid-2024."
```

`2024-06-26-aigs-governing-ai-2024.yaml`:
```yaml
summary: "Updated AIGS white paper with five high-impact actions for mid-2025, recommending a Ministry of AI, improved legislation, and increased safety research investment."
```

`2025-09-15-caisi-question-period-note.yaml`:
```yaml
summary: "Proactively disclosed Question Period note explaining why Canada created the Canadian AI Safety Institute (CAISI) in November 2024 and noting its role as a founding member of the International Network of AI Safety Institutes."
```

`2025-10-21-aigs-preparing-for-ai-crisis-2025.yaml`:
```yaml
summary: "AIGS white paper warning that smarter-than-human AI may arrive within 18 months and urging Canada to lead global talks while building resilience at home."
```

`2025-12-08-canada-germany-digital-alliance.yaml`:
```yaml
summary: "Joint ministerial statement from the December 2025 G7 digital ministers' meeting in Montréal announcing a Canada-Germany Digital Alliance to deepen bilateral digital and AI cooperation."
```

`2025-12-09-bill-c16-protecting-victims-act.yaml`:
```yaml
summary: "Omnibus criminal-law bill that received royal assent in June 2026, tracked here because committee amendments extended the Criminal Code's non-consensual intimate-image provisions to images created or altered using AI."
```

`2026-02-01-international-ai-safety-report-2026.yaml`:
```yaml
summary: "Comprehensive assessment of AI capabilities, risks, and risk-management practices, led by Yoshua Bengio and produced by over 100 independent experts from more than 30 countries, commissioned by the UK government."
```

`2026-02-05-ai-strategy-summary-of-inputs.yaml`:
```yaml
summary: "ISED's synthesis of Canada's largest public consultation on AI policy — over 11,300 responses and nearly 300 submissions — identifying eight priority areas that informed the 2026 national AI strategy."
```

`2026-02-06-cigi-pco-ai-national-security-report.yaml`:
```yaml
summary: "Workshop summary from CIGI and the Privy Council Office exploring five possible AI futures to 2030 and offering policy recommendations on the national-security implications of next-generation AI systems."
```

`2026-02-14-canada-germany-ai-joint-declaration.yaml`:
```yaml
summary: "Declaration signed at the Munich Security Conference creating a practical framework for Canada-Germany cooperation on secure compute infrastructure and sovereign AI capabilities, building on the December 2025 Digital Alliance."
```

`2026-03-10-munk-sovereign-by-design.yaml`:
```yaml
summary: "Munk School report assessing Canada's position across the AI technology stack, warning that gaps in cloud infrastructure and compute hardware leave Canada vulnerable, and framing sovereignty as freedom from coercion rather than isolationism."
```

`2026-04-11-liberal-convention-ai-act-resolution.yaml`:
```yaml
summary: "Policy resolution adopted at the Liberal Party's 2026 National Convention calling for a Canadian Artificial Intelligence Act modelled on the EU AI Act, with risk-based regulation of high-risk AI systems."
```

`2026-04-14-canada-finland-joint-statement.yaml`:
```yaml
summary: "Joint statement by Prime Minister Carney and President Stubb setting out a new phase of bilateral cooperation on sovereign technology, AI compute capacity, quantum research, Arctic issues, and defence."
```

`2026-05-28-controlai-canada-superintelligence-statement.yaml`:
```yaml
summary: "Campaign statement co-signed by a multipartisan group of MPs and senators calling for Canada to negotiate an international \"trust but verify\" regime to prohibit the development of superintelligent AI."
```

`2026-06-04-canada-national-ai-strategy-ai-for-all.yaml`:
```yaml
summary: "Canada's renewed national AI strategy, launched by Prime Minister Carney in June 2026 and led by ISED. Builds on the 2017 Pan-Canadian AI Strategy and the AI Sprint consultations rather than replacing them."
```

`2026-06-10-bill-c34-safe-social-media-act.yaml`:
```yaml
summary: "Would create a federal online-safety regime aimed at protecting children: a minimum social-media age of 16, mandated age verification, platform duty-to-act-responsibly obligations, and a new Digital Safety Commission of Canada."
```

`2026-06-15-bill-c36-ppcda.yaml`:
```yaml
summary: "The Carney government's successor to Bill C-27's privacy reforms. Recognizes privacy as a fundamental right and creates a Digital Safety and Data Protection Commission of Canada with enhanced enforcement powers."
```

- [ ] **Step 2: Verify every artifact has a summary within limits**

Run:

```bash
node -e "
const fs=require('fs');
let fail=false;
for(const f of fs.readdirSync('data/artifacts')){
  const t=fs.readFileSync('data/artifacts/'+f,'utf8');
  const m=t.match(/^summary: \"(.*)\"$/m);
  if(!m){console.log('MISSING',f);fail=true;continue;}
  const s=m[1].replace(/\\\\\"/g,'\"');
  if(s.length>300){console.log('TOO LONG ('+s.length+')',f);fail=true;}
}
console.log(fail?'FAIL':'OK: all 23 summaries present and <=300 chars');
process.exit(fail?1:0)"
```

Expected: `OK: all 23 summaries present and <=300 chars`

- [ ] **Step 3: Build to validate against the schema**

Run: `pnpm build`
Expected: build succeeds; zod rejects nothing.

- [ ] **Step 4: Commit**

```bash
git add data/artifacts/
git commit -m "Add card summaries to all 23 artifacts (#117)"
```

---

### Task 3: Update contributor docs and run the full suite

**Files:**
- Modify: `.claude/skills/adding-legislation/SKILL.md` (artifact fields section, near the `description: |` guidance around line 40)

**Interfaces:**
- Consumes: the `summary` field conventions from Tasks 1–2.
- Produces: nothing consumed by other tasks; final verification gate for the branch.

- [ ] **Step 1: Document the `summary` field**

In `.claude/skills/adding-legislation/SKILL.md`, directly above the `description: |` line in the artifact template, add:

```yaml
summary: "1–2 plain-text sentences, ≤ 300 chars — shown on the Policy page card. No markdown."
```

And in the prose near the Description guidance, add one sentence:

> Every artifact should also carry a one-to-two-sentence `summary` (≤ 300 characters, plain text) — the Policy page shows `summary` on the card and only falls back to a clamped first paragraph of `description` when it is missing.

- [ ] **Step 2: Run the full verification suite**

Run: `pnpm test && pnpm test:e2e`
Expected: all Vitest unit tests PASS; build succeeds; all Playwright e2e specs PASS (policy specs assert titles, badges, stage text, and hrefs — none of which change).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/adding-legislation/SKILL.md
git commit -m "Document artifact summary field in adding-legislation skill (#117)"
```

---

### Task 4: Open the PR

- [ ] **Step 1: Push and open PR**

```bash
git push -u origin feature/policy-card-summary
```

Then create a PR against `main` titled "Show short summaries on Policy page cards (#117)" whose body links the spec (`docs/superpowers/specs/2026-07-03-policy-card-summary-design.md`), this plan, and issue #117 (use "Closes #117"), and includes a Test plan checklist (unit tests, build, e2e).

- [ ] **Step 2: Confirm CI**

Wait for `Test / unit` and `Test / e2e` checks to pass on the PR.

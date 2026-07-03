# Policy Card Summary — Design

**Date:** 2026-07-03
**Issue:** [#117 — Fix Policy page wall of text](https://github.com/jrhender/ai-governance-tracker/issues/117)

## Problem

Every card on the Policy page renders the artifact's full `description`. Descriptions
run 342–2,400 characters of multi-paragraph text across the 19 artifacts, so the page
reads as a wall of text. Each card already links to a detail page
(`/artifacts/{id}/`) that renders the full description, so the card copy is redundant.

## Decision

Add an optional `summary` field to the artifact schema and show it on Policy cards
instead of `description`. When an artifact has no `summary`, fall back to
`leadText(description)` (the existing first-paragraph helper in `src/lib/format.ts`)
clamped to three lines, so future artifacts degrade gracefully rather than regressing
to a wall of text.

Alternatives considered:

- **CSS `line-clamp` only** — zero data work, but cuts text mid-sentence and the
  opening sentences of existing descriptions were not written to stand alone.
- **First-sentence extraction** — no schema change, but quality depends on how each
  description happens to open, and sentence splitting is fragile.

Hand-written summaries give the best card reading quality for a one-time cost of
writing 19 short summaries; the fallback covers anything unsummarized.

## Changes

### Schema (`src/content.config.ts`)

Add to the `artifacts` collection schema:

```ts
summary: z.string().max(300).optional(),
```

The `max(300)` keeps summaries card-sized — a longer "summary" defeats the purpose
and fails the build with a clear error.

### Data (`data/artifacts/*.yaml`)

Add a `summary` to each of the 19 artifacts: 1–2 plain-text sentences (no markdown),
≤ 300 characters, stating what the artifact is and why it matters. Place it directly
above `description`.

### Policy page (`src/pages/policy/index.astro`, `src/components/PolicyWithSourceFilter.tsx`)

- Pass `summary` through in the `ArtifactEntry` mapping and type.
- On the card, replace the full-description paragraph with:
  - `artifact.summary` when present, or
  - `leadText(artifact.description)` with Tailwind `line-clamp-3` otherwise.

Everything else on the card (title, badges, stage line, date) is unchanged. The
artifact detail page is unchanged and keeps the full description.

### Docs (`.claude/skills/adding-legislation/SKILL.md`)

Note the `summary` field and its conventions where the skill describes artifact
fields, so future entries include one.

## Testing

- **Unit (`PolicyWithSourceFilter.test.tsx`):** a card with a `summary` renders the
  summary and not the description body; a card without one renders the description's
  first paragraph with the clamp class.
- **e2e (`e2e/policy.spec.ts`):** existing specs assert titles, badges, and stage
  text, none of which change; run to confirm. No new e2e needed — the behavior is
  covered at unit level.

## Out of scope

- Summaries on other pages (timeline, event detail) — they already use `leadText`.
- Any change to the artifact detail page.

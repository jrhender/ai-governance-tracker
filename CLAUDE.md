# AI Governance Tracker

## Project Goal

A Canadian AI governance and policy timeline — tracking AI safety events such as Senate hearings, published reports, and significant government or ministerial changes.

## Core Features

- Chronological timeline view with running summary
- Tags on each entry
- Icons linking to original sources (e.g. Senate hearing page, video recordings)
- Links to external resources: Wikipedia pages, org websites, related Canadian AI safety initiatives (e.g. ControlAI)
- Wiki-style backend so that community members can make edits
- Track implementation status of policy recommendations
- Explore whether an open standard for timeline data already exists

## Workflow

### Branching and PRs

Non-trivial changes land on `main` via pull request, not direct pushes. **`main` has branch protection enabled — direct pushes are rejected.** Always create a PR, even for small changes that seem mergeable directly.

1. Start from an up-to-date `main`: `git checkout main && git pull`.
2. Create a feature branch: `git checkout -b feature/<short-topic>` (e.g. `feature/vitest-unit-tests`). Use `fix/<topic>` for bug fixes, `docs/<topic>` for documentation-only changes.
3. Commit in small, reviewable chunks — typically one commit per task in the implementation plan.
4. Push and open a PR against `main` (via GitHub API + `$GITHUB_TOKEN`). PR description links the spec, plan, and any tracking issue, and includes a Test plan checklist.
5. CI (`Test / unit` and `Test / e2e`) must pass before merge.
6. Merge via squash-merge on GitHub. Keep the squash commit message descriptive.
7. After merge: `git checkout main && git pull && git branch -D feature/<topic>`.

Small doc-only or data-only edits to `main` directly are fine when there is nothing to test and no architectural choice to review.

### Commits

- Commit messages describe the change in the imperative mood and explain *why* on the subject line when possible (e.g. "Exclude e2e/ from Vitest so Playwright specs don't clash").
- Include a body when the reasoning isn't obvious from the diff.
- Never commit `.env*`, `CLAUDE.local.md`, or anything in `.claude/settings.local.json` — these are gitignored for a reason.

## Architecture Decisions

Significant architectural choices are recorded as ADRs in `docs/adr/`. Read these before making changes that touch framework, data layer, or deployment concerns.

## Data Model

Records use a `schema_type` field that maps to [schema.org](https://schema.org) types, enabling structured data compatibility:

- Events → `schema.org/Event`
- Reports, papers → `schema.org/CreativeWork`
- Organizations → `schema.org/Organization` or `schema.org/GovernmentOrganization`
- People → `schema.org/Person` (directory not yet created)
- Places → `schema.org/Place`

Records reference each other by `id`. Cross-references:
- Events reference organizations (by `id`) with a `role` field
- Artifacts reference source events via `derives_from` with a `relationship` field
- Policy recommendations within artifacts carry a `status` field: `untracked | under_review | adopted | rejected`

## Directory Structure

```
data/
  events/         # Senate hearings, workshops, government announcements
  artifacts/      # Reports, papers, policy documents
  organizations/  # Think tanks, government bodies, advocacy orgs
  people/         # Individual authors, speakers, ministers (not yet created)
```

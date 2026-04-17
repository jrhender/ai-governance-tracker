# AI Safety Gov Tracker

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

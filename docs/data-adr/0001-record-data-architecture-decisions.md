# 1. Record data architecture decisions

Date: 2026-04-26

## Status

Accepted

## Context

As the project's data model grows, decisions about schema fields, cross-reference
conventions, YAML structure, schema.org mappings, and directory layout need a
durable record. These decisions are distinct from site/infrastructure choices (which
live in `docs/adr/`) and benefit from their own browseable history.

## Decision

We will use Data Architecture Decision Records (data ADRs) to capture significant
data model decisions, following the same lightweight format used in `docs/adr/`.

Conventions:

- Data ADRs live in `docs/data-adr/`.
- Files are named `NNNN-kebab-case-title.md`, numbered sequentially starting
  at `0001`.
- Each ADR has the sections: **Status**, **Context**, **Decision**,
  **Consequences**.
- **Status** is one of: `Proposed`, `Accepted`, `Deprecated`, or
  `Superseded by data-ADR-NNNN`.
- ADRs are immutable once accepted. To change a decision, write a new ADR
  that supersedes the old one, and update the old one's status.

Scope — data ADRs cover:
- Schema fields added to YAML artifact, event, or organization records
- Cross-reference field naming conventions (e.g., `id`, `role`, `relationship`)
- YAML structural patterns (e.g., flat lists vs. nested blocks)
- schema.org type mappings
- Data directory layout under `data/`

Site/infrastructure decisions (framework, deployment, testing) belong in
`docs/adr/`, not here.

## Consequences

- A small amount of overhead per data model decision.
- A clear, browseable history of why the data model looks the way it does.
- New contributors can understand data conventions without archaeology through
  git history.

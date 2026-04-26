# 1. Record architecture decisions

Date: 2026-04-17

## Status

Accepted

## Context

As the project grows, we will make architectural choices (frameworks, data
formats, deployment targets, etc.) whose rationale is easy to lose. Future
contributors — and our future selves — benefit from a durable record of *why*
a decision was made, not just *what* was chosen.

## Decision

We will use Architecture Decision Records (ADRs) to capture significant
architectural decisions, following the lightweight format popularized by
Michael Nygard.

Conventions:

- ADRs live in `docs/adr/`.
- Data model decisions (schema fields, cross-reference conventions, YAML
  structure, schema.org mappings, data directory layout) are recorded separately
  in `docs/data-adr/` using the same format and numbering conventions.
- Files are named `NNNN-kebab-case-title.md`, numbered sequentially starting
  at `0001`.
- Each ADR has the sections: **Status**, **Context**, **Decision**,
  **Consequences**.
- **Status** is one of: `Proposed`, `Accepted`, `Deprecated`, or
  `Superseded by ADR-NNNN`.
- ADRs are immutable once accepted. To change a decision, write a new ADR
  that supersedes the old one, and update the old one's status.

## Consequences

- A small amount of overhead per architectural decision.
- A clear, browseable history of why the system looks the way it does.
- New contributors can ramp up on architectural intent without archaeology
  through git history or chat logs.

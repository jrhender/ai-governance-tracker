# 6. Model policy instruments and enabling technologies as separate layers

Date: 2026-11-15

## Status

Proposed

## Context

Mitigations (`data/mitigations/`) are canonical, report-level recommendations
such as "Prepare an international regime able to prohibit or pause
superintelligence development". We wanted to go deeper on some of them,
starting with AI verification, and show the concrete technologies involved
(recomputation, secure enclaves, zero-knowledge proofs and so on).

Two things ruled out embedding technologies inside a single mitigation:

- The same technology serves several mitigations. The CIGI/PCO report pairs
  "technical verification and compliance measures" with an agreement "with
  the ability to enforce a moratorium", ControlAI calls the prohibition regime
  a "trust but verify" regime, and pacing proposals rely on the same tools.
- Technologies do not advance a mitigation directly. They make a specific
  policy design checkable: a compute-allocation rule, a lag on models used for
  AI R&D, a verified international agreement.

## Decision

Model three layers below risks:

```
risk ← mitigation ← policy instrument → enabling technology
```

- `data/instruments/` (`instruments` collection): a concrete policy design.
  It `advances` one or more mitigations, lists `technologies` (each with an
  optional `note` on how it helps), and can cite tracked artifacts in
  `proposed_in` plus external `links`.
- `data/technologies/` (`technologies` collection): an enabling technology
  with a `summary`, an `example_claim` it could make checkable, and
  `why_it_matters`.
- Edges live on instruments only. `src/lib/policyGraph.ts` resolves and
  inverts them so mitigation and technology pages can list their neighbours.

Pages: `/mitigations/<id>/`, `/instruments/<id>/` and `/technologies/<id>/`,
plus `/mitigations/`, a mitigation-first index beside the risk-first `/map/`.

## Consequences

- Adding a technology to a new policy is one line on an instrument, and the
  technology page picks it up automatically.
- Instruments can come from non-Canadian sources (for example the AI Futures
  pacing options). Their `links` should always cite the source.
- Mitigation `status` still tracks Canadian implementation. Instruments have
  no status yet. If Canada adopts a specific instrument, record it with
  `implemented_by` on the mitigation, and consider adding status to
  instruments later.

# 7. Record Canadian implementation on policy instruments, not mitigations

Date: 2026-11-15

## Status

Accepted

## Context

ADR 0006 added policy instruments between mitigations and technologies, but
left implementation evidence (`implemented_by`) on mitigations. In practice a
concrete policy rarely implements a whole mitigation. Bill C-25 puts one
instrument in place (an elections offence for deceptive deepfakes of electoral
actors), and that instrument advances the mitigation "criminalize deceptive
and abusive deepfakes". One policy can also carry several instruments: the
Paris call has an incident early-warning system, a common evaluation framework
and whistleblower channels, each advancing a different mitigation. Linking the
policy straight to mitigations needed `partially_implements` plus a note to
say which part.

## Decision

```
risk ← mitigation ← policy instrument ← policy or event (implemented_by)
                          ↓
                  enabling technology
```

- `implemented_by` moves from mitigations to instruments, with the same shape
  (one `artifact` or `event`, a `relationship` of `implements`,
  `partially_implements` or `related`, and a `note`). `related` covers
  statements, proposals and failed bills that bear on the instrument without
  putting it in place.
- A mitigation's implementations are derived from the instruments that
  advance it (`buildRiskMap` takes instruments as input).
- Instrument types gain `institution` (e.g. CAISI) and `voluntary_framework`
  (e.g. the data centre principles).
- Artifact and event pages show policy → instrument → mitigation → risks.
  Events also inherit instruments from their related or derived artifacts.

Mitigation `status` stays hand-set, using the rubric on `/map`. It could later
be derived from instrument implementations.

## Consequences

- Recording a new policy means finding (or creating) the instrument it puts in
  place and adding one `implemented_by` entry there.
- Some instruments map one-to-one to a mitigation. That is acceptable: the
  instrument names the concrete mechanism, the mitigation the goal.

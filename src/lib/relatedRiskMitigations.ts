import type { MitigationStatus } from "./mitigationTaxonomy";

// Reverse lookup for artifact and event pages. A policy or event puts policy
// instruments into practice; each instrument advances mitigations; each
// mitigation addresses risks. Reports also recommend mitigations directly and
// identify risks. Minimal input shapes keep this unit-testable without
// `astro:content` (same pattern as riskMap.ts).
type Ref = { id: string };

export type Relationship = "implements" | "partially_implements" | "related";

export type RelRiskInput = { id: string; data: { title: string } };

export type RelMitigationInput = {
  id: string;
  data: { title: string; status: MitigationStatus; addresses_risks: Ref[] };
};

export type RelInstrumentInput = {
  id: string;
  data: {
    title: string;
    advances: Ref[];
    implemented_by: {
      artifact?: Ref;
      event?: Ref;
      relationship: Relationship;
      note?: string;
    }[];
  };
};

export type RelArtifactInput = {
  id: string;
  data: {
    derives_from: { id: Ref }[];
    policy_recommendations: { mitigation?: Ref }[];
    risk_findings: { risk?: Ref }[];
  };
};

export type RelEventInput = {
  id: string;
  data: { related_artifacts: { id: Ref }[] };
};

export type RelatedRisk = { id: string; title: string };

export type RelatedMitigation = {
  id: string;
  title: string;
  status: MitigationStatus;
  risks: RelatedRisk[];
};

export type RelatedInstrument = {
  id: string;
  title: string;
  relationship: Relationship;
  note?: string;
  // Set when the link comes from an artifact tied to this event, not the
  // event itself.
  viaArtifactId?: string;
  mitigations: RelatedMitigation[];
};

export type RelatedResult = {
  instruments: RelatedInstrument[];
  // Mitigations this report recommends.
  recommends: RelatedMitigation[];
  // Risks identified in this report's findings.
  identifiedRisks: RelatedRisk[];
};

const STRENGTH: Record<Relationship, number> = {
  implements: 2,
  partially_implements: 1,
  related: 0,
};

const EMPTY: RelatedResult = { instruments: [], recommends: [], identifiedRisks: [] };

export function buildRelatedIndex(
  risks: RelRiskInput[],
  mitigations: RelMitigationInput[],
  instruments: RelInstrumentInput[],
  artifacts: RelArtifactInput[],
  events: RelEventInput[],
) {
  const riskTitle = new Map(risks.map((r) => [r.id, r.data.title]));
  const toRisks = (refs: Ref[]): RelatedRisk[] =>
    refs.flatMap((r) =>
      riskTitle.has(r.id) ? [{ id: r.id, title: riskTitle.get(r.id)! }] : [],
    );
  const mitigationById = new Map(
    mitigations.map((m) => [
      m.id,
      {
        id: m.id,
        title: m.data.title,
        status: m.data.status,
        risks: toRisks(m.data.addresses_risks),
      } satisfies RelatedMitigation,
    ]),
  );
  const toMitigations = (refs: Ref[]) =>
    refs.flatMap((r) => (mitigationById.has(r.id) ? [mitigationById.get(r.id)!] : []));

  const byArtifact = new Map<string, RelatedInstrument[]>();
  const byEvent = new Map<string, RelatedInstrument[]>();
  const push = (map: Map<string, RelatedInstrument[]>, key: string, ri: RelatedInstrument) => {
    const list = map.get(key) ?? [];
    list.push(ri);
    map.set(key, list);
  };
  for (const inst of instruments) {
    const mits = toMitigations(inst.data.advances);
    for (const impl of inst.data.implemented_by) {
      const ri: RelatedInstrument = {
        id: inst.id,
        title: inst.data.title,
        relationship: impl.relationship,
        note: impl.note,
        mitigations: mits,
      };
      if (impl.artifact) push(byArtifact, impl.artifact.id, ri);
      if (impl.event) push(byEvent, impl.event.id, ri);
    }
  }

  // Strongest relationship wins per instrument; on a tie the direct link wins.
  const merge = (links: RelatedInstrument[]): RelatedInstrument[] => {
    const best = new Map<string, RelatedInstrument>();
    for (const l of links) {
      const cur = best.get(l.id);
      const better =
        !cur ||
        STRENGTH[l.relationship] > STRENGTH[cur.relationship] ||
        (STRENGTH[l.relationship] === STRENGTH[cur.relationship] &&
          !l.viaArtifactId &&
          !!cur.viaArtifactId);
      if (better) best.set(l.id, l);
    }
    return [...best.values()].sort(
      (a, b) =>
        STRENGTH[b.relationship] - STRENGTH[a.relationship] ||
        a.title.localeCompare(b.title),
    );
  };

  const dedupe = <T extends { id: string }>(items: T[]) =>
    items.filter((x, i) => items.findIndex((y) => y.id === x.id) === i);

  return {
    forArtifact(id: string): RelatedResult {
      const artifact = artifacts.find((a) => a.id === id);
      if (!artifact) return EMPTY;
      return {
        instruments: merge(byArtifact.get(id) ?? []),
        recommends: dedupe(
          toMitigations(
            artifact.data.policy_recommendations.flatMap((r) =>
              r.mitigation ? [r.mitigation] : [],
            ),
          ),
        ),
        identifiedRisks: dedupe(
          toRisks(artifact.data.risk_findings.flatMap((f) => (f.risk ? [f.risk] : []))),
        ),
      };
    },
    forEvent(id: string): RelatedResult {
      const event = events.find((e) => e.id === id);
      const links: RelatedInstrument[] = [...(byEvent.get(id) ?? [])];
      const artifactIds = new Set<string>([
        ...(event?.data.related_artifacts.map((a) => a.id.id) ?? []),
        ...artifacts
          .filter((a) => a.data.derives_from.some((d) => d.id.id === id))
          .map((a) => a.id),
      ]);
      for (const aid of artifactIds) {
        for (const l of byArtifact.get(aid) ?? []) links.push({ ...l, viaArtifactId: aid });
      }
      // A report's recommendations are not something the event did, so they
      // stay on the report's own page.
      return { ...EMPTY, instruments: merge(links) };
    },
  };
}

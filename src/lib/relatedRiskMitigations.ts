import type { MitigationStatus } from "./mitigationTaxonomy";

// Reverse lookup for artifact and event pages: which mitigations does this
// record implement, relate to or recommend, and which risks do those address?
// Minimal input shapes keep this unit-testable without `astro:content`
// (same pattern as riskMap.ts).
type Ref = { id: string };

export type RelRiskInput = { id: string; data: { title: string } };

export type RelMitigationInput = {
  id: string;
  data: {
    title: string;
    status: MitigationStatus;
    addresses_risks: Ref[];
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

export type Relationship =
  | "implements"
  | "partially_implements"
  | "related"
  | "recommends";

export type RelatedMitigation = {
  id: string;
  title: string;
  status: MitigationStatus;
  relationship: Relationship;
  note?: string;
  // Set when the link comes from an artifact tied to this event, not the
  // event itself.
  viaArtifactId?: string;
  risks: { id: string; title: string }[];
};

export type RelatedRisk = { id: string; title: string };

export type RelatedResult = {
  mitigations: RelatedMitigation[];
  // Risks identified in this artifact's findings that no listed mitigation
  // already points at.
  identifiedRisks: RelatedRisk[];
};

const STRENGTH: Record<Relationship, number> = {
  implements: 3,
  partially_implements: 2,
  related: 1,
  recommends: 0,
};

export function buildRelatedIndex(
  risks: RelRiskInput[],
  mitigations: RelMitigationInput[],
  artifacts: RelArtifactInput[],
  events: RelEventInput[],
) {
  const riskTitle = new Map(risks.map((r) => [r.id, r.data.title]));
  const riskOf = (m: RelMitigationInput) =>
    m.data.addresses_risks.flatMap((r) =>
      riskTitle.has(r.id) ? [{ id: r.id, title: riskTitle.get(r.id)! }] : [],
    );

  type Link = Omit<RelatedMitigation, "risks"> & { m: RelMitigationInput };
  const byArtifact = new Map<string, Link[]>();
  const byEvent = new Map<string, Link[]>();
  const push = (map: Map<string, Link[]>, key: string, link: Link) => {
    const list = map.get(key) ?? [];
    list.push(link);
    map.set(key, list);
  };

  for (const m of mitigations) {
    for (const impl of m.data.implemented_by) {
      const link: Link = {
        id: m.id,
        title: m.data.title,
        status: m.data.status,
        relationship: impl.relationship,
        note: impl.note,
        m,
      };
      if (impl.artifact) push(byArtifact, impl.artifact.id, link);
      if (impl.event) push(byEvent, impl.event.id, link);
    }
  }
  for (const a of artifacts) {
    for (const rec of a.data.policy_recommendations) {
      if (!rec.mitigation) continue;
      const m = mitigations.find((x) => x.id === rec.mitigation!.id);
      if (!m) continue;
      push(byArtifact, a.id, {
        id: m.id,
        title: m.data.title,
        status: m.data.status,
        relationship: "recommends",
        m,
      });
    }
  }

  // Strongest relationship wins per mitigation; on a tie the direct link wins.
  const merge = (links: Link[]): RelatedMitigation[] => {
    const best = new Map<string, Link>();
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
    return [...best.values()]
      .sort(
        (a, b) =>
          STRENGTH[b.relationship] - STRENGTH[a.relationship] ||
          a.title.localeCompare(b.title),
      )
      .map(({ m, ...rest }) => ({ ...rest, risks: riskOf(m) }));
  };

  return {
    forArtifact(id: string): RelatedResult {
      const mits = merge(byArtifact.get(id) ?? []);
      const covered = new Set(mits.flatMap((m) => m.risks.map((r) => r.id)));
      const artifact = artifacts.find((a) => a.id === id);
      const identifiedRisks: RelatedRisk[] = [];
      for (const f of artifact?.data.risk_findings ?? []) {
        if (!f.risk || covered.has(f.risk.id)) continue;
        if (identifiedRisks.some((r) => r.id === f.risk!.id)) continue;
        const title = riskTitle.get(f.risk.id);
        if (title) identifiedRisks.push({ id: f.risk.id, title });
      }
      return { mitigations: mits, identifiedRisks };
    },
    forEvent(id: string): RelatedResult {
      const links: Link[] = [...(byEvent.get(id) ?? [])];
      const event = events.find((e) => e.id === id);
      const artifactIds = new Set<string>([
        ...(event?.data.related_artifacts.map((a) => a.id.id) ?? []),
        ...artifacts
          .filter((a) => a.data.derives_from.some((d) => d.id.id === id))
          .map((a) => a.id),
      ]);
      for (const aid of artifactIds) {
        for (const l of byArtifact.get(aid) ?? []) {
          // A recommendation in a report is not something the event did.
          if (l.relationship === "recommends") continue;
          links.push({ ...l, viaArtifactId: aid });
        }
      }
      return { mitigations: merge(links), identifiedRisks: [] };
    },
  };
}

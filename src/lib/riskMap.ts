import {
  RISK_DOMAINS,
  RISK_SUBDOMAINS,
  type RiskDomain,
  type RiskSubdomain,
} from "./riskTaxonomy";
import {
  MITIGATION_STATUS_SLUGS,
  type MitigationCategory,
  type MitigationStatus,
} from "./mitigationTaxonomy";

// Minimal shapes of the Astro content collections, kept here so this builder
// stays unit-testable without pulling in `astro:content` (same pattern as
// timeline.ts).
type Ref = { collection: string; id: string };

export type RiskInput = {
  id: string;
  data: {
    title: string;
    description?: string;
    domain: RiskDomain;
    subdomain: RiskSubdomain;
  };
};

export type MitigationInput = {
  id: string;
  data: {
    title: string;
    description?: string;
    mitigation_type?: MitigationCategory;
    status: MitigationStatus;
    addresses_risks: Ref[];
    implemented_by: {
      artifact?: Ref;
      event?: Ref;
      relationship: "implements" | "partially_implements" | "related";
      note?: string;
    }[];
  };
};

export type ArtifactInput = {
  id: string;
  data: {
    title: string;
    risk_findings: { id: string; title: string; risk?: Ref }[];
    policy_recommendations: {
      id: string;
      title: string;
      summary: string;
      mitigation?: Ref;
    }[];
  };
};

export type EventLikeInput = { id: string; data: { title: string } };

export type Implementation = {
  kind: "artifact" | "event";
  id: string;
  title: string;
  relationship: "implements" | "partially_implements" | "related";
  note?: string;
};

export type MapMitigation = {
  id: string;
  title: string;
  description?: string;
  mitigationType?: MitigationCategory;
  status: MitigationStatus;
  recommendedBy: { artifactId: string; artifactTitle: string; recTitle: string }[];
  implementations: Implementation[];
};

export type MapRisk = {
  id: string;
  title: string;
  description?: string;
  subdomain: RiskSubdomain;
  subdomainLabel: string;
  identifiedBy: { artifactId: string; artifactTitle: string; findingTitle: string }[];
  mitigations: MapMitigation[];
};

export type DomainGroup = {
  domain: RiskDomain;
  label: string;
  risks: MapRisk[];
};

export type UnmappedRec = {
  artifactId: string;
  artifactTitle: string;
  recId: string;
  title: string;
  summary: string;
};

export type RiskMapMetrics = {
  riskCount: number;
  mitigationCount: number;
  statusCounts: Record<MitigationStatus, number>;
  unimplementedCount: number;
  domainsWithoutAdopted: string[]; // display labels
};

export type RiskMapResult = {
  domains: DomainGroup[];
  general: MapMitigation[];
  unmapped: UnmappedRec[];
  metrics: RiskMapMetrics;
};

export function buildRiskMap(
  risks: RiskInput[],
  mitigations: MitigationInput[],
  artifacts: ArtifactInput[],
  events: EventLikeInput[],
): RiskMapResult {
  const artifactTitles = new Map(artifacts.map((a) => [a.id, a.data.title]));
  const eventTitles = new Map(events.map((e) => [e.id, e.data.title]));

  // Invert provenance edges: mitigation id → recommending reports,
  // risk id → identifying reports; collect unmapped recommendations.
  const recommendedBy = new Map<string, MapMitigation["recommendedBy"]>();
  const identifiedBy = new Map<string, MapRisk["identifiedBy"]>();
  const unmapped: UnmappedRec[] = [];

  for (const artifact of artifacts) {
    for (const finding of artifact.data.risk_findings) {
      if (!finding.risk) continue;
      const list = identifiedBy.get(finding.risk.id) ?? [];
      list.push({
        artifactId: artifact.id,
        artifactTitle: artifact.data.title,
        findingTitle: finding.title,
      });
      identifiedBy.set(finding.risk.id, list);
    }
    for (const rec of artifact.data.policy_recommendations) {
      if (!rec.mitigation) {
        unmapped.push({
          artifactId: artifact.id,
          artifactTitle: artifact.data.title,
          recId: rec.id,
          title: rec.title,
          summary: rec.summary,
        });
        continue;
      }
      const list = recommendedBy.get(rec.mitigation.id) ?? [];
      list.push({
        artifactId: artifact.id,
        artifactTitle: artifact.data.title,
        recTitle: rec.title,
      });
      recommendedBy.set(rec.mitigation.id, list);
    }
  }

  const toMapMitigation = (m: MitigationInput): MapMitigation => ({
    id: m.id,
    title: m.data.title,
    description: m.data.description,
    mitigationType: m.data.mitigation_type,
    status: m.data.status,
    recommendedBy: recommendedBy.get(m.id) ?? [],
    implementations: m.data.implemented_by.map((impl) => {
      const kind = impl.artifact ? ("artifact" as const) : ("event" as const);
      const ref = impl.artifact ?? impl.event!;
      const title =
        (kind === "artifact" ? artifactTitles.get(ref.id) : eventTitles.get(ref.id)) ??
        ref.id;
      return { kind, id: ref.id, title, relationship: impl.relationship, note: impl.note };
    }),
  });

  // Risk id → mitigations addressing it; mitigations with no risks → general.
  const byRisk = new Map<string, MapMitigation[]>();
  const general: MapMitigation[] = [];
  for (const m of mitigations) {
    const mapped = toMapMitigation(m);
    if (m.data.addresses_risks.length === 0) {
      general.push(mapped);
      continue;
    }
    for (const riskRef of m.data.addresses_risks) {
      const list = byRisk.get(riskRef.id) ?? [];
      list.push(mapped);
      byRisk.set(riskRef.id, list);
    }
  }

  // Group risks by MIT domain, in taxonomy order; skip empty domains.
  const domains: DomainGroup[] = (
    Object.entries(RISK_DOMAINS) as [RiskDomain, string][]
  )
    .map(([domain, label]) => ({
      domain,
      label,
      risks: risks
        .filter((r) => r.data.domain === domain)
        .map((r) => ({
          id: r.id,
          title: r.data.title,
          description: r.data.description,
          subdomain: r.data.subdomain,
          subdomainLabel: RISK_SUBDOMAINS[r.data.subdomain].label,
          identifiedBy: identifiedBy.get(r.id) ?? [],
          mitigations: byRisk.get(r.id) ?? [],
        })),
    }))
    .filter((g) => g.risks.length > 0);

  // Metrics.
  const statusCounts = Object.fromEntries(
    MITIGATION_STATUS_SLUGS.map((s) => [s, 0]),
  ) as Record<MitigationStatus, number>;
  for (const m of mitigations) statusCounts[m.data.status] += 1;

  const riskDomain = new Map(risks.map((r) => [r.id, r.data.domain]));
  const domainsWithAdopted = new Set<RiskDomain>();
  for (const m of mitigations) {
    if (m.data.status !== "adopted") continue;
    for (const riskRef of m.data.addresses_risks) {
      const domain = riskDomain.get(riskRef.id);
      if (domain) domainsWithAdopted.add(domain);
    }
  }
  const domainsWithoutAdopted = (
    Object.entries(RISK_DOMAINS) as [RiskDomain, string][]
  )
    .filter(([domain]) => !domainsWithAdopted.has(domain))
    .map(([, label]) => label);

  return {
    domains,
    general,
    unmapped,
    metrics: {
      riskCount: risks.length,
      mitigationCount: mitigations.length,
      statusCounts,
      unimplementedCount: mitigations.filter(
        (m) => m.data.implemented_by.length === 0,
      ).length,
      domainsWithoutAdopted,
    },
  };
}

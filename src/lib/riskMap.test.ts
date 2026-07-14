import { describe, it, expect } from "vitest";
import {
  buildRiskMap,
  type RiskInput,
  type MitigationInput,
  type ArtifactInput,
  type EventLikeInput,
} from "./riskMap";

const risks: RiskInput[] = [
  {
    id: "loss-of-control",
    data: {
      title: "Loss of control",
      description: "d",
      domain: "ai-system-safety",
      subdomain: "misalignment",
    },
  },
  {
    id: "fraud",
    data: {
      title: "Fraud",
      domain: "malicious-actors-misuse",
      subdomain: "fraud-scams-manipulation",
    },
  },
];

const mitigations: MitigationInput[] = [
  {
    id: "asi-regime",
    data: {
      title: "ASI regime",
      status: "untracked",
      mitigation_type: "governance-oversight",
      addresses_risks: [{ collection: "risks", id: "loss-of-control" }],
      implemented_by: [],
    },
  },
  {
    id: "watermarking",
    data: {
      title: "Watermarking",
      status: "adopted",
      addresses_risks: [{ collection: "risks", id: "fraud" }],
      implemented_by: [
        {
          artifact: { collection: "artifacts", id: "bill-x" },
          relationship: "implements",
          note: "n",
        },
      ],
    },
  },
  {
    id: "machinery",
    data: {
      title: "Machinery",
      status: "untracked",
      addresses_risks: [],
      implemented_by: [],
    },
  },
];

const artifacts: ArtifactInput[] = [
  {
    id: "report-a",
    data: {
      title: "Report A",
      risk_findings: [
        {
          id: "f1",
          title: "LoC finding",
          risk: { collection: "risks", id: "loss-of-control" },
        },
        { id: "f2", title: "Unlinked finding" },
      ],
      policy_recommendations: [
        {
          id: "r1",
          title: "Do the regime",
          summary: "s",
          mitigation: { collection: "mitigations", id: "asi-regime" },
        },
        { id: "r2", title: "Unmapped rec", summary: "s2" },
      ],
    },
  },
  {
    id: "bill-x",
    data: { title: "Bill X", risk_findings: [], policy_recommendations: [] },
  },
];

const events: EventLikeInput[] = [];

describe("buildRiskMap", () => {
  const result = buildRiskMap(risks, mitigations, artifacts, events);

  it("groups risks under their MIT domain with labels", () => {
    const domains = result.domains.map((d) => d.domain);
    expect(domains).toContain("ai-system-safety");
    expect(domains).toContain("malicious-actors-misuse");
    // only domains with risks appear
    expect(domains).not.toContain("misinformation");
    const safety = result.domains.find((d) => d.domain === "ai-system-safety")!;
    expect(safety.label).toBe("AI system safety, failures & limitations");
    expect(safety.risks.map((r) => r.id)).toEqual(["loss-of-control"]);
    expect(safety.risks[0].subdomainLabel).toBe(
      "AI pursuing its own goals in conflict with human goals or values",
    );
  });

  it("attaches identifying reports and mitigations to each risk", () => {
    const loc = result.domains
      .flatMap((d) => d.risks)
      .find((r) => r.id === "loss-of-control")!;
    expect(loc.identifiedBy).toEqual([
      { artifactId: "report-a", artifactTitle: "Report A", findingTitle: "LoC finding" },
    ]);
    expect(loc.mitigations.map((m) => m.id)).toEqual(["asi-regime"]);
    expect(loc.mitigations[0].recommendedBy).toEqual([
      { artifactId: "report-a", artifactTitle: "Report A", recTitle: "Do the regime" },
    ]);
  });

  it("resolves implementation references to titles", () => {
    const fraud = result.domains
      .flatMap((d) => d.risks)
      .find((r) => r.id === "fraud")!;
    expect(fraud.mitigations[0].implementations).toEqual([
      {
        kind: "artifact",
        id: "bill-x",
        title: "Bill X",
        relationship: "implements",
        note: "n",
      },
    ]);
  });

  it("collects mitigations with no addressed risks into general", () => {
    expect(result.general.map((m) => m.id)).toEqual(["machinery"]);
  });

  it("collects recommendations without a mitigation ref into unmapped", () => {
    expect(result.unmapped).toEqual([
      { artifactId: "report-a", artifactTitle: "Report A", recId: "r2", title: "Unmapped rec", summary: "s2" },
    ]);
  });

  it("computes metrics", () => {
    expect(result.metrics.riskCount).toBe(2);
    expect(result.metrics.mitigationCount).toBe(3);
    expect(result.metrics.statusCounts).toEqual({
      untracked: 2,
      under_review: 0,
      adopted: 1,
      rejected: 0,
    });
    // 2 of 3 mitigations have no implementation evidence
    expect(result.metrics.unimplementedCount).toBe(2);
    // fraud's domain has an adopted mitigation; the other 6 domains do not
    expect(result.metrics.domainsWithoutAdopted).toHaveLength(6);
    expect(result.metrics.domainsWithoutAdopted).not.toContain(
      "Malicious actors & misuse",
    );
    expect(result.metrics.domainsWithoutAdopted).toContain("Misinformation");
  });
});

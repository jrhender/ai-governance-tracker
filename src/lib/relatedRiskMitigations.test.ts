import { describe, it, expect } from "vitest";
import { buildRelatedIndex } from "./relatedRiskMitigations";

const risks = [
  { id: "fraud", data: { title: "Fraud" } },
  { id: "loc", data: { title: "Loss of control" } },
  { id: "bio", data: { title: "Bio" } },
];

const mitigations = [
  {
    id: "deepfakes",
    data: {
      title: "Criminalize deepfakes",
      status: "adopted" as const,
      addresses_risks: [{ id: "fraud" }],
      implemented_by: [
        { artifact: { id: "c16" }, relationship: "implements" as const, note: "n" },
        { event: { id: "ev1" }, relationship: "related" as const },
      ],
    },
  },
  {
    id: "eval",
    data: {
      title: "Evaluate models",
      status: "under_review" as const,
      addresses_risks: [{ id: "loc" }, { id: "missing" }],
      implemented_by: [{ artifact: { id: "call" }, relationship: "related" as const }],
    },
  },
];

const artifacts = [
  {
    id: "c16",
    data: { derives_from: [{ id: { id: "ev1" } }], policy_recommendations: [], risk_findings: [] },
  },
  {
    id: "report",
    data: {
      derives_from: [],
      policy_recommendations: [{ mitigation: { id: "eval" } }, {}],
      risk_findings: [{ risk: { id: "bio" } }, { risk: { id: "loc" } }, {}],
    },
  },
  { id: "call", data: { derives_from: [{ id: { id: "ev2" } }], policy_recommendations: [], risk_findings: [] } },
];

const events = [
  { id: "ev1", data: { related_artifacts: [{ id: { id: "c16" } }] } },
  { id: "ev2", data: { related_artifacts: [] } },
  { id: "ev3", data: { related_artifacts: [] } },
];

const idx = buildRelatedIndex(risks, mitigations, artifacts, events);

describe("buildRelatedIndex", () => {
  it("lists mitigations that an artifact implements, with the risks they address", () => {
    const r = idx.forArtifact("c16");
    expect(r.mitigations).toEqual([
      {
        id: "deepfakes",
        title: "Criminalize deepfakes",
        status: "adopted",
        relationship: "implements",
        note: "n",
        risks: [{ id: "fraud", title: "Fraud" }],
      },
    ]);
  });

  it("includes mitigations a report recommends, and drops unknown risk ids", () => {
    const r = idx.forArtifact("report");
    expect(r.mitigations).toHaveLength(1);
    expect(r.mitigations[0]).toMatchObject({ id: "eval", relationship: "recommends" });
    expect(r.mitigations[0].risks).toEqual([{ id: "loc", title: "Loss of control" }]);
  });

  it("lists identified risks not already covered by a listed mitigation", () => {
    expect(idx.forArtifact("report").identifiedRisks).toEqual([{ id: "bio", title: "Bio" }]);
  });

  it("keeps the strongest relationship, whether direct or inherited from the artifact", () => {
    const r = idx.forEvent("ev1");
    expect(r.mitigations).toHaveLength(1);
    expect(r.mitigations[0].relationship).toBe("implements");
    expect(r.mitigations[0].viaArtifactId).toBe("c16");
  });

  it("prefers the direct link when strengths tie", () => {
    const tie = buildRelatedIndex(
      risks,
      [
        {
          id: "m",
          data: {
            title: "M",
            status: "untracked",
            addresses_risks: [],
            implemented_by: [
              { artifact: { id: "a" }, relationship: "related" },
              { event: { id: "e" }, relationship: "related", note: "direct" },
            ],
          },
        },
      ],
      [{ id: "a", data: { derives_from: [], policy_recommendations: [], risk_findings: [] } }],
      [{ id: "e", data: { related_artifacts: [{ id: { id: "a" } }] } }],
    );
    expect(tie.forEvent("e").mitigations[0]).toMatchObject({ note: "direct" });
    expect(tie.forEvent("e").mitigations[0].viaArtifactId).toBeUndefined();
  });

  it("inherits links from artifacts that derive from the event", () => {
    const r = idx.forEvent("ev2");
    expect(r.mitigations.map((m) => m.id)).toEqual(["eval"]);
    expect(r.mitigations[0].viaArtifactId).toBe("call");
  });

  it("does not attribute a report's recommendations to its source event", () => {
    const withRec = buildRelatedIndex(risks, mitigations, artifacts, [
      { id: "ev9", data: { related_artifacts: [{ id: { id: "report" } }] } },
    ]);
    expect(withRec.forEvent("ev9").mitigations).toEqual([]);
  });

  it("returns nothing for records with no links", () => {
    expect(idx.forEvent("ev3")).toEqual({ mitigations: [], identifiedRisks: [] });
  });
});

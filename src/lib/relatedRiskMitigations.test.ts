import { describe, it, expect } from "vitest";
import { buildRelatedIndex, type RelInstrumentInput } from "./relatedRiskMitigations";

const risks = [
  { id: "fraud", data: { title: "Fraud" } },
  { id: "loc", data: { title: "Loss of control" } },
  { id: "bio", data: { title: "Bio" } },
];

const mitigations = [
  {
    id: "deepfakes",
    data: { title: "Criminalize deepfakes", status: "adopted" as const, addresses_risks: [{ id: "fraud" }] },
  },
  {
    id: "eval",
    data: {
      title: "Evaluate models",
      status: "under_review" as const,
      addresses_risks: [{ id: "loc" }, { id: "missing" }],
    },
  },
];

const instruments: RelInstrumentInput[] = [
  {
    id: "offence",
    data: {
      title: "Deepfake offence",
      advances: [{ id: "deepfakes" }],
      implemented_by: [
        { artifact: { id: "c16" }, relationship: "implements", note: "n" },
        { event: { id: "ev1" }, relationship: "related" },
      ],
    },
  },
  {
    id: "testing",
    data: {
      title: "Mandatory testing",
      advances: [{ id: "eval" }, { id: "unknown" }],
      implemented_by: [{ artifact: { id: "call" }, relationship: "related" }],
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
      policy_recommendations: [{ mitigation: { id: "eval" } }, { mitigation: { id: "eval" } }, {}],
      risk_findings: [{ risk: { id: "bio" } }, { risk: { id: "loc" } }, {}],
    },
  },
  {
    id: "call",
    data: { derives_from: [{ id: { id: "ev2" } }], policy_recommendations: [], risk_findings: [] },
  },
];

const events = [
  { id: "ev1", data: { related_artifacts: [{ id: { id: "c16" } }] } },
  { id: "ev2", data: { related_artifacts: [] } },
  { id: "ev3", data: { related_artifacts: [] } },
  { id: "ev9", data: { related_artifacts: [{ id: { id: "report" } }] } },
];

const idx = buildRelatedIndex(risks, mitigations, instruments, artifacts, events);

describe("buildRelatedIndex", () => {
  it("lists the instruments a policy implements, with mitigations and risks", () => {
    expect(idx.forArtifact("c16").instruments).toEqual([
      {
        id: "offence",
        title: "Deepfake offence",
        relationship: "implements",
        note: "n",
        mitigations: [
          {
            id: "deepfakes",
            title: "Criminalize deepfakes",
            status: "adopted",
            risks: [{ id: "fraud", title: "Fraud" }],
          },
        ],
      },
    ]);
  });

  it("drops unknown mitigation and risk ids", () => {
    const [testing] = idx.forArtifact("call").instruments;
    expect(testing.mitigations.map((m) => m.id)).toEqual(["eval"]);
    expect(testing.mitigations[0].risks).toEqual([{ id: "loc", title: "Loss of control" }]);
  });

  it("lists a report's recommended mitigations and identified risks, deduplicated", () => {
    const r = idx.forArtifact("report");
    expect(r.instruments).toEqual([]);
    expect(r.recommends.map((m) => m.id)).toEqual(["eval"]);
    expect(r.identifiedRisks).toEqual([
      { id: "bio", title: "Bio" },
      { id: "loc", title: "Loss of control" },
    ]);
  });

  it("keeps the strongest relationship, whether direct or through an artifact", () => {
    const [offence] = idx.forEvent("ev1").instruments;
    expect(offence.relationship).toBe("implements");
    expect(offence.viaArtifactId).toBe("c16");
  });

  it("prefers the direct link when strengths tie", () => {
    const tie = buildRelatedIndex(
      risks,
      mitigations,
      [
        {
          id: "i",
          data: {
            title: "I",
            advances: [],
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
    const [i] = tie.forEvent("e").instruments;
    expect(i.note).toBe("direct");
    expect(i.viaArtifactId).toBeUndefined();
  });

  it("inherits instruments from artifacts that derive from the event", () => {
    const r = idx.forEvent("ev2");
    expect(r.instruments.map((i) => i.id)).toEqual(["testing"]);
    expect(r.instruments[0].viaArtifactId).toBe("call");
  });

  it("does not attribute a report's recommendations to its source event", () => {
    expect(idx.forEvent("ev9")).toEqual({ instruments: [], recommends: [], identifiedRisks: [] });
  });

  it("returns nothing for records with no links", () => {
    expect(idx.forEvent("ev3")).toEqual({ instruments: [], recommends: [], identifiedRisks: [] });
  });
});

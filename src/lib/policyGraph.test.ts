import { describe, it, expect } from "vitest";
import { buildPolicyGraph, type InstrumentInput } from "./policyGraph";

const ref = (collection: string, id: string) => ({ collection, id });

const mitigations = [
  { id: "pause", data: { title: "Pause ability" } },
  { id: "treaty", data: { title: "Treaty regime" } },
];
const technologies = [
  { id: "enclaves", data: { title: "Secure enclaves", domain: "verification" as const } },
  { id: "zkp", data: { title: "Zero-knowledge proofs", domain: "verification" as const } },
  { id: "unused", data: { title: "Unused tech", domain: "verification" as const } },
];
const artifacts = [{ id: "statement", data: { title: "A statement" } }];

const instruments: InstrumentInput[] = [
  {
    id: "agreement",
    data: {
      title: "Verification agreement",
      instrument_type: "international_agreement",
      advances: [ref("mitigations", "treaty"), ref("mitigations", "pause")],
      technologies: [
        { technology: ref("technologies", "zkp") },
        { technology: ref("technologies", "enclaves") },
      ],
      proposed_in: [ref("artifacts", "statement")],
    },
  },
  {
    id: "allocation",
    data: {
      title: "Allocation minimums",
      instrument_type: "regulation",
      advances: [ref("mitigations", "pause")],
      technologies: [{ technology: ref("technologies", "enclaves"), note: "counts FLOPs" }],
      proposed_in: [],
    },
  },
];

describe("buildPolicyGraph", () => {
  const g = buildPolicyGraph(mitigations, instruments, technologies, artifacts);

  it("resolves instrument edges to titles", () => {
    const a = g.instruments.get("agreement")!;
    expect(a.advances).toEqual([
      { id: "treaty", title: "Treaty regime" },
      { id: "pause", title: "Pause ability" },
    ]);
    expect(a.technologies.map((t) => t.title)).toEqual([
      "Zero-knowledge proofs",
      "Secure enclaves",
    ]);
    expect(a.proposedIn).toEqual([{ id: "statement", title: "A statement" }]);
  });

  it("lists instruments per mitigation, sorted by title", () => {
    expect(g.instrumentsByMitigation.get("pause")!.map((i) => i.id)).toEqual([
      "allocation",
      "agreement",
    ]);
    expect(g.instrumentsByMitigation.get("treaty")!.map((i) => i.id)).toEqual([
      "agreement",
    ]);
  });

  it("deduplicates technologies reachable from a mitigation", () => {
    expect(g.technologiesByMitigation.get("pause")).toEqual([
      { id: "enclaves", title: "Secure enclaves" },
      { id: "zkp", title: "Zero-knowledge proofs" },
    ]);
  });

  it("inverts edges for technologies, keeping per-instrument notes", () => {
    const enclaves = g.technologies.get("enclaves")!;
    expect(enclaves.instruments).toEqual([
      { id: "allocation", title: "Allocation minimums", note: "counts FLOPs" },
      { id: "agreement", title: "Verification agreement", note: undefined },
    ]);
    expect(enclaves.mitigations).toEqual([
      { id: "pause", title: "Pause ability" },
      { id: "treaty", title: "Treaty regime" },
    ]);
    expect(g.technologies.get("unused")!.instruments).toEqual([]);
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";
import { filterCandidates } from "./filterCandidates.mjs";

const tracked = [
  { id: "hiroshima-ai-process", date: "2023-05-19", title: "Hiroshima AI Process launched", tags: [] },
];

const candidate = (over = {}) => ({
  title: "Add Canadian Compute Strategy",
  url: "https://example.gc.ca/compute",
  date: "2026-08-20",
  why: "No record with a matching title in data/",
  ...over,
});

describe("filterCandidates", () => {
  it("keeps a genuinely new candidate", () => {
    const out = filterCandidates({ candidates: [candidate()], tracked, reportedTitles: [] });
    expect(out).toHaveLength(1);
  });

  it("drops a candidate whose subject is already tracked in data/", () => {
    const out = filterCandidates({
      candidates: [candidate({ title: "Add Hiroshima AI Process" })],
      tracked,
      reportedTitles: [],
    });
    expect(out).toEqual([]);
  });

  it("drops a candidate already reported as an issue, including closed ones", () => {
    const out = filterCandidates({
      candidates: [candidate()],
      tracked,
      reportedTitles: ["Add Canadian Compute Strategy"],
    });
    expect(out).toEqual([]);
  });

  it("drops a candidate with no source URL", () => {
    const out = filterCandidates({ candidates: [candidate({ url: "" })], tracked, reportedTitles: [] });
    expect(out).toEqual([]);
  });

  it("caps output at five candidates", () => {
    const many = Array.from({ length: 12 }, (_, i) => candidate({ title: `Add thing ${i}` }));
    expect(filterCandidates({ candidates: many, tracked, reportedTitles: [] })).toHaveLength(5);
  });
});

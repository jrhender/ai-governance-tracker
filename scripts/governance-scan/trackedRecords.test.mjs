// @vitest-environment node
import { describe, it, expect } from "vitest";
import { loadTrackedRecords } from "./trackedRecords.mjs";
import { TAXONOMY_DIRS } from "./taxonomy.mjs";

const FIXTURES = "scripts/governance-scan/__fixtures__/data";

describe("loadTrackedRecords", () => {
  it("loads records from every subdirectory, sorted by id", async () => {
    const records = await loadTrackedRecords(FIXTURES);
    expect(records).toEqual([
      { id: "sample-event", date: "2026-01-15", title: "A sample event", tags: ["federal-government"] },
      { id: "sample-report", date: "2026-01-20", title: "A sample report", tags: ["think-tank"] },
    ]);
  });

  it("normalises dates to YYYY-MM-DD strings regardless of YAML parsing", async () => {
    const [first] = await loadTrackedRecords(FIXTURES);
    expect(typeof first.date).toBe("string");
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("loads the real data directory without throwing", async () => {
    const records = await loadTrackedRecords();
    expect(records.length).toBeGreaterThan(20);
    expect(records.every((r) => typeof r.id === "string" && r.id.length > 0)).toBe(true);
  });

  it("respects an ignore option to exclude subdirectories", async () => {
    const records = await loadTrackedRecords(FIXTURES, { ignore: [`${FIXTURES}/events/**`] });
    expect(records).toEqual([
      { id: "sample-report", date: "2026-01-20", title: "A sample report", tags: ["think-tank"] },
    ]);
  });

  // context.mjs and filter.mjs both call loadTrackedRecords("data", { ignore:
  // TAXONOMY_DIRS }) — this exercises that exact call shape against the real
  // data/ directory, so the two consumers cannot silently drift apart on
  // what "tracked" excludes.
  it("excludes data/risks and data/mitigations via the shared TAXONOMY_DIRS constant", async () => {
    const all = await loadTrackedRecords("data");
    const filtered = await loadTrackedRecords("data", { ignore: TAXONOMY_DIRS });

    // Sanity check: the id is present without the ignore option...
    expect(all.some((r) => r.id === "ai-biochemical-weapons-uplift")).toBe(true);
    // ...and absent with it, via the same constant both scripts import.
    expect(filtered.some((r) => r.id === "ai-biochemical-weapons-uplift")).toBe(false);
    expect(filtered.length).toBeLessThan(all.length);
  });
});

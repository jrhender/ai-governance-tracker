// @vitest-environment node
import { describe, it, expect } from "vitest";
import { loadTrackedRecords } from "./trackedRecords.mjs";

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
});

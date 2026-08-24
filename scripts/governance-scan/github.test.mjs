// @vitest-environment node
import { describe, it, expect } from "vitest";
import { since, lookbackDays } from "./github.mjs";

describe("lookbackDays", () => {
  it("defaults to 14 when unset", () => {
    expect(lookbackDays({})).toBe(14);
  });

  it("honours a deliberate override", () => {
    expect(lookbackDays({ LOOKBACK_DAYS: "180" })).toBe(180);
  });

  it("falls back to 14 on junk, zero or negative values rather than scanning nothing", () => {
    expect(lookbackDays({ LOOKBACK_DAYS: "" })).toBe(14);
    expect(lookbackDays({ LOOKBACK_DAYS: "abc" })).toBe(14);
    expect(lookbackDays({ LOOKBACK_DAYS: "0" })).toBe(14);
    expect(lookbackDays({ LOOKBACK_DAYS: "-5" })).toBe(14);
  });
});

describe("since", () => {
  it("returns a YYYY-MM-DD date", () => {
    expect(since(14)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reaches further back for a wider window", () => {
    expect(since(180) < since(14)).toBe(true);
  });
});

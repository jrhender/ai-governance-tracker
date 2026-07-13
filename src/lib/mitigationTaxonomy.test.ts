import { describe, it, expect } from "vitest";
import {
  MITIGATION_CATEGORIES,
  MITIGATION_CATEGORY_SLUGS,
  MITIGATION_STATUSES,
  MITIGATION_STATUS_SLUGS,
} from "./mitigationTaxonomy";

describe("MIT mitigation taxonomy", () => {
  it("has the 4 MIT control categories", () => {
    expect(Object.keys(MITIGATION_CATEGORIES).sort()).toEqual([
      "governance-oversight",
      "operational-process",
      "technical-security",
      "transparency-accountability",
    ]);
    expect([...MITIGATION_CATEGORY_SLUGS].sort()).toEqual(
      Object.keys(MITIGATION_CATEGORIES).sort(),
    );
  });

  it("has the 4 implementation statuses", () => {
    expect(Object.keys(MITIGATION_STATUSES).sort()).toEqual([
      "adopted",
      "rejected",
      "under_review",
      "untracked",
    ]);
    expect([...MITIGATION_STATUS_SLUGS].sort()).toEqual(
      Object.keys(MITIGATION_STATUSES).sort(),
    );
  });
});

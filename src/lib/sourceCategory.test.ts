import { describe, it, expect } from "vitest";
import { getSourceCategory } from "./sourceCategory";

describe("getSourceCategory", () => {
  it("returns 'government' when any org is GovernmentOrganization", () => {
    expect(getSourceCategory(["GovernmentOrganization"])).toBe("government");
  });

  it("returns 'government' when mixed org types include GovernmentOrganization", () => {
    expect(getSourceCategory(["Organization", "GovernmentOrganization"])).toBe("government");
  });

  it("returns 'civil_society' when all orgs are Organization", () => {
    expect(getSourceCategory(["Organization"])).toBe("civil_society");
  });

  it("returns 'civil_society' when array is empty", () => {
    expect(getSourceCategory([])).toBe("civil_society");
  });
});

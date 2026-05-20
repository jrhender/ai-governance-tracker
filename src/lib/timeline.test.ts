import { describe, it, expect } from "vitest";
import { filterByOrg, filterBySource, type TimelineItem } from "./timeline";
import type { SourceCategory } from "./sourceCategory";

function make(id: string, orgIds: string[], sourceCategory: SourceCategory = "government"): TimelineItem {
  return {
    id,
    kind: "event",
    title: id,
    date: "2026-01-01",
    tags: [],
    href: "#",
    badge: "Event",
    orgIds,
    orgs: [],
    links: [],
    sourceCategory,
  };
}

describe("filterByOrg", () => {
  const items: TimelineItem[] = [
    make("a", ["senate"]),
    make("b", ["senate", "indu"]),
    make("c", ["cigi"]),
  ];

  it("returns all items when orgId is null", () => {
    expect(filterByOrg(items, null)).toEqual(items);
  });

  it("returns [] when orgId is unknown", () => {
    expect(filterByOrg(items, "nope")).toEqual([]);
  });

  it("matches items whose orgIds includes the selected org (multi-org item)", () => {
    const result = filterByOrg(items, "indu");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("returns [] for empty input", () => {
    expect(filterByOrg([], "senate")).toEqual([]);
  });
});

describe("filterBySource", () => {
  const items: TimelineItem[] = [
    make("a", [], "government"),
    make("b", [], "civil_society"),
    make("c", [], "government"),
  ];

  it("returns all items when 'all' is selected", () => {
    expect(filterBySource(items, "all")).toEqual(items);
  });

  it("returns only government items", () => {
    const result = filterBySource(items, "government");
    expect(result.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("returns only civil_society items", () => {
    const result = filterBySource(items, "civil_society");
    expect(result.map((i) => i.id)).toEqual(["b"]);
  });

  it("returns [] for empty input", () => {
    expect(filterBySource([], "government")).toEqual([]);
  });
});

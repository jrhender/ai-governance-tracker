import { describe, it, expect } from "vitest";
import { filterByOrg, type TimelineItem } from "./timeline";

function make(id: string, orgIds: string[]): TimelineItem {
  return {
    id,
    kind: "event",
    title: id,
    date: "2026-01-01",
    tags: [],
    href: "#",
    badge: "Event",
    orgIds,
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

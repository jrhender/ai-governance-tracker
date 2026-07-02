import { describe, it, expect } from "vitest";
import {
  buildTimelineItems,
  filterByOrg,
  filterBySource,
  filterByJurisdiction,
  type EventInput,
  type OrgInput,
  type TimelineItem,
} from "./timeline";
import type { SourceCategory } from "./sourceCategory";
import type { Jurisdiction } from "./jurisdiction";

function make(
  id: string,
  orgIds: string[],
  sourceCategory: SourceCategory = "government",
  jurisdiction: Jurisdiction = "canada",
): TimelineItem {
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
    jurisdiction,
  };
}

describe("buildTimelineItems", () => {
  const orgs: OrgInput[] = [
    {
      id: "ised-canada",
      data: { name: "Innovation, Science and Economic Development Canada", short_name: "ISED", schema_type: "GovernmentOrganization" },
    },
    {
      id: "cigi",
      data: { name: "Centre for International Governance Innovation", schema_type: "Organization" },
    },
  ];

  function event(
    id: string,
    date: string,
    orgIds: string[],
    jurisdiction: Jurisdiction = "canada",
  ): EventInput {
    return {
      id,
      data: {
        title: `Title ${id}`,
        date: new Date(date),
        description: "desc",
        tags: ["t"],
        type: "GovernmentAnnouncement",
        organizations: orgIds.map((o) => ({ id: { id: o } })),
        links: [],
        jurisdiction,
      },
    };
  }

  it("sorts items newest first", () => {
    const items = buildTimelineItems(
      [event("a", "2017-03-22", ["ised-canada"]), event("b", "2022-06-16", ["ised-canada"])],
      orgs,
    );
    expect(items.map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("resolves org labels, preferring short_name and falling back to name", () => {
    const [item] = buildTimelineItems([event("a", "2017-03-22", ["ised-canada", "cigi"])], orgs);
    expect(item.orgs).toEqual([
      { id: "ised-canada", label: "ISED" },
      { id: "cigi", label: "Centre for International Governance Innovation" },
    ]);
  });

  it("falls back to the raw id for unknown organizations", () => {
    const [item] = buildTimelineItems([event("a", "2017-03-22", ["ghost"])], orgs);
    expect(item.orgs).toEqual([{ id: "ghost", label: "ghost" }]);
  });

  it("derives sourceCategory from any government org", () => {
    const [gov] = buildTimelineItems([event("a", "2017-03-22", ["cigi", "ised-canada"])], orgs);
    const [civil] = buildTimelineItems([event("b", "2017-03-22", ["cigi"])], orgs);
    expect(gov.sourceCategory).toBe("government");
    expect(civil.sourceCategory).toBe("civil_society");
  });

  it("passes jurisdiction through to the timeline item", () => {
    const [intl] = buildTimelineItems(
      [event("a", "2023-05-19", ["ised-canada"], "international")],
      orgs,
    );
    const [ca] = buildTimelineItems([event("b", "2023-05-19", ["ised-canada"])], orgs);
    expect(intl.jurisdiction).toBe("international");
    expect(ca.jurisdiction).toBe("canada");
  });

  it("builds the event href and flattened orgIds", () => {
    const [item] = buildTimelineItems([event("a", "2017-03-22", ["ised-canada", "cigi"])], orgs);
    expect(item.href).toBe("/events/a/");
    expect(item.orgIds).toEqual(["ised-canada", "cigi"]);
  });
});

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

describe("filterByJurisdiction", () => {
  const items: TimelineItem[] = [
    make("a", [], "government", "canada"),
    make("b", [], "government", "international"),
    make("c", [], "civil_society", "canada"),
  ];

  it("returns all items when 'all' is selected", () => {
    expect(filterByJurisdiction(items, "all")).toEqual(items);
  });

  it("returns only canadian items", () => {
    const result = filterByJurisdiction(items, "canada");
    expect(result.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("returns only international items", () => {
    const result = filterByJurisdiction(items, "international");
    expect(result.map((i) => i.id)).toEqual(["b"]);
  });

  it("returns [] for empty input", () => {
    expect(filterByJurisdiction([], "canada")).toEqual([]);
  });
});

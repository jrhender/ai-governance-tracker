import { describe, it, expect } from "vitest";
import { buildRssItems, type RssEvent, type RssArtifact } from "./rss";

const SITE = "https://ai-governance-tracker.com";

function makeEvent(overrides: Partial<RssEvent> = {}): RssEvent {
  return {
    id: "evt-1",
    title: "A Senate Hearing",
    date: new Date("2026-01-01"),
    description: "A short description.",
    ...overrides,
  };
}

function makeArtifact(overrides: Partial<RssArtifact> = {}): RssArtifact {
  return {
    id: "art-1",
    title: "A Report",
    date: new Date("2026-01-02"),
    description: "Report summary.",
    derivedFromEventIds: [],
    ...overrides,
  };
}

describe("buildRssItems", () => {
  it("includes all artifacts", () => {
    const items = buildRssItems([], [makeArtifact()], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Report");
  });

  it("includes events with no derived artifact", () => {
    const items = buildRssItems([makeEvent()], [], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Senate Hearing");
  });

  it("excludes events that are derived from by an artifact", () => {
    const event = makeEvent({ id: "evt-source" });
    const artifact = makeArtifact({ derivedFromEventIds: ["evt-source"] });
    const items = buildRssItems([event], [artifact], SITE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("A Report");
  });

  it("includes an event not referenced by any artifact when others are referenced", () => {
    const standalone = makeEvent({ id: "evt-standalone", title: "Standalone" });
    const referenced = makeEvent({ id: "evt-ref", title: "Referenced" });
    const artifact = makeArtifact({ derivedFromEventIds: ["evt-ref"] });
    const items = buildRssItems([standalone, referenced], [artifact], SITE);
    expect(items.map((i) => i.title)).toContain("Standalone");
    expect(items.map((i) => i.title)).not.toContain("Referenced");
  });

  it("sorts items descending by date", () => {
    const old = makeEvent({ id: "old", title: "Old", date: new Date("2025-01-01") });
    const recent = makeArtifact({ id: "new", title: "New", date: new Date("2026-06-01") });
    const items = buildRssItems([old], [recent], SITE);
    expect(items[0].title).toBe("New");
    expect(items[1].title).toBe("Old");
  });

  it("sets event link to /events/<id>/", () => {
    const items = buildRssItems([makeEvent({ id: "my-event" })], [], SITE);
    expect(items[0].link).toBe(`${SITE}/events/my-event/`);
  });

  it("sets artifact link to /artifacts/<id>/", () => {
    const items = buildRssItems([], [makeArtifact({ id: "my-artifact" })], SITE);
    expect(items[0].link).toBe(`${SITE}/artifacts/my-artifact/`);
  });

  it("truncates description longer than 300 chars and appends ellipsis", () => {
    const long = "x".repeat(350);
    const items = buildRssItems([makeEvent({ description: long })], [], SITE);
    expect(items[0].description.length).toBeLessThanOrEqual(301); // 300 chars + "…"
    expect(items[0].description.endsWith("…")).toBe(true);
  });

  it("does not truncate description of exactly 300 chars", () => {
    const exact = "y".repeat(300);
    const items = buildRssItems([makeEvent({ description: exact })], [], SITE);
    expect(items[0].description).toBe(exact);
  });

  it("uses title as description fallback when description is undefined", () => {
    const items = buildRssItems([makeEvent({ description: undefined })], [], SITE);
    expect(items[0].description).toBe("A Senate Hearing");
  });

  it("returns empty array when given no events or artifacts", () => {
    expect(buildRssItems([], [], SITE)).toEqual([]);
  });
});

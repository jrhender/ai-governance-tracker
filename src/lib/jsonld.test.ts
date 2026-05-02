import { describe, it, expect } from "vitest";
import { buildEventJsonLd, buildCreativeWorkJsonLd, buildOrgJsonLd } from "./jsonld";

describe("buildEventJsonLd", () => {
  it("sets context, type, name, startDate, url", () => {
    const result = buildEventJsonLd({
      title: "Test Event",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/test/",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Event");
    expect(result.name).toBe("Test Event");
    expect(result.startDate).toBe("2023-01-01T00:00:00.000Z");
    expect(result.url).toBe("https://ai-governance-tracker.com/events/test/");
  });

  it("omits description when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("description" in result).toBe(false);
  });

  it("includes description when provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      description: "A test event",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.description).toBe("A test event");
  });

  it("omits location when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("location" in result).toBe(false);
  });

  it("includes location as Place when provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      location: "Ottawa, ON",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.location).toEqual({ "@type": "Place", name: "Ottawa, ON" });
  });

  it("includes organizer array from orgs", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "Senate of Canada", url: "https://senate.ca" }],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect(result.organizer).toEqual([
      { "@type": "Organization", name: "Senate of Canada", url: "https://senate.ca" },
    ]);
  });

  it("omits url from organizer entry when not provided", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "Senate of Canada" }],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    const organizer = result.organizer as Array<Record<string, unknown>>;
    expect("url" in organizer[0]).toBe(false);
  });

  it("omits organizer key when orgs is empty", () => {
    const result = buildEventJsonLd({
      title: "T",
      startDate: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/events/t/",
    });
    expect("organizer" in result).toBe(false);
  });
});

describe("buildCreativeWorkJsonLd", () => {
  it("sets context, type, name, datePublished, url", () => {
    const result = buildCreativeWorkJsonLd({
      title: "Test Report",
      datePublished: "2023-06-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/test/",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("CreativeWork");
    expect(result.name).toBe("Test Report");
    expect(result.datePublished).toBe("2023-06-01T00:00:00.000Z");
    expect(result.url).toBe("https://ai-governance-tracker.com/artifacts/test/");
  });

  it("omits description when not provided", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect("description" in result).toBe(false);
  });

  it("includes description when provided", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      description: "A policy document",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect(result.description).toBe("A policy document");
  });

  it("includes author array from orgs", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [{ name: "CIGI", url: "https://www.cigionline.org" }],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect(result.author).toEqual([
      { "@type": "Organization", name: "CIGI", url: "https://www.cigionline.org" },
    ]);
  });

  it("omits author key when orgs is empty", () => {
    const result = buildCreativeWorkJsonLd({
      title: "T",
      datePublished: "2023-01-01T00:00:00.000Z",
      orgs: [],
      url: "https://ai-governance-tracker.com/artifacts/t/",
    });
    expect("author" in result).toBe(false);
  });
});

describe("buildOrgJsonLd", () => {
  it("sets context, type, name", () => {
    const result = buildOrgJsonLd({
      name: "Senate of Canada",
      schemaType: "GovernmentOrganization",
    });
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("GovernmentOrganization");
    expect(result.name).toBe("Senate of Canada");
  });

  it("omits url when not provided", () => {
    const result = buildOrgJsonLd({ name: "N", schemaType: "Organization" });
    expect("url" in result).toBe(false);
  });

  it("includes url when provided", () => {
    const result = buildOrgJsonLd({
      name: "CIGI",
      schemaType: "Organization",
      url: "https://www.cigionline.org",
    });
    expect(result.url).toBe("https://www.cigionline.org");
  });

  it("omits sameAs when not provided", () => {
    const result = buildOrgJsonLd({ name: "N", schemaType: "Organization" });
    expect("sameAs" in result).toBe(false);
  });

  it("includes sameAs when wikipedia provided", () => {
    const result = buildOrgJsonLd({
      name: "Senate",
      schemaType: "GovernmentOrganization",
      sameAs: "https://en.wikipedia.org/wiki/Senate_of_Canada",
    });
    expect(result.sameAs).toBe("https://en.wikipedia.org/wiki/Senate_of_Canada");
  });
});

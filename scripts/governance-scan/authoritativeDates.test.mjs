// @vitest-environment node
import { describe, it, expect } from "vitest";
import { applyAuthoritativeDates } from "./authoritativeDates.mjs";

const feedItems = [
  { title: "AI transparency consultation", url: "https://a.test/news/ai-transparency", published: "2026-07-23" },
  { title: "CIFAR $24M", url: "https://cifar.ca/news/24m/", published: "2026-05-21" },
];

const cand = (over = {}) => ({ title: "Add x", url: "https://a.test/news/ai-transparency", date: "2026-07-23", why: "w", ...over });

describe("applyAuthoritativeDates", () => {
  it("overwrites a wrong agent date with the feed's — the real observed failure", () => {
    // The agent reported 2026-07-24 on two of three runs; the feed says 07-23.
    const { candidates } = applyAuthoritativeDates([cand({ date: "2026-07-24" })], feedItems);
    expect(candidates[0].date).toBe("2026-07-23");
  });

  it("reports the mismatch so a systematic misread is visible", () => {
    const { mismatches } = applyAuthoritativeDates([cand({ date: "2026-07-24" })], feedItems);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toMatchObject({ url: "https://a.test/news/ai-transparency", agent: "2026-07-24", feed: "2026-07-23" });
  });

  it("leaves a correct date alone and reports no mismatch", () => {
    const { candidates, mismatches } = applyAuthoritativeDates([cand()], feedItems);
    expect(candidates[0].date).toBe("2026-07-23");
    expect(mismatches).toEqual([]);
  });

  it("leaves candidates from html sources untouched — there is nothing authoritative to use", () => {
    const html = cand({ url: "https://indu.test/meeting-45", date: "2026-06-15" });
    const { candidates, mismatches } = applyAuthoritativeDates([html], feedItems);
    expect(candidates[0].date).toBe("2026-06-15");
    expect(mismatches).toEqual([]);
  });

  it("ignores a feed item with no date rather than blanking the agent's", () => {
    const { candidates } = applyAuthoritativeDates([cand({ date: "2026-07-24" })], [{ url: "https://a.test/news/ai-transparency", published: null }]);
    expect(candidates[0].date).toBe("2026-07-24");
  });

  it("matches urls ignoring a trailing slash and query noise", () => {
    const { candidates } = applyAuthoritativeDates(
      [cand({ url: "https://cifar.ca/news/24m?utm_source=x", date: "2026-05-01" })],
      feedItems,
    );
    expect(candidates[0].date).toBe("2026-05-21");
  });

  it("handles an empty feed list without touching anything", () => {
    const { candidates, mismatches } = applyAuthoritativeDates([cand({ date: "2026-01-01" })], []);
    expect(candidates[0].date).toBe("2026-01-01");
    expect(mismatches).toEqual([]);
  });
});

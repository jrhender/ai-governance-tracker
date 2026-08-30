// @vitest-environment node
//
// Guards on .github/sources.yaml and the agent prompt. Both are prose-ish
// files with no compiler behind them, and both have silently broken a run.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const sources = parse(readFileSync(".github/sources.yaml", "utf8")).sources;
const prompt = readFileSync(".github/prompts/governance-scan.md", "utf8");

describe("sources.yaml", () => {
  it("gives every source an id, name, url and look_for", () => {
    for (const s of sources) {
      expect(s.id, JSON.stringify(s)).toBeTruthy();
      expect(s.name, s.id).toBeTruthy();
      expect(s.url, s.id).toBeTruthy();
      expect(s.look_for, s.id).toBeTruthy();
    }
  });

  it("keeps ids unique — they name the cache files", () => {
    const ids = sources.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses https everywhere, including feeds", () => {
    for (const s of sources) {
      expect(s.url.startsWith("https://"), s.id).toBe(true);
      for (const f of s.feeds ?? []) expect(f.startsWith("https://"), `${s.id} feed`).toBe(true);
    }
  });

  it("keeps enough sources to clear the coverage floor with room to spare", () => {
    // aigs and cigi are permanently Cloudflare-blocked, and MIN_SOURCES_OK is 5.
    expect(sources.length).toBeGreaterThanOrEqual(7);
  });
});

describe("agent prompt", () => {
  it("does not hardcode the issue cap", () => {
    // Regression: the prompt said "Maximum 5 issues per run", so a catch-up run
    // dispatched with max_issues=25 still self-limited to 5 and every run
    // surfaced a different arbitrary five.
    expect(prompt).not.toMatch(/Maximum 5 issues/i);
    expect(prompt).toMatch(/maxIssues/);
  });

  it("still forbids fetching and shell retrieval", () => {
    expect(prompt).toMatch(/WebFetch/);
    expect(prompt).toMatch(/curl/);
  });

  it("still requires a source url on every filed issue", () => {
    expect(prompt).toMatch(/Never file a lead without a source URL/i);
  });

  it("tells the agent to copy feed dates verbatim rather than infer them", () => {
    // Regression: dates were read out of stripped prose and got misreported.
    expect(prompt).toMatch(/published/);
    expect(prompt).toMatch(/verbatim/i);
  });
});

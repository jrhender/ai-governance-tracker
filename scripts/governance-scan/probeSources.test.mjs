// @vitest-environment node
import { describe, it, expect } from "vitest";
import { probeUrl, formatResults, allReachable } from "./probeSources.mjs";

const res = (over = {}) => ({ url: "https://x.test/", status: 200, ok: true, finalUrl: "https://x.test/", bytes: 100, ms: 5, ...over });

describe("probeUrl", () => {
  it("reports ok for a 200 with a body", async () => {
    const fetchImpl = async () => ({ status: 200, ok: true, url: "https://x.test/", text: async () => "hello" });
    expect(await probeUrl("https://x.test/", { fetchImpl })).toMatchObject({ status: 200, ok: true, bytes: 5 });
  });

  it("reports not-ok for a 403 — the case that broke the first live run", async () => {
    const fetchImpl = async () => ({ status: 403, ok: false, url: "https://x.test/", text: async () => "denied" });
    expect(await probeUrl("https://x.test/", { fetchImpl })).toMatchObject({ status: 403, ok: false });
  });

  it("treats a 200 with an empty body as not ok", async () => {
    const fetchImpl = async () => ({ status: 200, ok: true, url: "https://x.test/", text: async () => "   " });
    expect((await probeUrl("https://x.test/", { fetchImpl })).ok).toBe(false);
  });

  it("records a redirect target rather than the requested url", async () => {
    const fetchImpl = async () => ({ status: 200, ok: true, url: "https://x.test/splash", text: async () => "hi" });
    expect((await probeUrl("https://x.test/", { fetchImpl })).finalUrl).toBe("https://x.test/splash");
  });

  it("never throws — a network error becomes a failed result", async () => {
    const fetchImpl = async () => { throw new Error("ECONNREFUSED"); };
    expect(await probeUrl("https://x.test/", { fetchImpl })).toMatchObject({ ok: false, status: 0, error: "ECONNREFUSED" });
  });
});

describe("formatResults / allReachable", () => {
  it("marks failures visibly and shows redirects", () => {
    const out = formatResults([res(), res({ url: "https://y.test/", ok: false, status: 403 }), res({ finalUrl: "https://x.test/other" })]);
    expect(out).toContain("OK  ");
    expect(out).toContain("FAIL");
    expect(out).toContain("-> https://x.test/other");
  });

  it("is false when any probe failed, and false for an empty list", () => {
    expect(allReachable([res(), res({ ok: false })])).toBe(false);
    expect(allReachable([res()])).toBe(true);
    expect(allReachable([])).toBe(false);
  });
});

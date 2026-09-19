// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { checkUrl, fetchAllowed, parseArgs } from "./fetch-url.mjs";

const hosts = ["www.canada.ca", "cifar.ca"];

/** A fetch stub serving canned responses by url; records every request. */
function stubFetch(routes) {
  const calls = [];
  const fetchImpl = vi.fn(async (url, init) => {
    calls.push({ url, init });
    const r = routes[url];
    if (!r) throw new Error(`unexpected request to ${url}`);
    return new Response(r.body ?? "", { status: r.status ?? 200, headers: r.headers ?? {} });
  });
  return { fetchImpl, calls };
}

describe("checkUrl", () => {
  it("accepts https urls on an allowed host", () => {
    expect(checkUrl("https://www.canada.ca/en/news.html", hosts).href).toBe("https://www.canada.ca/en/news.html");
  });

  it("matches hosts case-insensitively and ignores a trailing dot", () => {
    expect(checkUrl("https://WWW.Canada.CA./en.html", hosts).hostname).toBe("www.canada.ca");
  });

  it.each([
    ["an unlisted host", "https://evil.example/"],
    ["a lookalike suffix", "https://www.canada.ca.evil.example/"],
    ["a lookalike prefix", "https://evilcifar.ca/"],
    ["a subdomain of an allowed host", "https://api.cifar.ca/"],
    ["plain http", "http://www.canada.ca/"],
    ["embedded credentials", "https://user:pass@www.canada.ca/"],
    ["a non-default port", "https://www.canada.ca:8443/"],
    ["garbage", "not a url"],
  ])("rejects %s", (_label, url) => {
    expect(() => checkUrl(url, hosts)).toThrow();
  });
});

describe("fetchAllowed", () => {
  it("returns stripped text for html pages", async () => {
    const { fetchImpl } = stubFetch({
      "https://www.canada.ca/a": {
        body: "<html><script>var x=1</script><p>Minister&nbsp;Solomon announced</p></html>",
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    });
    const r = await fetchAllowed("https://www.canada.ca/a", { hosts, fetchImpl });
    expect(r).toMatchObject({ url: "https://www.canada.ca/a", status: 200, ok: true });
    expect(r.text).toBe("Minister Solomon announced");
  });

  it("returns non-html bodies (feeds, json) untouched", async () => {
    const xml = `<feed><entry><link href="https://cifar.ca/x"/></entry></feed>`;
    const { fetchImpl } = stubFetch({ "https://cifar.ca/feed/": { body: xml, headers: { "content-type": "application/rss+xml" } } });
    const r = await fetchAllowed("https://cifar.ca/feed/", { hosts, fetchImpl });
    expect(r.text).toBe(xml);
  });

  it("only ever sends a plain GET with no body", async () => {
    const { fetchImpl, calls } = stubFetch({ "https://cifar.ca/": { body: "hi" } });
    await fetchAllowed("https://cifar.ca/", { hosts, fetchImpl });
    expect(calls[0].init.method ?? "GET").toBe("GET");
    expect(calls[0].init.body).toBeUndefined();
    // Redirects are followed by hand so every hop is checked against the list.
    expect(calls[0].init.redirect).toBe("manual");
  });

  it("follows redirects that stay on allowed hosts", async () => {
    const { fetchImpl } = stubFetch({
      "https://www.canada.ca/old": { status: 301, headers: { location: "/new" } },
      "https://www.canada.ca/new": { status: 302, headers: { location: "https://cifar.ca/final" } },
      "https://cifar.ca/final": { body: "landed" },
    });
    const r = await fetchAllowed("https://www.canada.ca/old", { hosts, fetchImpl });
    expect(r).toMatchObject({ url: "https://cifar.ca/final", text: "landed" });
  });

  it("refuses a redirect to an unlisted host without requesting it", async () => {
    const { fetchImpl, calls } = stubFetch({
      "https://www.canada.ca/out": { status: 302, headers: { location: "https://evil.example/collect" } },
    });
    await expect(fetchAllowed("https://www.canada.ca/out", { hosts, fetchImpl })).rejects.toThrow(/evil\.example/);
    expect(calls.map((c) => c.url)).toEqual(["https://www.canada.ca/out"]);
  });

  it("refuses a disallowed starting url without any request", async () => {
    const { fetchImpl } = stubFetch({});
    await expect(fetchAllowed("https://evil.example/", { hosts, fetchImpl })).rejects.toThrow(/not an allowed host/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("gives up on redirect loops", async () => {
    const { fetchImpl } = stubFetch({
      "https://cifar.ca/a": { status: 301, headers: { location: "https://cifar.ca/b" } },
      "https://cifar.ca/b": { status: 301, headers: { location: "https://cifar.ca/a" } },
    });
    await expect(fetchAllowed("https://cifar.ca/a", { hosts, fetchImpl })).rejects.toThrow(/redirects/);
  });

  it("reports a non-2xx status instead of throwing", async () => {
    const { fetchImpl } = stubFetch({ "https://cifar.ca/missing": { status: 404, body: "not found" } });
    const r = await fetchAllowed("https://cifar.ca/missing", { hosts, fetchImpl });
    expect(r).toMatchObject({ status: 404, ok: false });
  });
});

describe("parseArgs", () => {
  it("takes exactly one url", () => {
    expect(parseArgs(["https://cifar.ca/"])).toBe("https://cifar.ca/");
  });

  it.each([[[]], [["https://cifar.ca/", "https://evil.example/"]], [["-d", "https://cifar.ca/"]]])(
    "rejects %j",
    (argv) => {
      expect(() => parseArgs(argv)).toThrow(/usage/i);
    },
  );
});

describe("self-containment", () => {
  it("imports nothing but node built-ins, since it runs as a lone copy outside the workspace", () => {
    const src = readFileSync(new URL("./fetch-url.mjs", import.meta.url), "utf8");
    const specifiers = [...src.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/g)].map((m) => m[1] ?? m[2]);
    expect(specifiers.length).toBeGreaterThan(0);
    for (const s of specifiers) expect(s, s).toMatch(/^node:/);
  });
});

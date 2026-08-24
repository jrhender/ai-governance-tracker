// @vitest-environment node
import { describe, it, expect } from "vitest";
import { extractText, fetchWithFallback } from "./fetchSources.mjs";

const ok = (body, url) => async () => ({ ok: true, status: 200, url, text: async () => body });
const code = (status, body = "blocked") => async () => ({ ok: status < 400, status, url: "", text: async () => body });

describe("extractText", () => {
  it("drops script and style content, not just the tags", () => {
    const out = extractText("<style>.a{color:red}</style><script>var x=1</script><p>Bill C-27</p>");
    expect(out).toBe("Bill C-27");
  });

  it("decodes the entities that appear in government feeds", () => {
    expect(extractText("<p>AI &amp; Data &quot;Act&quot;</p>")).toBe('AI & Data "Act"');
  });

  it("truncates oversized pages with a visible marker", () => {
    const out = extractText("<p>" + "x".repeat(500) + "</p>", { maxChars: 100 });
    expect(out).toHaveLength(100 + "\n\n[truncated]".length);
    expect(out.endsWith("[truncated]")).toBe(true);
  });
});

describe("fetchWithFallback", () => {
  it("prefers a feed over the page url", async () => {
    const src = { id: "s", url: "https://a.test/page", feeds: ["https://a.test/feed"] };
    const r = await fetchWithFallback(src, { fetchImpl: ok("<item>hi</item>", "https://a.test/feed") });
    expect(r).toMatchObject({ ok: true, usedUrl: "https://a.test/feed" });
  });

  it("falls through to the next candidate when one 403s", async () => {
    const src = { id: "s", url: "https://a.test/page", feeds: ["https://a.test/feed"] };
    let n = 0;
    const fetchImpl = async (u) => (n++ === 0 ? code(403)() : ok("<p>real</p>", u)());
    const r = await fetchWithFallback(src, { fetchImpl });
    expect(r.ok).toBe(true);
    expect(r.usedUrl).toBe("https://a.test/page");
    expect(r.attempts[0]).toMatchObject({ status: 403 });
  });

  it("rejects a 200 that redirected somewhere unrelated — the CAISI splash case", async () => {
    const src = { id: "caisi", url: "https://x.test/site/ised/en/ai-safety-institute" };
    const fetchImpl = ok("<p>generic</p>", "https://x.test/site/ised/");
    const r = await fetchWithFallback(src, { fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.attempts[0].redirectedAway).toBe(true);
  });

  it("accepts a redirect that stays under the same path", async () => {
    const src = { id: "s", url: "https://x.test/a/b" };
    const r = await fetchWithFallback(src, { fetchImpl: ok("<p>hi</p>", "https://x.test/a/b-final") });
    expect(r.ok).toBe(true);
  });

  it("treats an empty 200 as a failure", async () => {
    const r = await fetchWithFallback({ id: "s", url: "https://a.test/" }, { fetchImpl: ok("   ", "https://a.test/") });
    expect(r.ok).toBe(false);
  });

  it("reports failure with every attempt recorded when all candidates fail", async () => {
    const src = { id: "aigs", url: "https://aigs.test/", feeds: ["https://aigs.test/feed/"] };
    const r = await fetchWithFallback(src, { fetchImpl: code(403) });
    expect(r).toMatchObject({ ok: false, usedUrl: null });
    expect(r.attempts).toHaveLength(2);
  });

  it("never throws on a network error", async () => {
    const fetchImpl = async () => { throw new Error("ENOTFOUND"); };
    const r = await fetchWithFallback({ id: "s", url: "https://a.test/" }, { fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.attempts[0].error).toBe("ENOTFOUND");
  });
});

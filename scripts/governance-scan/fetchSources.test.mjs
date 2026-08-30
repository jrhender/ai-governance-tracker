// @vitest-environment node
import { describe, it, expect } from "vitest";
import { extractText, fetchWithFallback, expandPlaceholders } from "./fetchSources.mjs";

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
    const r = await fetchWithFallback(src, { fetchImpl: ok("<item>hi</item>", "https://a.test/feed"), minChars: 1 });
    expect(r).toMatchObject({ ok: true, usedUrl: "https://a.test/feed" });
  });

  it("falls through to the next candidate when one 403s", async () => {
    const src = { id: "s", url: "https://a.test/page", feeds: ["https://a.test/feed"] };
    let n = 0;
    const fetchImpl = async (u) => (n++ === 0 ? code(403)() : ok("<p>real</p>", u)());
    const r = await fetchWithFallback(src, { fetchImpl, minChars: 1 });
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
    const r = await fetchWithFallback(src, { fetchImpl: ok("<p>hi</p>", "https://x.test/a/b-final"), minChars: 1 });
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

describe("minimum content threshold", () => {
  const long = (n) => "<p>" + "word ".repeat(n) + "</p>";

  it("rejects a 200 whose stripped text is too thin — the pm.gc.ca case", async () => {
    const r = await fetchWithFallback({ id: "pm", url: "https://pm.test/news" }, { fetchImpl: ok(long(100), "https://pm.test/news") });
    expect(r.ok).toBe(false);
    expect(r.attempts[0].tooThin).toBe(true);
  });

  it("accepts a page above the threshold", async () => {
    const r = await fetchWithFallback({ id: "x", url: "https://x.test/" }, { fetchImpl: ok(long(1000), "https://x.test/") });
    expect(r.ok).toBe(true);
  });

  it("honours a per-source override for a legitimately terse feed", async () => {
    const src = { id: "x", url: "https://x.test/", min_chars: 100 };
    const r = await fetchWithFallback(src, { fetchImpl: ok(long(40), "https://x.test/") });
    expect(r.ok).toBe(true);
  });

  it("falls through to the next candidate when the first is too thin", async () => {
    const src = { id: "x", url: "https://x.test/page", feeds: ["https://x.test/feed"] };
    let n = 0;
    const fetchImpl = async (u) => (n++ === 0 ? ok(long(10), u)() : ok(long(1000), u)());
    const r = await fetchWithFallback(src, { fetchImpl });
    expect(r.ok).toBe(true);
    expect(r.usedUrl).toBe("https://x.test/page");
  });
});

describe("expandPlaceholders", () => {
  it("substitutes the lookback start date", () => {
    expect(expandPlaceholders("https://a.test/?publishedDate>={since}&pick=100", { since: "2026-03-01" }))
      .toBe("https://a.test/?publishedDate>=2026-03-01&pick=100");
  });

  it("strips the whole date filter when no since is given, rather than leaving a broken url", () => {
    expect(expandPlaceholders("https://a.test/?dept=x&publishedDate>={since}&pick=100", { since: null }))
      .toBe("https://a.test/?dept=x&pick=100");
  });

  it("leaves a url without placeholders untouched", () => {
    expect(expandPlaceholders("https://a.test/feed", { since: "2026-03-01" })).toBe("https://a.test/feed");
  });
});

describe("feed sources", () => {
  const atom = `<feed xmlns="http://www.w3.org/2005/Atom"><entry>
    <title>AI transparency consultation</title>
    <link rel="alternate" href="https://a.test/news/ai-transparency"/>
    <published>2026-07-23T14:00:30-04:00</published>
  </entry></feed>`;

  const feedFetch = (body) => async (u) => ({
    ok: true, status: 200, url: u,
    headers: { get: () => "application/atom+xml" },
    text: async () => body,
  });

  it("returns structured items instead of stripped prose", async () => {
    const r = await fetchWithFallback({ id: "ised", url: "https://a.test/feed" }, { fetchImpl: feedFetch(atom) });
    expect(r.format).toBe("feed");
    expect(r.items).toHaveLength(1);
    expect(r.items[0].published).toBe("2026-07-23");
    expect(r.text).toBe("");
  });

  it("does not apply the thin-content threshold to feeds", async () => {
    // A one-item feed is far under minChars but is a perfectly good fetch.
    const r = await fetchWithFallback({ id: "ised", url: "https://a.test/feed" }, { fetchImpl: feedFetch(atom) });
    expect(r.ok).toBe(true);
  });

  it("treats an unparseable feed as a failed attempt, not a thin page", async () => {
    const junk = `<feed xmlns="http://www.w3.org/2005/Atom"></feed>`;
    const r = await fetchWithFallback({ id: "x", url: "https://a.test/feed" }, { fetchImpl: feedFetch(junk) });
    expect(r.ok).toBe(false);
    expect(r.attempts[0].unparseableFeed).toBe(true);
  });

  it("falls through from an unparseable feed to the page url", async () => {
    const src = { id: "x", url: "https://a.test/page", feeds: ["https://a.test/feed"] };
    let n = 0;
    const fetchImpl = async (u) =>
      n++ === 0
        ? { ok: true, status: 200, url: u, headers: { get: () => "application/atom+xml" }, text: async () => "<feed></feed>" }
        : { ok: true, status: 200, url: u, headers: { get: () => "text/html" }, text: async () => "<p>" + "word ".repeat(1000) + "</p>" };
    const r = await fetchWithFallback(src, { fetchImpl });
    expect(r.ok).toBe(true);
    expect(r.format).toBe("html");
    expect(r.usedUrl).toBe("https://a.test/page");
  });

  it("marks a plain html source as html", async () => {
    const r = await fetchWithFallback({ id: "h", url: "https://a.test/" }, { fetchImpl: ok("<p>" + "word ".repeat(1000) + "</p>", "https://a.test/") });
    expect(r.format).toBe("html");
    expect(r.items).toEqual([]);
  });
});

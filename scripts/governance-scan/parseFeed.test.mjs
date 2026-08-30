// @vitest-environment node
import { describe, it, expect } from "vitest";
import { looksLikeFeed, parseFeed } from "./parseFeed.mjs";

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>ISED news</title>
  <entry>
    <title>Government of Canada launches public consultation on AI transparency</title>
    <link rel="alternate" href="https://www.canada.ca/en/x/news/2026/07/ai-transparency.html"/>
    <published>2026-07-23T14:00:30-04:00</published>
    <summary>Public feedback will help shape next steps.</summary>
  </entry>
  <entry>
    <title>Second item &amp; friends</title>
    <link rel="alternate" href="https://www.canada.ca/en/x/news/2026/06/second.html"/>
    <updated>2026-06-02T09:00:00-04:00</updated>
  </entry>
</feed>`;

const rss = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>CIFAR</title>
  <item>
    <title><![CDATA[Government of Canada and CIFAR announce $24M]]></title>
    <link>https://cifar.ca/cifarnews/2026/05/21/24m/</link>
    <pubDate>Thu, 21 May 2026 13:00:00 +0000</pubDate>
    <description><![CDATA[<p>At the Upper Bound conference.</p>]]></description>
  </item>
</channel></rss>`;

describe("looksLikeFeed", () => {
  it("detects atom and rss by root element", () => {
    expect(looksLikeFeed(atom, "")).toBe(true);
    expect(looksLikeFeed(rss, "")).toBe(true);
  });

  it("detects by content-type even when the body sniff would be ambiguous", () => {
    expect(looksLikeFeed("<html></html>", "application/atom+xml; charset=utf-8")).toBe(true);
    expect(looksLikeFeed("<html></html>", "application/rss+xml")).toBe(true);
  });

  it("does not mistake html for a feed", () => {
    expect(looksLikeFeed("<!doctype html><html><body>news</body></html>", "text/html")).toBe(false);
  });
});

describe("parseFeed — atom", () => {
  it("extracts the published date verbatim as YYYY-MM-DD", () => {
    // The regression: the agent read this item as 2026-07-24 on two of three
    // runs. The feed says 07-23 and that is what must come out.
    const items = parseFeed(atom);
    expect(items[0].published).toBe("2026-07-23");
  });

  it("extracts title and the alternate link href", () => {
    const [first] = parseFeed(atom);
    expect(first.title).toBe("Government of Canada launches public consultation on AI transparency");
    expect(first.url).toBe("https://www.canada.ca/en/x/news/2026/07/ai-transparency.html");
  });

  it("falls back to updated when published is absent", () => {
    expect(parseFeed(atom)[1].published).toBe("2026-06-02");
  });

  it("decodes escaped entities in titles", () => {
    expect(parseFeed(atom)[1].title).toBe("Second item & friends");
  });
});

describe("parseFeed — rss", () => {
  it("reads CDATA titles and rfc-822 pubDate", () => {
    const [item] = parseFeed(rss);
    expect(item.title).toBe("Government of Canada and CIFAR announce $24M");
    expect(item.published).toBe("2026-05-21");
    expect(item.url).toBe("https://cifar.ca/cifarnews/2026/05/21/24m/");
  });

  it("strips markup out of CDATA descriptions", () => {
    expect(parseFeed(rss)[0].summary).toBe("At the Upper Bound conference.");
  });
});

describe("parseFeed — robustness", () => {
  it("returns an empty array for something that is not a feed", () => {
    expect(parseFeed("<html><body>nope</body></html>")).toEqual([]);
  });

  it("does not throw on malformed xml", () => {
    expect(() => parseFeed("<feed><entry><title>unclosed")).not.toThrow();
  });

  it("skips entries with no usable url rather than emitting a dateless stub", () => {
    const noLink = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>x</title><published>2026-01-01T00:00:00Z</published></entry></feed>`;
    expect(parseFeed(noLink)).toEqual([]);
  });

  it("leaves published null when no date is present, rather than inventing one", () => {
    const noDate = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>x</title><link href="https://a.test/x"/></entry></feed>`;
    expect(parseFeed(noDate)[0].published).toBeNull();
  });
});

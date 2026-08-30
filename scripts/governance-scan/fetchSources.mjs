// Deterministic source fetching, done by the workflow rather than the agent.
//
// The first live run showed the agent's WebFetch getting HTTP 403 from
// canada.ca while plain HTTP from the same runner got 200. Fetching here means
// coverage is MEASURED rather than self-reported, and the agent needs no
// fetch tool at all — which also removes any path for an injected page to
// direct an arbitrary outbound request.

import { looksLikeFeed, parseFeed } from "./parseFeed.mjs";

const MAX_CHARS = 150_000;
// Feed sources are truncated by dropping whole items, never by slicing
// characters, so the emitted json is always valid.
const MAX_ITEMS = 200;

// A 200 with a body is too weak a success bar. pm.gc.ca returned HTTP 200 and
// 1071 characters of stripped text for a news-releases index — technically a
// success, practically useless, and it counted toward coverage while carrying
// no news. Anything under this is treated as a failed fetch.
const MIN_CHARS = 2000;

/** Strip markup down to readable text. Feeds and news pages are mostly chrome. */
export function extractText(html, { maxChars = MAX_CHARS } = {}) {
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return text.length > maxChars ? text.slice(0, maxChars) + "\n\n[truncated]" : text;
}

/**
 * Try each candidate url in order, first success wins. A source may list
 * `feeds` (machine-readable, preferred) and always has `url` as the fallback.
 */
export async function fetchWithFallback(source, { fetchImpl = fetch, timeoutMs = 20000, since = null, minChars = source.min_chars ?? MIN_CHARS } = {}) {
  const candidates = [...(source.feeds ?? []), source.url].filter(Boolean).map((u) => expandPlaceholders(u, { since }));
  const attempts = [];

  for (const url of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: controller.signal, redirect: "follow" });
      const body = await res.text();
      const finalUrl = res.url || url;
      // A 200 that redirected somewhere unrelated is not a success — CAISI's
      // stale url returned 200 while landing on a generic ISED splash page.
      const redirectedAway = finalUrl !== url && !finalUrl.startsWith(stripPath(url));
      const contentType = res.headers?.get?.("content-type") ?? "";

      if (!redirectedAway && res.ok && looksLikeFeed(body, contentType)) {
        const items = parseFeed(body).slice(0, MAX_ITEMS);
        if (items.length > 0) {
          return { id: source.id, ok: true, usedUrl: url, finalUrl, status: res.status, format: "feed", items, text: "", attempts };
        }
        // A feed we cannot parse is a failed fetch, not a thin page — say so.
        attempts.push({ url, status: res.status, bytes: body.length, unparseableFeed: true, finalUrl });
        continue;
      }

      const text = extractText(body);
      const tooThin = text.length < minChars;
      if (res.ok && !redirectedAway && !tooThin) {
        return { id: source.id, ok: true, usedUrl: url, finalUrl, status: res.status, format: "html", items: [], text, attempts };
      }
      attempts.push({ url, status: res.status, bytes: body.length, chars: text.length, redirectedAway, tooThin, finalUrl });
    } catch (err) {
      attempts.push({ url, status: 0, error: err.name === "AbortError" ? "timeout" : err.message });
    } finally {
      clearTimeout(timer);
    }
  }

  return { id: source.id, ok: false, usedUrl: null, status: 0, format: null, items: [], text: "", attempts };
}

/**
 * Substitute `{since}` in a url with the lookback start date.
 *
 * Feeds hand back only their most recent N items, so a wide LOOKBACK_DAYS does
 * not actually reach further back — the catch-up run asked for 180 days and
 * still missed a May announcement sitting outside a `pick=25` feed. Sources
 * whose API accepts a date filter can use `{since}` to genuinely widen.
 */
export function expandPlaceholders(url, { since }) {
  if (!since) return url.replace(/[?&]publishedDate>=\{since\}/g, "").replace(/\{since\}/g, "");
  return url.replace(/\{since\}/g, since);
}

/** "https://a.test/x/y" -> "https://a.test/x" — the parent the final url should stay under. */
function stripPath(url) {
  const u = new URL(url);
  return `${u.origin}${u.pathname.replace(/\/[^/]*$/, "")}`;
}

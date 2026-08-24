// Deterministic source fetching, done by the workflow rather than the agent.
//
// The first live run showed the agent's WebFetch getting HTTP 403 from
// canada.ca while plain HTTP from the same runner got 200. Fetching here means
// coverage is MEASURED rather than self-reported, and the agent needs no
// fetch tool at all — which also removes any path for an injected page to
// direct an arbitrary outbound request.

const MAX_CHARS = 150_000;

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
export async function fetchWithFallback(source, { fetchImpl = fetch, timeoutMs = 20000 } = {}) {
  const candidates = [...(source.feeds ?? []), source.url].filter(Boolean);
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
      if (res.ok && body.trim().length > 0 && !redirectedAway) {
        return { id: source.id, ok: true, usedUrl: url, finalUrl, status: res.status, text: extractText(body), attempts };
      }
      attempts.push({ url, status: res.status, bytes: body.length, redirectedAway, finalUrl });
    } catch (err) {
      attempts.push({ url, status: 0, error: err.name === "AbortError" ? "timeout" : err.message });
    } finally {
      clearTimeout(timer);
    }
  }

  return { id: source.id, ok: false, usedUrl: null, status: 0, text: "", attempts };
}

/** "https://a.test/x/y" -> "https://a.test/x" — the parent the final url should stay under. */
function stripPath(url) {
  const u = new URL(url);
  return `${u.origin}${u.pathname.replace(/\/[^/]*$/, "")}`;
}

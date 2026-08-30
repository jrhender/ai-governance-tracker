// Replace agent-reported dates with the feed's own, where a feed covers the url.
//
// Feed sources carry dates in a structured field. Letting a language model
// transcribe them re-introduces error for no benefit: on one ISED item the
// agent reported 2026-07-24 on two of three runs where the feed said
// 2026-07-23. For anything a feed covers, the feed wins.

/**
 * @returns {{candidates: Array, mismatches: Array<{url, agent, feed, title}>}}
 */
export function applyAuthoritativeDates(candidates, feedItems) {
  const byUrl = new Map();
  for (const item of feedItems) {
    if (item?.url && item.published) byUrl.set(canonical(item.url), item.published);
  }

  const mismatches = [];
  const corrected = candidates.map((c) => {
    const authoritative = byUrl.get(canonical(c.url));
    if (!authoritative) return c;
    if (c.date !== authoritative) {
      mismatches.push({ url: c.url, agent: c.date, feed: authoritative, title: c.title });
    }
    return { ...c, date: authoritative };
  });

  return { candidates: corrected, mismatches };
}

/** Compare urls without trailing-slash or tracking-query noise. */
function canonical(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return String(url).split("?")[0].replace(/\/+$/, "").toLowerCase();
  }
}

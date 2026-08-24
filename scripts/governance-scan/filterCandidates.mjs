// 5 keeps a confused daily run from spamming the issue tracker. MAX_ISSUES
// overrides it for a deliberate one-off catch-up over a wide window, where
// silently truncating would hide whether the scan missed something or merely
// capped it.
export const DEFAULT_MAX_ISSUES = 5;

/** Cap per run: MAX_ISSUES if it is a sane positive number, else 5. */
export function maxIssues(env = process.env) {
  const n = Number(env.MAX_ISSUES);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX_ISSUES;
}

/**
 * Drop candidates that are already tracked, already reported, outside the
 * lookback window, or unsourced — then cap the survivors.
 */
export function filterCandidates({ candidates, tracked, reportedTitles, since, max = maxIssues() }) {
  const trackedKeys = new Set(tracked.map((r) => normalise(r.title)));
  for (const record of tracked) trackedKeys.add(normalise(record.id));

  const reportedKeys = new Set(reportedTitles.map(normalise));

  return candidates
    .filter((c) => c.url && c.url.trim() !== "")
    .filter((c) => !since || !c.date || c.date >= since)
    .filter((c) => !reportedKeys.has(normalise(c.title)))
    .filter((c) => !trackedKeys.has(normalise(stripAddPrefix(c.title))))
    .slice(0, max);
}

/** "Add Hiroshima AI Process" -> "Hiroshima AI Process" */
function stripAddPrefix(title) {
  return title.replace(/^add\s+/i, "");
}

/** Compare on lowercase alphanumerics so punctuation and dashes don't matter. */
function normalise(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export const MAX_ISSUES_PER_RUN = 5;

/**
 * Drop candidates that are already tracked, already reported, or
 * unsourced — then cap the survivors.
 */
export function filterCandidates({ candidates, tracked, reportedTitles }) {
  const trackedKeys = new Set(tracked.map((r) => normalise(r.title)));
  for (const record of tracked) trackedKeys.add(normalise(record.id));

  const reportedKeys = new Set(reportedTitles.map(normalise));

  return candidates
    .filter((c) => c.url && c.url.trim() !== "")
    .filter((c) => !reportedKeys.has(normalise(c.title)))
    .filter((c) => !trackedKeys.has(normalise(stripAddPrefix(c.title))))
    .slice(0, MAX_ISSUES_PER_RUN);
}

/** "Add Hiroshima AI Process" -> "Hiroshima AI Process" */
function stripAddPrefix(title) {
  return title.replace(/^add\s+/i, "");
}

/** Compare on lowercase alphanumerics so punctuation and dashes don't matter. */
function normalise(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

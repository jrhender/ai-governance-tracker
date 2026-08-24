import { execFileSync } from "node:child_process";

// 14 days for the daily run: long enough that a failed or missed run leaves
// no gap, short enough to keep each scan cheap. LOOKBACK_DAYS overrides it for
// a deliberate one-off catch-up over a wider window.
const DEFAULT_LOOKBACK_DAYS = 14;

/**
 * Titles of every `content`-labelled issue, open AND closed.
 *
 * `--limit 200` truncates the oldest issues first if there are ever more
 * than 200 `content`-labelled issues. That's an acceptable gap: a real
 * duplicate old enough to fall off this list is still caught by the
 * tracked-records check in `filterCandidates`, since by then it will (or
 * should) have been merged into `data/`.
 */
export function reportedTitles() {
  const raw = execFileSync(
    "gh",
    ["issue", "list", "--label", "content", "--state", "all", "--limit", "200", "--json", "title"],
    { encoding: "utf8" },
  );
  return JSON.parse(raw).map((i) => i.title);
}

/** Start of the rolling lookback window, as YYYY-MM-DD. */
export function since(days = lookbackDays()) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

/** Lookback in days: LOOKBACK_DAYS if it is a sane positive number, else 14. */
export function lookbackDays(env = process.env) {
  const n = Number(env.LOOKBACK_DAYS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LOOKBACK_DAYS;
}

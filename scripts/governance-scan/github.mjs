import { execFileSync } from "node:child_process";

const LOOKBACK_DAYS = 14;

/** Titles of every `content`-labelled issue, open AND closed. */
export function reportedTitles() {
  const raw = execFileSync(
    "gh",
    ["issue", "list", "--label", "content", "--state", "all", "--limit", "200", "--json", "title"],
    { encoding: "utf8" },
  );
  return JSON.parse(raw).map((i) => i.title);
}

/** Start of the rolling lookback window, as YYYY-MM-DD. */
export function since() {
  return new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10);
}

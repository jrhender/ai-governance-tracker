import { loadTrackedRecords } from "./trackedRecords.mjs";
import { filterCandidates } from "./filterCandidates.mjs";
import { reportedTitles, since } from "./github.mjs";
import { TAXONOMY_DIRS } from "./taxonomy.mjs";
import { applyAuthoritativeDates } from "./authoritativeDates.mjs";
import { readdirSync, readFileSync } from "node:fs";

const stdin = await new Promise((resolve) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (buf += chunk));
  process.stdin.on("end", () => resolve(buf));
});

const { candidates } = JSON.parse(stdin);

// Where a feed covers a candidate's url, the feed's date wins over the
// agent's. Runs before the window filter, so a corrected date is what gets
// compared against `since`.
const { candidates: dated, mismatches } = applyAuthoritativeDates(candidates, loadFeedItems());
for (const m of mismatches) {
  process.stderr.write(`::warning::Date corrected from feed: ${m.agent} -> ${m.feed} for ${m.url}\n`);
}

process.stdout.write(
  JSON.stringify(
    filterCandidates({
      candidates: dated,
      tracked: await loadTrackedRecords("data", { ignore: TAXONOMY_DIRS }),
      reportedTitles: reportedTitles(),
      since: since(),
    }),
  ),
);

/** Every item from every feed-backed source fetched this run. */
function loadFeedItems() {
  let files;
  try {
    files = readdirSync("sources-cache").filter((f) => f.endsWith(".json") && f !== "coverage.json");
  } catch {
    return [];
  }
  const items = [];
  for (const f of files) {
    try {
      items.push(...(JSON.parse(readFileSync(`sources-cache/${f}`, "utf8")).items ?? []));
    } catch {
      // A malformed cache file must not take down the filter.
    }
  }
  return items;
}

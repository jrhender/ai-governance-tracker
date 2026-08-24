import { loadTrackedRecords } from "./trackedRecords.mjs";
import { reportedTitles, since } from "./github.mjs";

// data/risks and data/mitigations are taxonomy terms, not developments — their
// titles are recommendation-shaped (e.g. "Enact comprehensive risk-based
// federal AI legislation") and can read like a description of a real bill
// before one exists, causing the agent to mistake an actual new development
// for something already tracked. Exclude them from what the agent sees.
const TAXONOMY_DIRS = ["data/risks/**", "data/mitigations/**"];

process.stdout.write(
  JSON.stringify({
    tracked: await loadTrackedRecords("data", { ignore: TAXONOMY_DIRS }),
    reportedTitles: reportedTitles(),
    since: since(),
  }),
);

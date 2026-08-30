import { loadTrackedRecords } from "./trackedRecords.mjs";
import { reportedTitles, since } from "./github.mjs";
import { maxIssues } from "./filterCandidates.mjs";
import { TAXONOMY_DIRS } from "./taxonomy.mjs";

process.stdout.write(
  JSON.stringify({
    tracked: await loadTrackedRecords("data", { ignore: TAXONOMY_DIRS }),
    reportedTitles: reportedTitles(),
    since: since(),
    maxIssues: maxIssues(),
  }),
);

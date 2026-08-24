import { loadTrackedRecords } from "./trackedRecords.mjs";
import { reportedTitles, since } from "./github.mjs";

process.stdout.write(
  JSON.stringify({ tracked: await loadTrackedRecords(), reportedTitles: reportedTitles(), since: since() }),
);

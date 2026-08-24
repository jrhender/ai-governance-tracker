import { loadTrackedRecords } from "./trackedRecords.mjs";
import { filterCandidates } from "./filterCandidates.mjs";
import { reportedTitles, since } from "./github.mjs";

const stdin = await new Promise((resolve) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (buf += chunk));
  process.stdin.on("end", () => resolve(buf));
});

const { candidates } = JSON.parse(stdin);

process.stdout.write(
  JSON.stringify(
    filterCandidates({
      candidates,
      tracked: await loadTrackedRecords(),
      reportedTitles: reportedTitles(),
      since: since(),
    }),
  ),
);

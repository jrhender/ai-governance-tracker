// CLI: probe every url in .github/sources.yaml, plus any `feed:` candidate,
// and report which actually serve content from this machine.
//
//   node scripts/governance-scan/probe.mjs
//
// Exits non-zero if any probe failed, so CI shows the result without needing
// the log read (Actions logs are not reachable from the dev sandbox).

import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { probeUrl, formatResults, allReachable } from "./probeSources.mjs";

const doc = parse(await readFile(".github/sources.yaml", "utf8"));

const targets = [];
for (const s of doc.sources ?? []) {
  targets.push({ id: s.id, url: s.url });
  if (s.feed) targets.push({ id: `${s.id} (feed)`, url: s.feed });
}

const results = [];
for (const t of targets) {
  const r = await probeUrl(t.url);
  results.push(r);
  process.stdout.write(`${t.id}\n${formatResults([r])}\n\n`);
}

const failed = results.filter((r) => !r.ok);
process.stdout.write(`\n${results.length - failed.length}/${results.length} reachable\n`);

if (!allReachable(results)) {
  process.stderr.write(`::warning::${failed.length} of ${results.length} source urls are unreachable from the runner\n`);
  process.exit(1);
}

// CLI: fetch every source in .github/sources.yaml into sources-cache/ and
// write a machine-read coverage report.
//
//   node scripts/governance-scan/fetch.mjs
//
// Always exits 0 — partial coverage is normal and the workflow's gate decides
// whether it is good enough. A crash here should be the only non-zero exit.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";
import { fetchWithFallback } from "./fetchSources.mjs";
import { since } from "./github.mjs";

const OUT = "sources-cache";
const doc = parse(await readFile(".github/sources.yaml", "utf8"));
const sources = doc.sources ?? [];

await mkdir(OUT, { recursive: true });

const windowStart = since();
process.stdout.write(`window starts ${windowStart}\n\n`);

const coverage = [];
for (const source of sources) {
  const r = await fetchWithFallback(source, { since: windowStart });
  if (r.ok) {
    await writeFile(`${OUT}/${r.id}.txt`, `SOURCE: ${source.name}\nURL: ${r.usedUrl}\n\n${r.text}\n`);
  }
  coverage.push({
    id: r.id,
    name: source.name,
    ok: r.ok,
    usedUrl: r.usedUrl,
    file: r.ok ? `${OUT}/${r.id}.txt` : null,
    chars: r.text.length,
    attempts: r.attempts,
  });
  process.stdout.write(
    r.ok
      ? `OK   ${String(r.text.length).padStart(7)} chars  ${r.id}  <- ${r.usedUrl}\n`
      : `FAIL ${" ".repeat(7)}        ${r.id}  (${r.attempts.map((a) => a.error || (a.tooThin ? `${a.status} too thin: ${a.chars} chars` : a.status)).join(", ")})\n`,
  );
}

await writeFile(`${OUT}/coverage.json`, JSON.stringify(coverage, null, 2));

const okCount = coverage.filter((c) => c.ok).length;
process.stdout.write(`\n${okCount}/${coverage.length} sources fetched\n`);

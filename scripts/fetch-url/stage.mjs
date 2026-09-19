// CLI: stage fetch-url.mjs outside the workspace for .github/workflows/claude.yml
// and print the Claude step's tool grants as step outputs.
//
//   node scripts/fetch-url/stage.mjs "$RUNNER_TEMP/fetch-url" >> "$GITHUB_OUTPUT"
//
// Runs before Claude does, so the staged copy and its host list are fixed
// before Claude could edit anything (see the header of fetch-url.mjs). The
// hosts come from .github/sources.yaml, so adding a scan source also opens it
// to the @claude workflow.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

/** Every host a source's url or feeds point at, deduplicated and sorted. */
export function allowedHosts(sources) {
  const urls = sources.flatMap((s) => [s.url, ...(s.feeds ?? [])]);
  return [...new Set(urls.map((u) => new URL(u).hostname.toLowerCase()))].sort();
}

/** The --allowedTools value: WebFetch per host, plus the staged wrapper and nothing else. */
export function allowedTools(hosts, script) {
  return [...hosts.map((h) => `WebFetch(domain:${h})`), `Bash(node ${script}:*)`].join(",");
}

export async function stage(dir, { sourcesPath = ".github/sources.yaml" } = {}) {
  const hosts = allowedHosts(parse(await readFile(sourcesPath, "utf8")).sources ?? []);
  const script = join(resolve(dir), "fetch-url.mjs");
  await mkdir(dir, { recursive: true });
  await copyFile(fileURLToPath(new URL("./fetch-url.mjs", import.meta.url)), script);
  await writeFile(join(dir, "allowed-hosts.json"), JSON.stringify(hosts, null, 2) + "\n");
  return { hosts, script, allowedTools: allowedTools(hosts, script) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir) throw new Error("usage: node scripts/fetch-url/stage.mjs <dir>");
  const { hosts, script, allowedTools: tools } = await stage(dir);
  process.stderr.write(`staged ${script} for ${hosts.length} hosts: ${hosts.join(", ")}\n`);
  process.stdout.write(`allowed_tools=${tools}\nfetch_command=node ${script}\n`);
}

// CLI: stage fetch-url.mjs outside the workspace for .github/workflows/claude.yml
// and print the Claude step's whole tool grant surface as step outputs.
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

// The package scripts Claude needs to check its own work before pushing, since
// the action grants no Bash at all by default. `pnpm test:e2e` is listed next to
// `pnpm test` rather than relying on the latter's prefix covering it, and the
// playwright grant is install-only so e2e can fetch chromium on demand instead
// of every @claude run paying for a browser download.
//
// These run package scripts, and package.json is inside the workspace the action
// auto-approves edits to — so unlike the staged wrapper, they are a grant to the
// repo's own build, not a boundary Claude cannot move. The runner is the boundary.
export const VERIFY_TOOLS = [
  "Bash(pnpm install:*)",
  "Bash(pnpm build:*)",
  "Bash(pnpm test:*)",
  "Bash(pnpm test:e2e:*)",
  "Bash(pnpm exec playwright install:*)",
];

/** The --allowedTools value: WebFetch per host, the staged wrapper, the build and nothing else. */
export function allowedTools(hosts, script) {
  return [...hosts.map((h) => `WebFetch(domain:${h})`), `Bash(node ${script}:*)`, ...VERIFY_TOOLS].join(",");
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

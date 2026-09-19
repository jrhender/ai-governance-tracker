// CLI: fetch one page for the @claude workflow, restricted to the hosts the
// governance scan watches (.github/sources.yaml).
//
//   node <staged dir>/fetch-url.mjs <https-url>
//
// This is the plain-HTTP fallback for when WebFetch is refused: canada.ca has
// returned 403 to WebFetch while plain HTTP from the same runner got 200. It
// stands in for curl because a Bash(curl ...) rule cannot hold a domain
// boundary — its trailing * also admits `-d @file https://anywhere`.
//
// .github/workflows/claude.yml runs a COPY staged outside the workspace by
// stage.mjs, with allowed-hosts.json beside it. The action auto-approves
// Claude's edits inside the workspace, so a copy there (or a host list read
// from sources.yaml at run time) could be rewritten before it ran. That is
// also why this file imports nothing but node built-ins.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const MAX_REDIRECTS = 5;
const MAX_CHARS = 150_000;
const TIMEOUT_MS = 20_000;

/** Parse `raw` and throw unless it is a plain https url on an allowed host. */
export function checkUrl(raw, hosts) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`not a valid url: ${raw}`);
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:") throw new Error(`only https is allowed: ${url.href}`);
  if (url.username || url.password) throw new Error(`credentials in the url are not allowed: ${url.href}`);
  if (url.port) throw new Error(`a non-default port is not allowed: ${url.href}`);
  if (!hosts.includes(host)) {
    throw new Error(`${host} is not an allowed host (see .github/sources.yaml): ${url.href}`);
  }
  url.hostname = host;
  return url;
}

/**
 * GET `raw`, following redirects by hand so every hop is checked against
 * `hosts` before it is requested. html comes back as stripped text; anything
 * else (feeds, json) comes back as-is.
 */
export async function fetchAllowed(raw, { hosts, fetchImpl = fetch, timeoutMs = TIMEOUT_MS }) {
  let url = checkUrl(raw, hosts);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetchImpl(url.href, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = checkUrl(new URL(location, url).href, hosts);
      continue;
    }
    const body = await res.text();
    const isHtml = /html/i.test(res.headers.get("content-type") ?? "");
    return { url: url.href, status: res.status, ok: res.ok, text: truncate(isHtml ? htmlToText(body) : body) };
  }
  throw new Error(`gave up after ${MAX_REDIRECTS} redirects: ${raw}`);
}

/** The whole argument surface: exactly one url, no flags. */
export function parseArgs(argv) {
  if (argv.length !== 1 || argv[0].startsWith("-")) {
    throw new Error("usage: node fetch-url.mjs <https-url>");
  }
  return argv[0];
}

// Mirrors extractText in scripts/governance-scan/fetchSources.mjs, which this
// file cannot import (see the header).
function htmlToText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function truncate(text) {
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + "\n\n[truncated]" : text;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const url = parseArgs(process.argv.slice(2));
    const hosts = JSON.parse(readFileSync(new URL("./allowed-hosts.json", import.meta.url), "utf8"));
    const r = await fetchAllowed(url, { hosts });
    process.stdout.write(`URL: ${r.url}\nSTATUS: ${r.status}\n\n${r.text}\n`);
    process.exitCode = r.ok ? 0 : 1;
  } catch (err) {
    process.stderr.write(`fetch-url: ${err.name === "TimeoutError" ? "timed out" : err.message}\n`);
    process.exitCode = 1;
  }
}

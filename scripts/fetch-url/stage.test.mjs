// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { allowedHosts, allowedTools, stage } from "./stage.mjs";

const sources = parse(readFileSync(".github/sources.yaml", "utf8")).sources;

describe("allowedHosts", () => {
  it("takes the host of every source url and feed", () => {
    const hosts = allowedHosts([
      { id: "a", url: "https://www.canada.ca/en/news.html", feeds: ["https://api.io.canada.ca/v2?x={since}"] },
      { id: "b", url: "https://cifar.ca/ai/", feeds: ["https://cifar.ca/feed/"] },
    ]);
    expect(hosts).toEqual(["api.io.canada.ca", "cifar.ca", "www.canada.ca"]);
  });

  it("covers every host in .github/sources.yaml", () => {
    const hosts = allowedHosts(sources);
    for (const s of sources) {
      expect(hosts, s.id).toContain(new URL(s.url).hostname);
      for (const f of s.feeds ?? []) expect(hosts, `${s.id} feed`).toContain(new URL(f).hostname);
    }
  });
});

describe("allowedTools", () => {
  const tools = allowedTools(["cifar.ca", "www.canada.ca"], "/runner/_temp/fetch-url/fetch-url.mjs").split(",");

  it("grants WebFetch per host and the staged wrapper, nothing broader", () => {
    expect(tools).toEqual([
      "WebFetch(domain:cifar.ca)",
      "WebFetch(domain:www.canada.ca)",
      "Bash(node /runner/_temp/fetch-url/fetch-url.mjs:*)",
    ]);
  });

  it("never grants bare WebFetch, bare Bash, or curl", () => {
    expect(tools).not.toContain("WebFetch");
    expect(tools).not.toContain("Bash");
    expect(tools.join(",")).not.toMatch(/curl|wget/);
  });
});

describe("stage", () => {
  it("copies the wrapper and its host list into the target dir", async () => {
    const dir = await mkdtemp(join(tmpdir(), "fetch-url-"));
    const out = await stage(dir, { sourcesPath: ".github/sources.yaml" });

    expect(JSON.parse(await readFile(join(dir, "allowed-hosts.json"), "utf8"))).toEqual(allowedHosts(sources));
    expect(await readFile(join(dir, "fetch-url.mjs"), "utf8")).toBe(
      await readFile(new URL("./fetch-url.mjs", import.meta.url), "utf8"),
    );
    expect(out.script).toBe(join(dir, "fetch-url.mjs"));
    expect(out.allowedTools).toContain(`Bash(node ${join(dir, "fetch-url.mjs")}:*)`);
  });
});

// @vitest-environment node
//
// Guards on .github/workflows/governance-scan.yml. These exist because the
// things they check have all actually broken at least once: a LOOKBACK_DAYS
// that reached the scan step but not the fetch step, and a permission surface
// that must not widen by accident.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const wf = parse(readFileSync(".github/workflows/governance-scan.yml", "utf8"));
const job = wf.jobs.scan;
const scanStep = job.steps.find((s) => s.name === "Scan for untracked developments");

describe("permission surface", () => {
  it("grants exactly contents:read and issues:write", () => {
    expect(wf.permissions).toEqual({ contents: "read", issues: "write" });
  });

  it("never grants contents:write — there must be no write path to data/", () => {
    expect(wf.permissions.contents).not.toBe("write");
  });

  it("grants no Write, Edit, bare Bash, or WebFetch to the agent", () => {
    const run = scanStep.run;
    expect(run).not.toMatch(/--allowed-tools\s+'Write'/);
    expect(run).not.toMatch(/--allowed-tools\s+'Edit'/);
    expect(run).not.toMatch(/--allowed-tools\s+'Bash'/);
    expect(run).not.toMatch(/WebFetch/);
  });

  it("scopes every Bash grant to a specific command", () => {
    const grants = [...scanStep.run.matchAll(/--allowed-tools\s+'Bash\(([^)]*)\)'/g)].map((m) => m[1]);
    expect(grants.length).toBeGreaterThan(0);
    for (const g of grants) expect(g).not.toBe("");
  });
});

describe("lookback plumbing", () => {
  it("defines LOOKBACK_DAYS at job level so fetch and scan share one window", () => {
    // The bug this guards: LOOKBACK_DAYS sat only on the scan step, so a
    // 180-day catch-up fetched 14 days of content and judged it against 180.
    expect(job.env).toBeDefined();
    expect(job.env.LOOKBACK_DAYS).toContain("inputs.lookback_days");
    expect(job.env.MAX_ISSUES).toContain("inputs.max_issues");
  });

  it("does not shadow the job-level window on any step", () => {
    for (const step of job.steps) {
      if (step.env) {
        expect(step.env.LOOKBACK_DAYS).toBeUndefined();
        expect(step.env.MAX_ISSUES).toBeUndefined();
      }
    }
  });
});

describe("failure visibility", () => {
  it("uploads the artifact even when the job fails", () => {
    const upload = job.steps.find((s) => s.uses?.startsWith("actions/upload-artifact"));
    expect(upload.if).toBe("always()");
  });

  it("captures stderr separately so a crash is diagnosable from the artifact", () => {
    expect(scanStep.run).toMatch(/2>scan\.err/);
  });
});

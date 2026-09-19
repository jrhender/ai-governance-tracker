// @vitest-environment node
//
// Guards on .github/workflows/claude.yml's web access. The permission surface
// must come only from the staged step outputs, never widen to bare WebFetch,
// Bash or curl, and never point Claude at a copy it could edit first.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const wf = parse(readFileSync(".github/workflows/claude.yml", "utf8"));
const steps = wf.jobs.claude.steps;
const stageIdx = steps.findIndex((s) => s.id === "web");
const claudeIdx = steps.findIndex((s) => s.uses?.startsWith("anthropics/claude-code-action"));
const claudeArgs = steps[claudeIdx]?.with?.claude_args ?? "";

describe("claude.yml web access", () => {
  it("stages the wrapper before Claude runs, outside the workspace", () => {
    expect(stageIdx).toBeGreaterThanOrEqual(0);
    expect(stageIdx).toBeLessThan(claudeIdx);
    expect(steps[stageIdx].run).toMatch(/node scripts\/fetch-url\/stage\.mjs "\$\{\{ runner\.temp \}\}\//);
    expect(steps[stageIdx].run).toMatch(/>> "\$GITHUB_OUTPUT"/);
  });

  it("grants tools only through the staged allowed_tools output", () => {
    const grants = [...claudeArgs.matchAll(/--allowed-?[tT]ools\s+("[^"]*"|'[^']*'|\S+)/g)].map((m) => m[1]);
    expect(grants).toEqual(['"${{ steps.web.outputs.allowed_tools }}"']);
  });

  it("does not grant curl, bare Bash or bare WebFetch anywhere", () => {
    expect(claudeArgs).not.toMatch(/Bash\(curl|Bash\(wget|"Bash"|'Bash'|--allowed-?[tT]ools\s+["']?WebFetch["']?(\s|$)/);
  });

  it("uses step outputs for paths, since the action expands $VARS in claude_args to empty", () => {
    expect(claudeArgs).not.toMatch(/\$RUNNER_TEMP|\$\{RUNNER_TEMP\}/);
  });
});

describe("claude.yml model", () => {
  it("asks for Opus by alias, so the latest one is picked up without editing this repo", () => {
    expect(claudeArgs).toMatch(/--model\s+opus(\s|$)/);
    expect(claudeArgs).not.toMatch(/--model\s+claude-/);
  });
});

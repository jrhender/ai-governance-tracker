import { describe, it, expect } from "vitest";
import { humanizeType, leadText } from "./format";

describe("humanizeType", () => {
  it("returns single-word types unchanged", () => {
    expect(humanizeType("Report")).toBe("Report");
  });

  it("splits CamelCase into spaced words", () => {
    expect(humanizeType("PolicyDocument")).toBe("Policy Document");
    expect(humanizeType("WhitePaper")).toBe("White Paper");
    expect(humanizeType("GovernmentProgram")).toBe("Government Program");
  });

  it("passes already-spaced input through unchanged", () => {
    expect(humanizeType("White Paper")).toBe("White Paper");
  });
});

describe("leadText", () => {
  it("returns a single plain paragraph unchanged", () => {
    expect(leadText("A short folded description.")).toBe(
      "A short folded description.",
    );
  });

  it("returns only the first paragraph of multi-paragraph Markdown", () => {
    const md = "Lead paragraph here.\n\n- bullet one\n- bullet two";
    expect(leadText(md)).toBe("Lead paragraph here.");
  });

  it("strips bold markers from the lead paragraph", () => {
    expect(leadText("Focused on **building public trust** in AI.")).toBe(
      "Focused on building public trust in AI.",
    );
  });
});

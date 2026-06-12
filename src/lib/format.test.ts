import { describe, it, expect } from "vitest";
import { humanizeType } from "./format";

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

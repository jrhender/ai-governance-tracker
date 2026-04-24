import { describe, it, expect } from "vitest";
import { badgeClass } from "./legislation";

describe("badgeClass", () => {
  it("returns blue for active", () => {
    expect(badgeClass("active")).toBe("bg-blue-600 text-white");
  });

  it("returns green for enacted", () => {
    expect(badgeClass("enacted")).toBe("bg-green-600 text-white");
  });

  it("returns red for died", () => {
    expect(badgeClass("died")).toBe("bg-red-600 text-white");
  });

  it("returns grey for withdrawn", () => {
    expect(badgeClass("withdrawn")).toBe("bg-slate-500 text-white");
  });

  it("returns grey for undefined", () => {
    expect(badgeClass(undefined)).toBe("bg-slate-500 text-white");
  });
});

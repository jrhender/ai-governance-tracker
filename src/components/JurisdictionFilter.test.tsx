import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JurisdictionFilter from "./JurisdictionFilter";

describe("JurisdictionFilter", () => {
  it("renders All, Canada, and International buttons", () => {
    render(<JurisdictionFilter selected="all" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Canada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "International" })).toBeInTheDocument();
  });

  it("sets aria-pressed='true' on the active button only", () => {
    render(<JurisdictionFilter selected="international" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Canada" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "International" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onSelect with 'canada' when Canada is clicked", async () => {
    const onSelect = vi.fn();
    render(<JurisdictionFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Canada" }));
    expect(onSelect).toHaveBeenCalledWith("canada");
  });

  it("calls onSelect with 'international' when International is clicked", async () => {
    const onSelect = vi.fn();
    render(<JurisdictionFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "International" }));
    expect(onSelect).toHaveBeenCalledWith("international");
  });

  it("calls onSelect with 'all' when All is clicked", async () => {
    const onSelect = vi.fn();
    render(<JurisdictionFilter selected="canada" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith("all");
  });
});

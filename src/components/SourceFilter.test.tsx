import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceFilter from "./SourceFilter";

describe("SourceFilter", () => {
  it("renders All, Government, and Civil Society buttons", () => {
    render(<SourceFilter selected="all" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Government" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Civil Society" })).toBeInTheDocument();
  });

  it("sets aria-pressed='true' on the active button only", () => {
    render(<SourceFilter selected="government" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Government" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Civil Society" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelect with 'government' when Government is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(onSelect).toHaveBeenCalledWith("government");
  });

  it("calls onSelect with 'civil_society' when Civil Society is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="all" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Civil Society" }));
    expect(onSelect).toHaveBeenCalledWith("civil_society");
  });

  it("calls onSelect with 'all' when All is clicked", async () => {
    const onSelect = vi.fn();
    render(<SourceFilter selected="government" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith("all");
  });
});

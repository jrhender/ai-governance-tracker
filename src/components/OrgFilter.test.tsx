import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrgFilter from "./OrgFilter";
import type { OrgOption } from "../lib/timeline";

const orgs: OrgOption[] = [
  { id: "senate", label: "Senate", count: 3 },
  { id: "cigi", label: "CIGI", count: 2 },
];

describe("OrgFilter", () => {
  it("calls onSelect with the org id when a pill is clicked", async () => {
    const onSelect = vi.fn();
    render(<OrgFilter orgs={orgs} selected={null} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /CIGI/ }));

    expect(onSelect).toHaveBeenCalledWith("cigi");
  });

  it("calls onSelect(null) when the All pill is clicked", async () => {
    const onSelect = vi.fn();
    render(<OrgFilter orgs={orgs} selected="senate" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("sets aria-pressed='true' on exactly the active pill", () => {
    render(<OrgFilter orgs={orgs} selected="senate" onSelect={() => {}} />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /Senate/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /CIGI/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrgsWithCountryFilter from "./OrgsWithCountryFilter";

const orgs = [
  {
    id: "aigs-canada",
    name: "AI Governance and Safety Canada",
    short_name: "AIGS",
    country: "ca" as const,
    tags: ["think-tank"],
    events: 2,
    artifacts: 1,
  },
  {
    id: "dsit-uk",
    name: "Department for Science, Innovation and Technology",
    short_name: "DSIT",
    country: "uk" as const,
    tags: ["government"],
    events: 1,
    artifacts: 0,
  },
  {
    id: "ised-canada",
    name: "Innovation, Science and Economic Development Canada",
    short_name: "ISED",
    country: "ca" as const,
    tags: ["government"],
    events: 3,
    artifacts: 2,
  },
];

describe("OrgsWithCountryFilter", () => {
  it("defaults to Canada filter on mount — shows CA orgs, hides UK orgs", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByText("AIGS")).toBeInTheDocument();
    expect(screen.getByText("ISED")).toBeInTheDocument();
    expect(screen.queryByText("DSIT")).not.toBeInTheDocument();
  });

  it("shows all orgs when All pill is clicked", async () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("AIGS")).toBeInTheDocument();
    expect(screen.getByText("DSIT")).toBeInTheDocument();
    expect(screen.getByText("ISED")).toBeInTheDocument();
  });

  it("filters to UK orgs when UK pill is clicked", async () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    await userEvent.click(screen.getByRole("button", { name: "UK" }));
    expect(screen.queryByText("AIGS")).not.toBeInTheDocument();
    expect(screen.queryByText("ISED")).not.toBeInTheDocument();
    expect(screen.getByText("DSIT")).toBeInTheDocument();
  });

  it("derives country pill labels from data", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByRole("button", { name: "Canada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UK" })).toBeInTheDocument();
  });

  it("marks the active country pill with aria-pressed=true", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByRole("button", { name: "Canada" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "UK" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows country label on each org card", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    // Two CA orgs visible by default; both should show "Canada"
    expect(screen.getAllByText("Canada").length).toBeGreaterThanOrEqual(2);
  });

  it("shows country icons on pills and org cards without changing accessible names", () => {
    render(<OrgsWithCountryFilter orgs={orgs} />);
    expect(screen.getByRole("button", { name: "Canada" })).toHaveTextContent("🇨🇦");
    expect(screen.getByRole("button", { name: "UK" })).toHaveTextContent("🇬🇧");
    // Cards for the two visible CA orgs carry the flag too
    expect(screen.getAllByText("🇨🇦").length).toBeGreaterThanOrEqual(3);
  });

  it("filters to international orgs when International pill is clicked", async () => {
    const orgsWithIntl = [
      ...orgs,
      {
        id: "oecd",
        name: "Organisation for Economic Co-operation and Development",
        short_name: "OECD",
        country: "international" as const,
        tags: ["intergovernmental"],
        events: 1,
        artifacts: 1,
      },
    ];
    render(<OrgsWithCountryFilter orgs={orgsWithIntl} />);
    expect(
      screen.getByRole("button", { name: "International" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "International" }));
    expect(screen.getByText("OECD")).toBeInTheDocument();
    expect(screen.queryByText("AIGS")).not.toBeInTheDocument();
    expect(screen.queryByText("DSIT")).not.toBeInTheDocument();
  });

  it("auto-adds a pill when a new country appears in props", () => {
    const orgsWithUs = [
      ...orgs,
      {
        id: "nist-us",
        name: "National Institute of Standards and Technology",
        short_name: "NIST",
        country: "us" as unknown as "ca" | "uk",
        tags: ["government"],
        events: 0,
        artifacts: 0,
      },
    ];
    render(<OrgsWithCountryFilter orgs={orgsWithUs} />);
    expect(screen.getByRole("button", { name: "US" })).toBeInTheDocument();
  });
});

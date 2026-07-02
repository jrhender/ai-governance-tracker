import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PolicyWithSourceFilter from "./PolicyWithSourceFilter";
import type { ArtifactEntry } from "./PolicyWithSourceFilter";

const govArtifact: ArtifactEntry = {
  id: "bill-c27-aida",
  type: "Legislation",
  title: "Bill C-27",
  publishedDate: "2022-06-16",
  sourceCategory: "government",
  jurisdiction: "canada",
};

const civilArtifact: ArtifactEntry = {
  id: "aigs-governing-ai-2023",
  type: "WhitePaper",
  title: "Governing AI: A Plan for Canada",
  publishedDate: "2023-10-18",
  sourceCategory: "civil_society",
  jurisdiction: "canada",
};

const intlArtifact: ArtifactEntry = {
  id: "hiroshima-ai-process",
  type: "PolicyDocument",
  title: "Hiroshima AI Process",
  publishedDate: "2023-05-19",
  sourceCategory: "government",
  jurisdiction: "international",
};

describe("PolicyWithSourceFilter", () => {
  it("renders all artifacts when 'All' is selected", () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    expect(screen.getByText("Bill C-27")).toBeInTheDocument();
    expect(screen.getByText("Governing AI: A Plan for Canada")).toBeInTheDocument();
  });

  it("shows only government artifacts after clicking Government", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(screen.getByText("Bill C-27")).toBeInTheDocument();
    expect(screen.queryByText("Governing AI: A Plan for Canada")).not.toBeInTheDocument();
  });

  it("shows only civil society artifacts after clicking Civil Society", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Civil Society" }));
    expect(screen.queryByText("Bill C-27")).not.toBeInTheDocument();
    expect(screen.getByText("Governing AI: A Plan for Canada")).toBeInTheDocument();
  });

  it("renders GOVERNMENT badge on government card", () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact]} />);
    expect(screen.getByText("GOVERNMENT")).toBeInTheDocument();
  });

  it("renders CIVIL SOCIETY badge on civil society card", () => {
    render(<PolicyWithSourceFilter artifacts={[civilArtifact]} />);
    expect(screen.getByText("CIVIL SOCIETY")).toBeInTheDocument();
  });

  it("hides a section heading when all its items are filtered out", async () => {
    render(<PolicyWithSourceFilter artifacts={[govArtifact, civilArtifact]} />);
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    expect(screen.queryByText("White Papers")).not.toBeInTheDocument();
    expect(screen.getByText("Legislation")).toBeInTheDocument();
  });

  it("shows only canadian artifacts after clicking Canada", async () => {
    render(
      <PolicyWithSourceFilter artifacts={[govArtifact, intlArtifact]} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Canada" }));
    expect(screen.getByText("Bill C-27")).toBeInTheDocument();
    expect(screen.queryByText("Hiroshima AI Process")).not.toBeInTheDocument();
  });

  it("shows only international artifacts after clicking International", async () => {
    render(
      <PolicyWithSourceFilter artifacts={[govArtifact, intlArtifact]} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "International" }));
    expect(screen.queryByText("Bill C-27")).not.toBeInTheDocument();
    expect(screen.getByText("Hiroshima AI Process")).toBeInTheDocument();
  });

  it("combines source and jurisdiction filters", async () => {
    render(
      <PolicyWithSourceFilter
        artifacts={[govArtifact, civilArtifact, intlArtifact]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Government" }));
    await userEvent.click(screen.getByRole("button", { name: "International" }));
    expect(screen.getByText("Hiroshima AI Process")).toBeInTheDocument();
    expect(screen.queryByText("Bill C-27")).not.toBeInTheDocument();
    expect(screen.queryByText("Governing AI: A Plan for Canada")).not.toBeInTheDocument();
  });

  it("renders lifecycle status badge alongside source badge for Legislation", () => {
    const bill: ArtifactEntry = {
      ...govArtifact,
      lifecycleStatus: "died",
      currentStage: "Died on the Order Paper",
    };
    render(<PolicyWithSourceFilter artifacts={[bill]} />);
    expect(screen.getByText("Died")).toBeInTheDocument();
    expect(screen.getByText("GOVERNMENT")).toBeInTheDocument();
    expect(screen.getByText("Died on the Order Paper")).toBeInTheDocument();
  });
});

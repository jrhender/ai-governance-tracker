import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TimelineList from "./TimelineList";
import type { TimelineItem } from "../lib/timeline";

const baseItem: TimelineItem = {
  id: "test-1",
  kind: "event",
  title: "Senate Committee Hearing on AI Safety",
  date: "2025-04-15T00:00:00.000Z",
  tags: [],
  href: "/events/test-1/",
  badge: "CommitteeHearing",
  orgIds: ["senate"],
  orgs: [{ id: "senate", label: "Senate SOCI" }],
  links: [],
};

describe("TimelineList", () => {
  it("renders org chips as links to /orgs/<id>/", () => {
    render(<TimelineList items={[baseItem]} />);
    const chip = screen.getByRole("link", { name: "Senate SOCI" });
    expect(chip).toHaveAttribute("href", "/orgs/senate/");
  });

  it("renders source links when item.links is non-empty", () => {
    const item: TimelineItem = {
      ...baseItem,
      links: [
        { label: "Hansard", url: "https://example.com/hansard", icon: "document" },
        { label: "Video", url: "https://example.com/video", icon: "video" },
      ],
    };
    render(<TimelineList items={[item]} />);
    expect(screen.getByRole("link", { name: /Hansard/ })).toHaveAttribute(
      "href",
      "https://example.com/hansard",
    );
    expect(screen.getByRole("link", { name: /Video/ })).toHaveAttribute(
      "href",
      "https://example.com/video",
    );
  });

  it("does not render a source-links row when item.links is empty", () => {
    render(<TimelineList items={[baseItem]} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).not.toContain("https://example.com/hansard");
  });

  it("renders an empty-state message when items list is empty", () => {
    render(<TimelineList items={[]} />);
    expect(screen.getByText("No items match this filter.")).toBeInTheDocument();
  });
});

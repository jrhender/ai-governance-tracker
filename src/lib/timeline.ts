import { getSourceCategory, type SourceCategory } from "./sourceCategory";
import type { Jurisdiction } from "./jurisdiction";

export type TimelineItem = {
  id: string;
  kind: "event";
  title: string;
  date: string; // ISO string — sorted in Astro before passing
  description?: string;
  tags: string[];
  href: string;
  badge: string;
  orgIds: string[]; // flattened org IDs for filtering
  orgs: { id: string; label: string }[]; // for displaying org chips
  links: { label: string; url: string; icon?: string }[]; // source links
  sourceCategory: SourceCategory;
  jurisdiction: Jurisdiction;
};

export type OrgOption = {
  id: string;
  label: string; // short_name ?? name
  count: number; // pre-counted items referencing this org
};

// Minimal shapes of the Astro content collections, kept here so this builder
// stays unit-testable without pulling in `astro:content`.
export type EventInput = {
  id: string;
  data: {
    title: string;
    date: Date;
    description?: string;
    tags: string[];
    type: string;
    organizations: { id: { id: string } }[];
    links: { label: string; url: string; icon?: string }[];
    jurisdiction: Jurisdiction;
  };
};

export type OrgInput = {
  id: string;
  data: { name: string; short_name?: string; schema_type: string };
};

// Map event + organization collections into TimelineItems, newest first.
// Shared by the full timeline page and the homepage "latest activity" preview.
export function buildTimelineItems(
  events: EventInput[],
  organizations: OrgInput[],
): TimelineItem[] {
  const orgMap = new Map<
    string,
    { name: string; short_name?: string; schema_type: string }
  >();
  for (const org of organizations) {
    orgMap.set(org.id, {
      name: org.data.name,
      short_name: org.data.short_name,
      schema_type: org.data.schema_type,
    });
  }

  return events
    .map((e) => ({
      id: e.id,
      kind: "event" as const,
      title: e.data.title,
      date: e.data.date.toISOString(),
      description: e.data.description,
      tags: e.data.tags,
      href: `/events/${e.id}/`,
      badge: e.data.type,
      orgIds: e.data.organizations.map((o) => o.id.id),
      orgs: e.data.organizations.map((o) => {
        const org = orgMap.get(o.id.id);
        return { id: o.id.id, label: org?.short_name ?? org?.name ?? o.id.id };
      }),
      links: e.data.links,
      jurisdiction: e.data.jurisdiction,
      sourceCategory: getSourceCategory(
        e.data.organizations.map(
          (o) => orgMap.get(o.id.id)?.schema_type ?? "Organization",
        ),
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function filterByOrg(
  items: TimelineItem[],
  orgId: string | null,
): TimelineItem[] {
  if (!orgId) return items;
  return items.filter((i) => i.orgIds.includes(orgId));
}

export function filterBySource(
  items: TimelineItem[],
  sourceCategory: SourceCategory | "all",
): TimelineItem[] {
  if (sourceCategory === "all") return items;
  return items.filter((i) => i.sourceCategory === sourceCategory);
}

export function filterByJurisdiction(
  items: TimelineItem[],
  jurisdiction: Jurisdiction | "all",
): TimelineItem[] {
  if (jurisdiction === "all") return items;
  return items.filter((i) => i.jurisdiction === jurisdiction);
}

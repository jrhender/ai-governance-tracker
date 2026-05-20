import type { SourceCategory } from "./sourceCategory";

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
};

export type OrgOption = {
  id: string;
  label: string; // short_name ?? name
  count: number; // pre-counted items referencing this org
};

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

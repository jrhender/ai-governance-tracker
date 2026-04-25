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

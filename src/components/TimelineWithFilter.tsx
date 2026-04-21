import { useState, useEffect, useMemo } from "react";
import type { TimelineItem, OrgOption } from "../lib/timeline";
import { filterByOrg } from "../lib/timeline";
import OrgFilter from "./OrgFilter";
import TimelineList from "./TimelineList";

type Props = {
  items: TimelineItem[];
  orgs: OrgOption[];
};

export default function TimelineWithFilter({ items, orgs }: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Read ?org= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const org = params.get("org");
    if (org) {
      setSelectedOrgId(org);
    }
  }, []);

  function handleSelect(orgId: string | null) {
    setSelectedOrgId(orgId);
    if (orgId !== null) {
      history.replaceState({}, "", "?org=" + orgId);
    } else {
      history.replaceState({}, "", window.location.pathname);
    }
  }

  const filteredItems = useMemo(
    () => filterByOrg(items, selectedOrgId),
    [items, selectedOrgId],
  );

  return (
    <>
      <OrgFilter orgs={orgs} selected={selectedOrgId} onSelect={handleSelect} />
      <TimelineList items={filteredItems} />
    </>
  );
}

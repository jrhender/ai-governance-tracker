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

  useEffect(() => {
    function resolveOrg(): string | null {
      const params = new URLSearchParams(window.location.search);
      const org = params.get("org");
      return org && orgs.some((o) => o.id === org) ? org : null;
    }

    const initial = resolveOrg();
    setSelectedOrgId(initial);
    const raw = new URLSearchParams(window.location.search).get("org");
    if (raw && !initial) {
      history.replaceState({}, "", window.location.pathname);
    }

    function onPopState() {
      setSelectedOrgId(resolveOrg());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [orgs]);

  function handleSelect(orgId: string | null) {
    setSelectedOrgId(orgId);
    const url = orgId !== null ? "?org=" + orgId : window.location.pathname;
    history.pushState({}, "", url);
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

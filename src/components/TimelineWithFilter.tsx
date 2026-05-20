// src/components/TimelineWithFilter.tsx
import { useState, useEffect, useMemo } from "react";
import type { TimelineItem, OrgOption } from "../lib/timeline";
import { filterByOrg, filterBySource } from "../lib/timeline";
import type { SourceCategory } from "../lib/sourceCategory";
import OrgFilter from "./OrgFilter";
import SourceFilter from "./SourceFilter";
import TimelineList from "./TimelineList";

type Props = {
  items: TimelineItem[];
  orgs: OrgOption[];
};

export default function TimelineWithFilter({ items, orgs }: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceCategory | "all">("all");

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

  function handleSelectOrg(orgId: string | null) {
    setSelectedOrgId(orgId);
    const url = orgId !== null ? "?org=" + orgId : window.location.pathname;
    history.pushState({}, "", url);
  }

  const filteredItems = useMemo(
    () => filterBySource(filterByOrg(items, selectedOrgId), selectedSource),
    [items, selectedOrgId, selectedSource],
  );

  return (
    <>
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Source</p>
          <SourceFilter selected={selectedSource} onSelect={setSelectedSource} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Organization</p>
          <OrgFilter orgs={orgs} selected={selectedOrgId} onSelect={handleSelectOrg} />
        </div>
      </div>
      <TimelineList items={filteredItems} />
    </>
  );
}

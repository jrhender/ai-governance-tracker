import { useState, useMemo } from "react";
import type { SourceCategory } from "../lib/sourceCategory";
import { sourceBadge, sourceCardStyle } from "../lib/sourceCategory";
import type { Jurisdiction } from "../lib/jurisdiction";
import { jurisdictionLabels, jurisdictionIcons } from "../lib/jurisdiction";
import SourceFilter from "./SourceFilter";
import JurisdictionFilter from "./JurisdictionFilter";
import { fmtDate, leadText } from "../lib/format";
import { badgeClass, statusLabel } from "../lib/legislation";

export type ArtifactEntry = {
  id: string;
  type:
    | "GovernmentProgram"
    | "JointStatement"
    | "Legislation"
    | "PolicyDocument"
    | "Report"
    | "WhitePaper";
  title: string;
  publishedDate: string; // ISO string
  summary?: string;
  description?: string;
  lifecycleStatus?: string;
  currentStage?: string;
  sourceCategory: SourceCategory;
  jurisdiction: Jurisdiction;
};

type Props = {
  artifacts: ArtifactEntry[];
};

const SECTIONS: {
  type: ArtifactEntry["type"];
  heading: string;
  description: string;
}[] = [
  {
    type: "Legislation",
    heading: "Legislation",
    description:
      "Canadian federal bills and acts related to artificial intelligence. Each entry tracks the bill's lifecycle — from introduction through readings, committee study, and royal assent (or death on the order paper).",
  },
  {
    type: "PolicyDocument",
    heading: "Policy Documents",
    description:
      "Voluntary codes of conduct, frameworks, and guidelines issued by government or industry bodies.",
  },
  {
    type: "GovernmentProgram",
    heading: "Government Programs",
    description:
      "Ongoing federal programs and national strategies related to artificial intelligence.",
  },
  {
    type: "JointStatement",
    heading: "Joint Statements",
    description:
      "Bilateral and multilateral statements on AI governance issued jointly by Canada and partner governments.",
  },
  {
    type: "Report",
    heading: "Reports",
    description:
      "Research reports and analytical summaries published by think tanks, government agencies, and advisory bodies.",
  },
  {
    type: "WhitePaper",
    heading: "White Papers",
    description:
      "Position and advocacy papers published by think tanks and civil society organizations making the case for specific AI policy approaches.",
  },
];


export default function PolicyWithSourceFilter({ artifacts }: Props) {
  const [selectedSource, setSelectedSource] = useState<SourceCategory | "all">("all");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | "all">("all");

  const filtered = useMemo(
    () =>
      artifacts
        .filter((a) => selectedSource === "all" || a.sourceCategory === selectedSource)
        .filter(
          (a) => selectedJurisdiction === "all" || a.jurisdiction === selectedJurisdiction,
        ),
    [artifacts, selectedSource, selectedJurisdiction],
  );

  return (
    <div>
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Source</p>
          <SourceFilter selected={selectedSource} onSelect={setSelectedSource} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint mb-2">Jurisdiction</p>
          <JurisdictionFilter selected={selectedJurisdiction} onSelect={setSelectedJurisdiction} />
        </div>
      </div>

      {SECTIONS.map(({ type, heading, description }) => {
        const items = filtered.filter((a) => a.type === type);
        if (items.length === 0) return null;
        return (
          <section key={type} className="mt-10">
            <h2 className="font-display text-2xl text-header">{heading}</h2>
            <p className="mt-2 max-w-2xl text-muted">{description}</p>
            <div className="mt-6 space-y-4">
              {items.map((artifact) => {
                const src = sourceBadge[artifact.sourceCategory];
                return (
                  <a
                    key={artifact.id}
                    href={`/artifacts/${artifact.id}/`}
                    className="block rounded-r-lg p-5 hover:shadow-sm transition-all no-underline"
                    style={sourceCardStyle[artifact.sourceCategory]}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-header">{artifact.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {artifact.type === "Legislation" && artifact.lifecycleStatus && (
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass(artifact.lifecycleStatus)}`}
                          >
                            {statusLabel(artifact.lifecycleStatus)}
                          </span>
                        )}
                        <span
                          className="text-xs font-bold rounded-full px-2 py-0.5"
                          style={src.style}
                        >
                          {src.label}
                        </span>
                        <span
                          role="img"
                          aria-label={jurisdictionLabels[artifact.jurisdiction]}
                          title={jurisdictionLabels[artifact.jurisdiction]}
                          className="text-xs"
                        >
                          {jurisdictionIcons[artifact.jurisdiction]}
                        </span>
                      </div>
                    </div>
                    {artifact.type === "Legislation" && artifact.currentStage && (
                      <p className="mt-2 text-sm text-muted">{artifact.currentStage}</p>
                    )}
                    {artifact.summary ? (
                      <p className="mt-2 text-sm text-muted">{artifact.summary}</p>
                    ) : artifact.description ? (
                      <p className="mt-2 text-sm text-muted line-clamp-3">
                        {leadText(artifact.description)}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-faint">
                      {artifact.type === "Legislation" ? "Introduced" : "Published"}:{" "}
                      {fmtDate(artifact.publishedDate)}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

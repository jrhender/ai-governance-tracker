import { useState, useMemo } from "react";
import type { SourceCategory } from "../lib/sourceCategory";
import SourceFilter from "./SourceFilter";
import { fmtDate } from "../lib/format";
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
  description?: string;
  lifecycleStatus?: string;
  currentStage?: string;
  sourceCategory: SourceCategory;
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

const cardStyle = {
  government: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-gov-border)",
    background: "var(--color-gov-bg)",
  },
  civil_society: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-civil-border)",
    background: "var(--color-civil-bg)",
  },
} as const;

const badgeStyle = {
  government: {
    label: "GOVERNMENT",
    style: {
      background: "var(--color-gov-badge-bg)",
      color: "var(--color-gov-badge-text)",
      border: "1px solid var(--color-gov-badge-border)",
    },
  },
  civil_society: {
    label: "CIVIL SOCIETY",
    style: {
      background: "var(--color-civil-badge-bg)",
      color: "var(--color-civil-badge-text)",
      border: "1px solid var(--color-civil-badge-border)",
    },
  },
} as const;

export default function PolicyWithSourceFilter({ artifacts }: Props) {
  const [selectedSource, setSelectedSource] = useState<SourceCategory | "all">("all");

  const filtered = useMemo(
    () =>
      selectedSource === "all"
        ? artifacts
        : artifacts.filter((a) => a.sourceCategory === selectedSource),
    [artifacts, selectedSource],
  );

  return (
    <div>
      <div className="mt-6">
        <SourceFilter selected={selectedSource} onSelect={setSelectedSource} />
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
                const src = badgeStyle[artifact.sourceCategory];
                return (
                  <a
                    key={artifact.id}
                    href={`/artifacts/${artifact.id}/`}
                    className="block rounded-r-lg p-5 hover:shadow-sm transition-all no-underline"
                    style={cardStyle[artifact.sourceCategory]}
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
                      </div>
                    </div>
                    {artifact.type === "Legislation" && artifact.currentStage && (
                      <p className="mt-2 text-sm text-muted">{artifact.currentStage}</p>
                    )}
                    {artifact.description && (
                      <p className="mt-2 text-sm text-muted">{artifact.description}</p>
                    )}
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

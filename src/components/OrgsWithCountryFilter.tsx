import { useState, useMemo } from "react";

const COUNTRY_LABELS: Record<string, string> = { ca: "Canada", uk: "UK" };

export type OrgEntry = {
  id: string;
  name: string;
  short_name?: string;
  url?: string;
  country: "ca" | "uk";
  tags: string[];
  events: number;
  artifacts: number;
};

type Props = {
  orgs: OrgEntry[];
};

export default function OrgsWithCountryFilter({ orgs }: Props) {
  const [selected, setSelected] = useState<string | null>("ca");

  const countries = useMemo(
    () => [...new Set(orgs.map((o) => o.country))].sort(),
    [orgs],
  );

  const filtered = useMemo(
    () => (selected === null ? orgs : orgs.filter((o) => o.country === selected)),
    [orgs, selected],
  );

  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active = "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by country"
        className="flex flex-wrap gap-2 mb-6"
      >
        <button
          type="button"
          aria-pressed={selected === null}
          className={`${pillBase} ${selected === null ? active : inactive}`}
          onClick={() => setSelected(null)}
        >
          All
        </button>
        {countries.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={selected === code}
            className={`${pillBase} ${selected === code ? active : inactive}`}
            onClick={() => setSelected(code)}
          >
            {COUNTRY_LABELS[code] ?? code.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-faint">No organizations found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((org) => (
            <a
              key={org.id}
              href={`/orgs/${org.id}/`}
              className="block rounded-r-lg border border-border border-l-4 border-l-accent bg-surface p-5 hover:border-l-accent-dark hover:shadow-sm transition-all no-underline"
            >
              {org.short_name ? (
                <>
                  <div className="text-base font-bold text-header">
                    {org.short_name}
                  </div>
                  <div className="mt-0.5 text-sm text-muted">{org.name}</div>
                </>
              ) : (
                <div className="text-base font-bold text-header">
                  {org.name}
                </div>
              )}
              <div className="mt-1 text-xs text-faint">
                {COUNTRY_LABELS[org.country] ?? org.country.toUpperCase()}
              </div>
              <div className="mt-3 text-xs text-faint">
                {[
                  org.events > 0 &&
                    `${org.events} event${org.events === 1 ? "" : "s"}`,
                  org.artifacts > 0 &&
                    `${org.artifacts} artifact${org.artifacts === 1 ? "" : "s"}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No events yet"}
              </div>
              {org.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {org.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-body px-2 py-0.5 text-xs text-muted border border-border-lt"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

import type { OrgOption } from "../lib/timeline";

type Props = {
  orgs: OrgOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

export default function OrgFilter({ orgs, selected, onSelect }: Props) {
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer";
  const active =
    "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900";
  const inactive =
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <div
      role="group"
      aria-label="Filter by organization"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={selected === null}
        className={`${pillBase} ${selected === null ? active : inactive}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {orgs.map((org) => (
        <button
          key={org.id}
          type="button"
          aria-pressed={selected === org.id}
          className={`${pillBase} ${selected === org.id ? active : inactive}`}
          onClick={() => onSelect(org.id)}
        >
          {org.label} ({org.count})
        </button>
      ))}
    </div>
  );
}

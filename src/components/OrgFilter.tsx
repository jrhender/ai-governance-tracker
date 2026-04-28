import type { OrgOption } from "../lib/timeline";

type Props = {
  orgs: OrgOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

export default function OrgFilter({ orgs, selected, onSelect }: Props) {
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active =
    "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

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

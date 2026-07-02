import type { Jurisdiction } from "../lib/jurisdiction";
import { jurisdictionLabels } from "../lib/jurisdiction";

type Option = { value: Jurisdiction | "all"; label: string };

const OPTIONS: Option[] = [
  { value: "all", label: "All" },
  { value: "canada", label: jurisdictionLabels.canada },
  { value: "international", label: jurisdictionLabels.international },
];

type Props = {
  selected: Jurisdiction | "all";
  onSelect: (jurisdiction: Jurisdiction | "all") => void;
};

export default function JurisdictionFilter({ selected, onSelect }: Props) {
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active = "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

  return (
    <div role="group" aria-label="Filter by jurisdiction" className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          className={`${pillBase} ${selected === value ? active : inactive}`}
          onClick={() => onSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

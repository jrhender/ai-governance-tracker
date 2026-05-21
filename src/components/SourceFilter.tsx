import type { SourceCategory } from "../lib/sourceCategory";

type Option = { value: SourceCategory | "all"; label: string };

const OPTIONS: Option[] = [
  { value: "all", label: "All" },
  { value: "government", label: "Government" },
  { value: "civil_society", label: "Civil Society" },
];

type Props = {
  selected: SourceCategory | "all";
  onSelect: (cat: SourceCategory | "all") => void;
};

export default function SourceFilter({ selected, onSelect }: Props) {
  const pillBase =
    "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";
  const active = "bg-header text-white border-header";
  const inactive =
    "bg-body text-muted border-border hover:bg-surface hover:text-ink";

  return (
    <div role="group" aria-label="Filter by source" className="flex flex-wrap gap-2">
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

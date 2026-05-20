import type { SourceCategory } from "../lib/sourceCategory";

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
      <button
        type="button"
        aria-pressed={selected === "all"}
        className={`${pillBase} ${selected === "all" ? active : inactive}`}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      <button
        type="button"
        aria-pressed={selected === "government"}
        className={`${pillBase} ${selected === "government" ? active : inactive}`}
        onClick={() => onSelect("government")}
      >
        Government
      </button>
      <button
        type="button"
        aria-pressed={selected === "civil_society"}
        className={`${pillBase} ${selected === "civil_society" ? active : inactive}`}
        onClick={() => onSelect("civil_society")}
      >
        Civil Society
      </button>
    </div>
  );
}

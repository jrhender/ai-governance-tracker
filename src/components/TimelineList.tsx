import type { TimelineItem } from "../lib/timeline";
import { fmtDate } from "../lib/format";

type Props = {
  items: TimelineItem[];
};

export default function TimelineList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-slate-500 dark:text-slate-400">
        No items match this filter.
      </p>
    );
  }

  return (
    <ol
      aria-label="Timeline"
      className="mt-10 space-y-8 border-l border-slate-200 dark:border-slate-800"
    >
      {items.map((item) => (
        <li key={item.id} className="relative pl-6">
          <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
          <time
            dateTime={item.date}
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            {fmtDate(item.date)}
          </time>
          <h2 className="mt-1 text-lg font-semibold">
            <a href={item.href} className="hover:underline">
              {item.title}
            </a>
          </h2>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {item.badge}
            </span>
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-slate-50 px-2 py-0.5 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
          {item.description && (
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

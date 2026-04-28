import type { TimelineItem } from "../lib/timeline";
import { fmtDate } from "../lib/format";

type Props = {
  items: TimelineItem[];
};

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 2h6l4 4v8H2V2h2z" />
      <path d="M10 2v4h4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="6.5" />
      <polygon points="6.5,5.5 11.5,8 6.5,10.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M7 3H3v10h10V9" />
      <path d="M10 2h4v4" />
      <path d="M13 3l-6 6" />
    </svg>
  );
}

function LinkIcon({ icon }: { icon?: string }) {
  if (icon === "video") return <VideoIcon />;
  if (icon === "document") return <DocumentIcon />;
  return <ExternalIcon />;
}

export default function TimelineList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-muted">No items match this filter.</p>
    );
  }

  return (
    <ol aria-label="Timeline" className="mt-8 border-l-2 border-accent">
      {items.map((item) => (
        <li key={item.id} className="relative pl-7 pb-8">
          <span className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-body" />
          <time
            dateTime={item.date}
            className="block text-xs text-faint font-medium mb-1"
          >
            {fmtDate(item.date)}
          </time>
          <h2 className="font-serif text-base font-semibold text-header leading-snug mb-2">
            <a href={item.href} className="hover:text-accent-dark no-underline">
              {item.title}
            </a>
          </h2>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="chip-type">{item.badge}</span>
            {item.orgs.map((org) => (
              <a key={org.id} href={`/orgs/${org.id}/`} className="chip-org">
                {org.label}
              </a>
            ))}
          </div>
          {item.description && (
            <p className="text-sm text-muted leading-relaxed mb-2 max-w-2xl">
              {item.description}
            </p>
          )}
          {item.links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {item.links.map((link) => (
                <a
                  key={`${link.url}-${link.label}`}
                  href={link.url}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent-dark hover:text-header font-medium no-underline"
                >
                  <LinkIcon icon={link.icon} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

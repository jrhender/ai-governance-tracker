export function fmtDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function humanizeType(type: string): string {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

// Plain-text lead for summaries: the first paragraph, with inline Markdown
// stripped. Folded descriptions without a blank-line break are left whole.
export function leadText(markdown: string): string {
  return markdown.split(/\n\s*\n/)[0].replace(/\*\*/g, "");
}

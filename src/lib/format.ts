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

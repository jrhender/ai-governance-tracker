import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import { parse } from "yaml";

/**
 * Load every record in the tracker as a compact summary.
 * Records without an `id` are skipped — they are not addressable.
 */
export async function loadTrackedRecords(dataDir = "data", { ignore = [] } = {}) {
  const files = (await fg(`${dataDir}/**/*.yaml`, { ignore })).sort();
  const records = [];

  for (const file of files) {
    const doc = parse(await readFile(file, "utf8"));
    if (!doc || typeof doc.id !== "string" || doc.id === "") continue;

    records.push({
      id: doc.id,
      // `yaml` may hand back a string or a Date depending on the value's
      // shape; normalise both to YYYY-MM-DD.
      date: doc.date ? toIsoDate(doc.date) : null,
      title: doc.title ?? "",
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    });
  }

  return records.sort((a, b) => a.id.localeCompare(b.id));
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// Structured parsing for Atom and RSS sources.
//
// Why this exists: the html path strips markup to prose, and a language model
// then re-reads dates out of that prose. On one ISED item it reported
// 2026-07-24 on two of three runs where the feed plainly said
// 2026-07-23T14:00:30-04:00. Feeds carry dates in a structured field, so for
// feed sources the date should never pass through inference at all.

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  // Namespace prefixes vary between publishers; drop them so `dc:date` and
  // `date` land in the same place.
  removeNSPrefix: true,
  // CDATA and entities are exactly where hand-rolled extraction goes wrong.
  processEntities: true,
  cdataPropName: "__cdata",
  trimValues: true,
});

/** Does this response look like a feed rather than a web page? */
export function looksLikeFeed(body, contentType = "") {
  if (/(atom|rss)\+xml/i.test(contentType)) return true;
  return /<\s*(feed|rss)[\s>]/i.test(body.slice(0, 2000));
}

/**
 * Parse an Atom or RSS document into flat items.
 * Never throws — an unparseable document yields an empty list, which the
 * caller treats as a failed fetch.
 */
export function parseFeed(xml) {
  let doc;
  try {
    doc = parser.parse(xml);
  } catch {
    return [];
  }
  if (!doc) return [];

  const entries = toArray(doc.feed?.entry).concat(toArray(doc.rss?.channel?.item));
  return entries.map(toItem).filter((i) => i && i.url);
}

function toItem(entry) {
  if (!entry) return null;
  const url = extractUrl(entry.link);
  if (!url) return null;

  return {
    title: text(entry.title),
    url,
    // Atom: published, falling back to updated. RSS: pubDate or dc:date.
    published: toIsoDate(text(entry.published) || text(entry.updated) || text(entry.pubDate) || text(entry.date)),
    summary: stripMarkup(text(entry.summary) || text(entry.description) || text(entry.content)),
  };
}

/** Atom uses <link href>, sometimes several; RSS uses <link>text</link>. */
function extractUrl(link) {
  for (const candidate of toArray(link)) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === "object") {
      const rel = candidate["@rel"];
      if (candidate["@href"] && (!rel || rel === "alternate")) return candidate["@href"];
    }
  }
  return null;
}

/** Unwrap CDATA and coerce whatever the parser produced into a string. */
function text(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (typeof node === "object") return text(node.__cdata ?? node["#text"] ?? "");
  return "";
}

/** Both ISO 8601 and RFC 822 appear in the wild; normalise to YYYY-MM-DD. */
function toIsoDate(value) {
  if (!value) return null;
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

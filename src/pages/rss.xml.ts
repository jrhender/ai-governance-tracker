import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { buildRssItems } from "../lib/rss";

export async function GET(context: APIContext) {
  const events = await getCollection("events");
  const artifacts = await getCollection("artifacts");

  const rssEvents = events.map((e) => ({
    id: e.id,
    title: e.data.title,
    date: e.data.date,
    description: e.data.description,
  }));

  const rssArtifacts = artifacts.map((a) => ({
    id: a.id,
    title: a.data.title,
    date: a.data.published_date,
    description: a.data.description,
    derivedFromEventIds: a.data.derives_from.map((d) => d.id.id),
  }));

  const siteUrl = (context.site?.toString() ?? "").replace(/\/$/, "");
  const items = buildRssItems(rssEvents, rssArtifacts, siteUrl);

  return rss({
    title: "AI Governance Tracker",
    description:
      "Canadian AI governance and policy updates — Senate hearings, legislation, and government action.",
    site: context.site!,
    items,
  });
}

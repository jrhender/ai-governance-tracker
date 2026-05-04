const DESCRIPTION_MAX = 300;

function truncate(text: string): string {
  if (text.length <= DESCRIPTION_MAX) return text;
  return text.slice(0, DESCRIPTION_MAX).trimEnd() + "…";
}

export type RssEvent = {
  id: string;
  title: string;
  date: Date;
  description?: string;
};

export type RssArtifact = {
  id: string;
  title: string;
  date: Date;
  description?: string;
  derivedFromEventIds: string[];
};

export type RssItem = {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
};

export function buildRssItems(
  events: RssEvent[],
  artifacts: RssArtifact[],
  siteUrl: string,
): RssItem[] {
  const derivedEventIds = new Set(
    artifacts.flatMap((a) => a.derivedFromEventIds),
  );

  const eventItems: RssItem[] = events
    .filter((e) => !derivedEventIds.has(e.id))
    .map((e) => ({
      title: e.title,
      description: truncate(e.description ?? e.title),
      pubDate: e.date,
      link: `${siteUrl}/events/${e.id}/`,
    }));

  const artifactItems: RssItem[] = artifacts.map((a) => ({
    title: a.title,
    description: truncate(a.description ?? a.title),
    pubDate: a.date,
    link: `${siteUrl}/artifacts/${a.id}/`,
  }));

  return [...eventItems, ...artifactItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );
}

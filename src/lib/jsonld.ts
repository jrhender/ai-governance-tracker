export type OrgRef = { name: string; url?: string };

function orgEntry(o: OrgRef): Record<string, unknown> {
  const entry: Record<string, unknown> = { "@type": "Organization", name: o.name };
  if (o.url) entry.url = o.url;
  return entry;
}

export function buildEventJsonLd(params: {
  title: string;
  startDate: string;
  description?: string;
  location?: string;
  orgs: OrgRef[];
  url: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: params.title,
    startDate: params.startDate,
    url: params.url,
  };
  if (params.description) ld.description = params.description;
  if (params.location) ld.location = { "@type": "Place", name: params.location };
  if (params.orgs.length > 0) ld.organizer = params.orgs.map(orgEntry);
  return ld;
}

export function buildCreativeWorkJsonLd(params: {
  title: string;
  datePublished: string;
  description?: string;
  orgs: OrgRef[];
  url: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    datePublished: params.datePublished,
    url: params.url,
  };
  if (params.description) ld.description = params.description;
  if (params.orgs.length > 0) ld.author = params.orgs.map(orgEntry);
  return ld;
}

export function buildOrgJsonLd(params: {
  name: string;
  schemaType: string;
  url?: string;
  sameAs?: string;
}): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": params.schemaType,
    name: params.name,
  };
  if (params.url) ld.url = params.url;
  if (params.sameAs) ld.sameAs = params.sameAs;
  return ld;
}

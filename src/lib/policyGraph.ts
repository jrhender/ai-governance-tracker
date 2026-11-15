import type { InstrumentType, TechnologyDomain } from "./mitigationTaxonomy";

// Links the mitigation → policy instrument → enabling technology layers.
// Instruments hold the edges (`advances` mitigations, uses `technologies`);
// this builder resolves titles and inverts them so mitigation and technology
// pages can show their neighbours. Minimal input shapes keep it unit-testable
// without `astro:content` (same pattern as riskMap.ts).
type Ref = { collection: string; id: string };

export type TitledInput = { id: string; data: { title: string } };

export type InstrumentInput = {
  id: string;
  data: {
    title: string;
    instrument_type: InstrumentType;
    advances: Ref[];
    technologies: { technology: Ref; note?: string }[];
    proposed_in: Ref[];
    implemented_by?: {
      artifact?: Ref;
      event?: Ref;
      relationship: "implements" | "partially_implements" | "related";
      note?: string;
    }[];
  };
};

export type TechnologyInput = {
  id: string;
  data: { title: string; domain: TechnologyDomain };
};

export type Linked = { id: string; title: string };
export type LinkedWithNote = Linked & { note?: string };

export type GraphInstrument = Linked & {
  instrumentType: InstrumentType;
  advances: Linked[];
  technologies: LinkedWithNote[];
  proposedIn: Linked[];
  // Canadian policies and events that put this instrument into practice.
  implementations: (LinkedWithNote & {
    kind: "artifact" | "event";
    relationship: "implements" | "partially_implements" | "related";
  })[];
};

export type GraphTechnology = Linked & {
  domain: TechnologyDomain;
  // Instruments this technology enables, with the instrument's note on how.
  instruments: LinkedWithNote[];
  // Mitigations those instruments advance, deduplicated.
  mitigations: Linked[];
};

export type PolicyGraph = {
  instruments: Map<string, GraphInstrument>;
  technologies: Map<string, GraphTechnology>;
  instrumentsByMitigation: Map<string, GraphInstrument[]>;
  // Technologies enabling any instrument for a mitigation, deduplicated.
  technologiesByMitigation: Map<string, Linked[]>;
};

const byTitle = (a: Linked, b: Linked) => a.title.localeCompare(b.title);

function pushUnique<T extends Linked>(map: Map<string, T[]>, key: string, item: T) {
  const list = map.get(key) ?? [];
  if (!list.some((x) => x.id === item.id)) list.push(item);
  map.set(key, list);
}

export function buildPolicyGraph(
  mitigations: TitledInput[],
  instruments: InstrumentInput[],
  technologies: TechnologyInput[],
  artifacts: TitledInput[],
  events: TitledInput[] = [],
): PolicyGraph {
  const mitigationTitles = new Map(mitigations.map((m) => [m.id, m.data.title]));
  const technologyTitles = new Map(technologies.map((t) => [t.id, t.data.title]));
  const artifactTitles = new Map(artifacts.map((a) => [a.id, a.data.title]));
  const eventTitles = new Map(events.map((e) => [e.id, e.data.title]));
  const resolve = (titles: Map<string, string>, ref: Ref): Linked => ({
    id: ref.id,
    title: titles.get(ref.id) ?? ref.id,
  });

  const graphInstruments = new Map<string, GraphInstrument>();
  const instrumentsByMitigation = new Map<string, GraphInstrument[]>();
  const technologiesByMitigation = new Map<string, Linked[]>();
  const instrumentsByTechnology = new Map<string, LinkedWithNote[]>();
  const mitigationsByTechnology = new Map<string, Linked[]>();

  for (const inst of instruments) {
    const gi: GraphInstrument = {
      id: inst.id,
      title: inst.data.title,
      instrumentType: inst.data.instrument_type,
      advances: inst.data.advances.map((r) => resolve(mitigationTitles, r)),
      technologies: inst.data.technologies.map((t) => ({
        ...resolve(technologyTitles, t.technology),
        note: t.note,
      })),
      proposedIn: inst.data.proposed_in.map((r) => resolve(artifactTitles, r)),
      implementations: (inst.data.implemented_by ?? []).map((impl) =>
        impl.artifact
          ? {
              kind: "artifact" as const,
              ...resolve(artifactTitles, impl.artifact),
              relationship: impl.relationship,
              note: impl.note,
            }
          : {
              kind: "event" as const,
              ...resolve(eventTitles, impl.event!),
              relationship: impl.relationship,
              note: impl.note,
            },
      ),
    };
    graphInstruments.set(gi.id, gi);

    for (const m of gi.advances) {
      pushUnique(instrumentsByMitigation, m.id, gi);
      for (const t of gi.technologies) {
        pushUnique(technologiesByMitigation, m.id, { id: t.id, title: t.title });
      }
    }
    for (const t of gi.technologies) {
      pushUnique(instrumentsByTechnology, t.id, { id: gi.id, title: gi.title, note: t.note });
      for (const m of gi.advances) pushUnique(mitigationsByTechnology, t.id, m);
    }
  }

  const graphTechnologies = new Map<string, GraphTechnology>(
    technologies.map((t) => [
      t.id,
      {
        id: t.id,
        title: t.data.title,
        domain: t.data.domain,
        instruments: (instrumentsByTechnology.get(t.id) ?? []).sort(byTitle),
        mitigations: (mitigationsByTechnology.get(t.id) ?? []).sort(byTitle),
      },
    ]),
  );

  for (const list of instrumentsByMitigation.values()) list.sort(byTitle);
  for (const list of technologiesByMitigation.values()) list.sort(byTitle);

  return {
    instruments: graphInstruments,
    technologies: graphTechnologies,
    instrumentsByMitigation,
    technologiesByMitigation,
  };
}

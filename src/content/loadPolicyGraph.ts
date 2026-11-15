// Loads the collections behind the mitigation → instrument → technology
// layers and builds the graph. Pages only; the pure builder is unit-tested.
import { getCollection } from "astro:content";
import { buildPolicyGraph } from "../lib/policyGraph";

export async function loadPolicyGraph() {
  const [mitigations, instruments, technologies, artifacts, events] = await Promise.all([
    getCollection("mitigations"),
    getCollection("instruments"),
    getCollection("technologies"),
    getCollection("artifacts"),
    getCollection("events"),
  ]);
  return buildPolicyGraph(
    mitigations.map((m) => ({ id: m.id, data: m.data })),
    instruments.map((i) => ({ id: i.id, data: i.data })),
    technologies.map((t) => ({ id: t.id, data: t.data })),
    artifacts.map((a) => ({ id: a.id, data: a.data })),
    events.map((e) => ({ id: e.id, data: e.data })),
  );
}

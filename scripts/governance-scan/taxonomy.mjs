// data/risks and data/mitigations are taxonomy terms, not developments —
// their titles are recommendation-shaped (e.g. "Enact comprehensive
// risk-based federal AI legislation") and can read like a description of a
// real bill before one exists. Both the agent's context (context.mjs) and
// the deterministic filter (filter.mjs) must agree on this exclusion — if
// one treats a taxonomy record as tracked and the other doesn't, a real
// lead can be silently dropped by whichever layer still sees it as
// "already tracked", with no way for the agent to see or explain the drop.
export const TAXONOMY_DIRS = ["data/risks/**", "data/mitigations/**"];

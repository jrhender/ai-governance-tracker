import { describe, it, expect } from "vitest";
import {
  RISK_DOMAINS,
  RISK_SUBDOMAINS,
  RISK_DOMAIN_SLUGS,
  RISK_SUBDOMAIN_SLUGS,
} from "./riskTaxonomy";

describe("MIT risk taxonomy", () => {
  it("has 7 domains and 24 subdomains", () => {
    expect(Object.keys(RISK_DOMAINS)).toHaveLength(7);
    expect(Object.keys(RISK_SUBDOMAINS)).toHaveLength(24);
  });

  it("every subdomain maps to a defined domain", () => {
    for (const [slug, sub] of Object.entries(RISK_SUBDOMAINS)) {
      expect(RISK_DOMAINS[sub.domain], `${slug} → ${sub.domain}`).toBeDefined();
    }
  });

  it("slug tuples match the records (for z.enum)", () => {
    expect([...RISK_DOMAIN_SLUGS].sort()).toEqual(Object.keys(RISK_DOMAINS).sort());
    expect([...RISK_SUBDOMAIN_SLUGS].sort()).toEqual(Object.keys(RISK_SUBDOMAINS).sort());
  });

  it("has expected subdomain counts per domain", () => {
    const counts: Record<string, number> = {};
    for (const sub of Object.values(RISK_SUBDOMAINS)) {
      counts[sub.domain] = (counts[sub.domain] ?? 0) + 1;
    }
    expect(counts).toEqual({
      "discrimination-toxicity": 3,
      "privacy-security": 2,
      misinformation: 2,
      "malicious-actors-misuse": 3,
      "human-computer-interaction": 2,
      "socioeconomic-environmental": 6,
      "ai-system-safety": 6,
    });
  });
});

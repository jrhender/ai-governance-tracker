// MIT AI Risk Taxonomy (v3) — domains and subdomains from the MIT AI Risk
// Repository (https://airisk.mit.edu/, Slattery et al., Patterns 2026).
// Used as the classification vocabulary for canonical risks in data/risks/.

export const RISK_DOMAINS = {
  "discrimination-toxicity": "Discrimination & toxicity",
  "privacy-security": "Privacy & security",
  misinformation: "Misinformation",
  "malicious-actors-misuse": "Malicious actors & misuse",
  "human-computer-interaction": "Human-computer interaction",
  "socioeconomic-environmental": "Socioeconomic & environmental harm",
  "ai-system-safety": "AI system safety, failures & limitations",
} as const;

export type RiskDomain = keyof typeof RISK_DOMAINS;

export const RISK_SUBDOMAINS = {
  // 1. Discrimination & toxicity
  "unfair-discrimination": {
    domain: "discrimination-toxicity",
    label: "Unfair discrimination and misrepresentation",
  },
  "toxic-content": {
    domain: "discrimination-toxicity",
    label: "Exposure to toxic content",
  },
  "unequal-performance": {
    domain: "discrimination-toxicity",
    label: "Unequal performance across groups",
  },
  // 2. Privacy & security
  "privacy-compromise": {
    domain: "privacy-security",
    label: "Compromise of privacy",
  },
  "security-vulnerabilities": {
    domain: "privacy-security",
    label: "AI system security vulnerabilities and attacks",
  },
  // 3. Misinformation
  "false-misleading-information": {
    domain: "misinformation",
    label: "False or misleading information",
  },
  "information-ecosystem-pollution": {
    domain: "misinformation",
    label: "Pollution of information ecosystem and loss of consensus reality",
  },
  // 4. Malicious actors & misuse
  "disinformation-surveillance-influence": {
    domain: "malicious-actors-misuse",
    label: "Disinformation, surveillance, and influence at scale",
  },
  "cyberattacks-weapons-mass-harm": {
    domain: "malicious-actors-misuse",
    label: "Cyberattacks, weapon development or use, and mass harm",
  },
  "fraud-scams-manipulation": {
    domain: "malicious-actors-misuse",
    label: "Fraud, scams, and targeted manipulation",
  },
  // 5. Human-computer interaction
  "overreliance-unsafe-use": {
    domain: "human-computer-interaction",
    label: "Overreliance and unsafe use",
  },
  "loss-of-agency-autonomy": {
    domain: "human-computer-interaction",
    label: "Loss of human agency and autonomy",
  },
  // 6. Socioeconomic & environmental harm
  "power-centralization": {
    domain: "socioeconomic-environmental",
    label: "Power centralization and unfair distribution of benefits",
  },
  "inequality-employment-decline": {
    domain: "socioeconomic-environmental",
    label: "Increased inequality and decline in employment quality",
  },
  "devaluation-of-human-effort": {
    domain: "socioeconomic-environmental",
    label: "Economic and cultural devaluation of human effort",
  },
  "competitive-dynamics": {
    domain: "socioeconomic-environmental",
    label: "Competitive dynamics",
  },
  "governance-failure": {
    domain: "socioeconomic-environmental",
    label: "Governance failure",
  },
  "environmental-harm": {
    domain: "socioeconomic-environmental",
    label: "Environmental harm",
  },
  // 7. AI system safety, failures & limitations
  misalignment: {
    domain: "ai-system-safety",
    label: "AI pursuing its own goals in conflict with human goals or values",
  },
  "dangerous-capabilities": {
    domain: "ai-system-safety",
    label: "AI possessing dangerous capabilities",
  },
  "lack-of-capability-robustness": {
    domain: "ai-system-safety",
    label: "Lack of capability or robustness",
  },
  "lack-of-transparency": {
    domain: "ai-system-safety",
    label: "Lack of transparency or interpretability",
  },
  "ai-welfare-rights": {
    domain: "ai-system-safety",
    label: "AI welfare and rights",
  },
  "multi-agent-risks": {
    domain: "ai-system-safety",
    label: "Multi-agent risks",
  },
} as const satisfies Record<string, { domain: RiskDomain; label: string }>;

export type RiskSubdomain = keyof typeof RISK_SUBDOMAINS;

export const RISK_DOMAIN_SLUGS = Object.keys(RISK_DOMAINS) as [
  RiskDomain,
  ...RiskDomain[],
];
export const RISK_SUBDOMAIN_SLUGS = Object.keys(RISK_SUBDOMAINS) as [
  RiskSubdomain,
  ...RiskSubdomain[],
];

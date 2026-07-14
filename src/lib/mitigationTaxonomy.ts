// MIT AI Risk Mitigation Taxonomy — top-level control categories from the MIT
// AI Risk Repository (https://airisk.mit.edu/ai-risk-mitigations).
// The 23 subcategories are documented below for future use but are not part
// of the v1 schema:
//   Governance & Oversight: Board Structure & Oversight; Risk Management;
//     Conflict of Interest Protections; Whistleblower Reporting & Protection;
//     Safety Decision Frameworks; Environmental Impact Management; Societal
//     Impact Assessment.
//   Technical & Security: Model & Infrastructure Security; Model Alignment;
//     Model Safety Engineering; Content Safety Controls.
//   Operational Process: Testing & Auditing; Data Governance; Access
//     Management; Staged Deployment; Post-deployment Monitoring; Incident
//     Response & Recovery.
//   Transparency & Accountability: System Documentation; Risk Disclosure;
//     Incident Reporting; Governance Disclosure; Third-Party System Access;
//     User Rights & Recourse.

export const MITIGATION_CATEGORIES = {
  "governance-oversight": "Governance & Oversight",
  "technical-security": "Technical & Security",
  "operational-process": "Operational Process",
  "transparency-accountability": "Transparency & Accountability",
} as const;

export type MitigationCategory = keyof typeof MITIGATION_CATEGORIES;

export const MITIGATION_CATEGORY_SLUGS = Object.keys(MITIGATION_CATEGORIES) as [
  MitigationCategory,
  ...MitigationCategory[],
];

// Implementation status of a mitigation — one status per canonical
// mitigation, regardless of how many reports recommend it.
export const MITIGATION_STATUSES = {
  untracked: "Untracked",
  under_review: "Under review",
  adopted: "Adopted",
  rejected: "Rejected",
} as const;

export type MitigationStatus = keyof typeof MITIGATION_STATUSES;

export const MITIGATION_STATUS_SLUGS = Object.keys(MITIGATION_STATUSES) as [
  MitigationStatus,
  ...MitigationStatus[],
];

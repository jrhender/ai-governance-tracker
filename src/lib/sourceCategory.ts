export type SourceCategory = "government" | "civil_society";

export function getSourceCategory(orgSchemaTypes: string[]): SourceCategory {
  if (orgSchemaTypes.some((t) => t === "GovernmentOrganization")) {
    return "government";
  }
  return "civil_society";
}

export const sourceBadge: Record<
  SourceCategory,
  { label: string; style: Record<string, string> }
> = {
  government: {
    label: "GOVERNMENT",
    style: {
      background: "var(--color-gov-badge-bg)",
      color: "var(--color-gov-badge-text)",
      border: "1px solid var(--color-gov-badge-border)",
    },
  },
  civil_society: {
    label: "CIVIL SOCIETY",
    style: {
      background: "var(--color-civil-badge-bg)",
      color: "var(--color-civil-badge-text)",
      border: "1px solid var(--color-civil-badge-border)",
    },
  },
};

export const sourceDotColor: Record<SourceCategory, string> = {
  government: "var(--color-gov-border)",
  civil_society: "var(--color-civil-border)",
};

export const sourceCardStyle: Record<
  SourceCategory,
  Record<string, string>
> = {
  government: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-gov-border)",
    background: "var(--color-gov-bg)",
  },
  civil_society: {
    border: "1px solid var(--color-border)",
    borderLeft: "4px solid var(--color-civil-border)",
    background: "var(--color-civil-bg)",
  },
};

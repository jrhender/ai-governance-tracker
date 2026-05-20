export type SourceCategory = "government" | "civil_society";

export function getSourceCategory(orgSchemaTypes: string[]): SourceCategory {
  if (orgSchemaTypes.some((t) => t === "GovernmentOrganization")) {
    return "government";
  }
  return "civil_society";
}

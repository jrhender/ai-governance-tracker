export type Jurisdiction = "canada" | "international";

export const jurisdictionLabels: Record<Jurisdiction, string> = {
  canada: "Canada",
  international: "International",
};

export const jurisdictionIcons: Record<Jurisdiction, string> = {
  canada: "🇨🇦",
  international: "🌐",
};

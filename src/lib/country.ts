// Org records carry a `country` (ca | uk | international) rather than a
// `jurisdiction`; labels and icons for both live in their own modules so the
// two vocabularies don't get conflated.
export const countryLabels: Record<string, string> = {
  ca: "Canada",
  uk: "UK",
  international: "International",
};

export const countryIcons: Record<string, string> = {
  ca: "🇨🇦",
  uk: "🇬🇧",
  international: "🌐",
};

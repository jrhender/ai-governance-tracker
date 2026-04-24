const STATUS_CLASSES: Record<string, string> = {
  active: "bg-blue-600 text-white",
  enacted: "bg-green-600 text-white",
  died: "bg-red-600 text-white",
  withdrawn: "bg-slate-500 text-white",
};

export function badgeClass(status: string | undefined): string {
  return STATUS_CLASSES[status ?? ""] ?? "bg-slate-500 text-white";
}

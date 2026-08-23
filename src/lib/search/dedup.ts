import type { VisualReference } from "@/lib/pinterest/types";

export function deduplicateReferences(
  items: VisualReference[]
): VisualReference[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.sourceId || item.imageUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

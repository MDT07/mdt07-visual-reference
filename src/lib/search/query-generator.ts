import type { DesignBrief, SearchMode, SearchStrategy } from "./types";

export function generateSearchStrategies(
  brief: DesignBrief,
  mode: SearchMode = "inspiration"
): SearchStrategy[] {
  const strategies: SearchStrategy[] = [];

  const base = [
    brief.projectType,
    brief.industry,
    brief.websiteType,
    ...brief.style,
  ]
    .filter(Boolean)
    .join(" ");

  if (base) {
    strategies.push({
      query: `${base} website design`.trim(),
      weight: 1,
      intent: "primary",
    });
    strategies.push({
      query: `${base} web design`.trim(),
      weight: 0.95,
      intent: "primary",
    });
  }

  if (brief.industry) {
    strategies.push({
      query: `${brief.industry} website UI`,
      weight: 0.8,
      intent: "industry",
    });
  }

  for (const style of brief.style.slice(0, 3)) {
    strategies.push({
      query: `${style} web design ${brief.websiteType ?? ""}`.trim(),
      weight: 0.75,
      intent: "style",
    });
  }

  if (mode === "premium" || mode === "experimental") {
    strategies.push({
      query: `award winning ${brief.industry ?? ""} website design`.trim(),
      weight: 0.6,
      intent: "experimental",
    });
    strategies.push({
      query: `premium ${brief.industry ?? ""} web design`.trim(),
      weight: 0.6,
      intent: "experimental",
    });
  }

  return strategies.slice(0, 6);
}

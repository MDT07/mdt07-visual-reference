import type { DesignBrief } from "./types";

const INDUSTRIES = [
  "fashion",
  "architecture",
  "automotive",
  "hospitality",
  "finance",
  "technology",
  "saas",
  "ecommerce",
  "agency",
  "portfolio",
  "music",
  "art",
];

const STYLES = [
  "minimal",
  "editorial",
  "brutalist",
  "luxury",
  "premium",
  "dark",
  "monochrome",
  "glassmorphism",
  "swiss",
  "organic",
  "experimental",
  "playful",
  "futuristic",
  "corporate",
];

const MOODS = [
  "cinematic",
  "dramatic",
  "premium",
  "quiet",
  "bold",
  "elegant",
  "energetic",
  "calm",
  "sophisticated",
  "artistic",
];

const COLORS = [
  "black",
  "white",
  "cream",
  "ivory",
  "gold",
  "silver",
  "navy",
  "beige",
  "gray",
  "red",
  "blue",
  "green",
  "muted",
  "warm",
  "cold",
  "neutral",
];

const TYPOGRAPHY = [
  "serif",
  "sans-serif",
  "display",
  "condensed",
  "oversized",
  "minimal",
  "expressive",
  "editorial",
  "monospace",
];

const LAYOUTS = [
  "grid",
  "asymmetric",
  "centered",
  "split-screen",
  "full-screen",
  "editorial",
  "masonry",
  "horizontal",
  "vertical",
  "modular",
];

function extractTokens(text: string, dictionary: string[]): string[] {
  const lower = text.toLowerCase();
  return dictionary.filter((token) => lower.includes(token));
}

function inferProjectType(text: string): string | undefined {
  const match = text.match(
    /(?:for|of)\s+a[n]?\s+(.+?)\s+(website|site|app|platform)/i
  );
  return match ? `${match[1]} ${match[2]}`.toLowerCase() : undefined;
}

export function parseDesignBrief(prompt: string): DesignBrief {
  const text = prompt.trim();
  return {
    raw: text,
    projectType: inferProjectType(text),
    industry: extractTokens(text, INDUSTRIES)[0],
    websiteType:
      text.match(/(landing page|portfolio|ecommerce|dashboard|website)/i)?.[1]
        ?.toLowerCase(),
    style: extractTokens(text, STYLES),
    mood: extractTokens(text, MOODS),
    colors: extractTokens(text, COLORS),
    typography: extractTokens(text, TYPOGRAPHY),
    layout: extractTokens(text, LAYOUTS),
    imagery: [],
    motion: [],
    quality:
      text.includes("premium") || text.includes("awwwards") ? "premium" : "high",
    quantity: 20,
  };
}

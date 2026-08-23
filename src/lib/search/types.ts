import type { VisualReference } from "@/lib/pinterest/types";

export type SearchMode = "inspiration" | "precision" | "premium" | "experimental";

export interface DesignBrief {
  raw: string;
  projectType?: string;
  industry?: string;
  websiteType?: string;
  style: string[];
  mood: string[];
  colors: string[];
  typography: string[];
  layout: string[];
  imagery: string[];
  motion: string[];
  quality: "standard" | "high" | "premium";
  quantity: number;
}

export interface SearchStrategy {
  query: string;
  weight: number;
  intent: "primary" | "style" | "industry" | "experimental";
}

export interface SearchPipelineInput {
  prompt: string;
  mode?: SearchMode;
  limit?: number;
  maxQueries?: number;
  maxPagesPerQuery?: number;
}

export interface SearchPipelineResult {
  brief: DesignBrief;
  strategies: SearchStrategy[];
  candidates: number;
  duplicatesRemoved: number;
  results: VisualReference[];
}

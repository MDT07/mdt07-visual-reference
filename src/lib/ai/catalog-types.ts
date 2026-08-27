export type CatalogAnalysisPriority = "high" | "medium" | "low";
export type CatalogAnalysisConfidence = "high" | "medium" | "low";

export interface CatalogAnalysisInput {
  project: {
    name: string;
    brief: string;
    status: "active" | "archived";
  };
  collections: Array<{
    name: string;
    description: string;
    referenceCount: number;
    references: Array<{
      ordinal: number;
      notes: string;
      tags: string[];
      favorite: boolean;
      workflowStatus: "saved" | "shortlisted" | "archived";
    }>;
  }>;
  totals: {
    collections: number;
    references: number;
    referencesIncluded: number;
    annotated: number;
    favorites: number;
    shortlisted: number;
  };
  excludedData: string[];
}

export interface CatalogAnalysisResult {
  summary: string;
  creativeDirections: string[];
  strengths: string[];
  gaps: string[];
  patterns: Array<{
    label: string;
    evidence: string;
    confidence: CatalogAnalysisConfidence;
  }>;
  recommendations: Array<{
    title: string;
    rationale: string;
    priority: CatalogAnalysisPriority;
  }>;
  nextResearchPrompts: string[];
  cautions: string[];
}

export interface StoredCatalogAnalysis {
  id: string;
  projectId: string;
  model: string;
  promptVersion: string;
  inputFingerprint: string;
  inputSummary: {
    collections: number;
    references: number;
    referencesIncluded: number;
    annotated: number;
  };
  result: CatalogAnalysisResult;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  createdAt: string;
}

export interface CatalogAnalysisPreview {
  payload: CatalogAnalysisInput;
  fingerprint: string;
  promptVersion: string;
  providerConfigured: boolean;
  provider: string;
  model: string;
  retentionNotice: string;
}

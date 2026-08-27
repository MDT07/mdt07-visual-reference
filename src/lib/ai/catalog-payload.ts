import { createHash } from "node:crypto";

import type { CatalogAnalysisInput } from "@/lib/ai/catalog-types";
import type { ResearchProject } from "@/lib/store/projects";

export const CATALOG_ANALYSIS_PROMPT_VERSION = "catalog-direction-v2";

export interface CatalogFingerprintContext {
  provider: string;
  model: string;
  promptVersion: string;
}

export function buildCatalogAnalysisInput(
  project: ResearchProject,
  selectedCollectionIds: string[],
  maxReferences: number
): CatalogAnalysisInput {
  const selected = new Set(selectedCollectionIds);
  const collections = project.collections.filter(
    (collection) => selected.size === 0 || selected.has(collection.id)
  );

  let remaining = Math.max(1, maxReferences);
  let annotated = 0;
  let favorites = 0;
  let shortlisted = 0;
  let referencesIncluded = 0;

  const safeCollections = collections.map((collection) => {
    const references = collection.references.slice(0, remaining).map((reference, index) => {
      const notes = reference.catalog.notes.slice(0, 1200);
      const tags = reference.catalog.tags.slice(0, 20).map((tag) => tag.slice(0, 32));
      if (notes || tags.length > 0) annotated += 1;
      if (reference.catalog.favorite) favorites += 1;
      if (reference.catalog.status === "shortlisted") shortlisted += 1;
      referencesIncluded += 1;
      return {
        ordinal: index + 1,
        notes,
        tags,
        favorite: reference.catalog.favorite,
        workflowStatus: reference.catalog.status,
      };
    });
    remaining -= references.length;
    return {
      name: collection.name.slice(0, 120),
      description: collection.description.slice(0, 1000),
      referenceCount: collection.references.length,
      references,
    };
  });

  const totalReferences = collections.reduce(
    (sum, collection) => sum + collection.references.length,
    0
  );

  return {
    project: {
      name: project.name.slice(0, 120),
      brief: project.brief.slice(0, 2000),
      status: project.status,
    },
    collections: safeCollections,
    totals: {
      collections: collections.length,
      references: totalReferences,
      referencesIncluded,
      annotated,
      favorites,
      shortlisted,
    },
    excludedData: [
      "Pinterest images and video",
      "Pin titles and descriptions",
      "Pinterest source URLs and account identifiers",
      "OAuth tokens and application secrets",
      "GitHub profile data and email address",
    ],
  };
}

export function catalogInputFingerprint(
  input: CatalogAnalysisInput,
  context: CatalogFingerprintContext
): string {
  return createHash("sha256")
    .update(JSON.stringify({ input, context }))
    .digest("hex");
}

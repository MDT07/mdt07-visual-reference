import { describe, expect, it } from "vitest";

import {
  buildCatalogAnalysisInput,
  catalogInputFingerprint,
  CATALOG_ANALYSIS_PROMPT_VERSION,
} from "@/lib/ai/catalog-payload";
import type { ResearchProject } from "@/lib/store/projects";

const project: ResearchProject = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Editorial portfolio",
  brief: "Create a precise, typography-led web experience.",
  status: "active",
  createdAt: "2026-08-27T00:00:00.000Z",
  updatedAt: "2026-08-27T00:00:00.000Z",
  collections: [
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Typography",
      description: "High-contrast editorial rhythm.",
      sortOrder: 0,
      createdAt: "2026-08-27T00:00:00.000Z",
      updatedAt: "2026-08-27T00:00:00.000Z",
      references: [
        {
          id: "pinterest:123",
          source: "pinterest",
          sourceId: "123",
          sourceUrl: "https://www.pinterest.com/pin/123/",
          title: "Pinterest title must not leave the Studio",
          description: "Pinterest description must not leave the Studio",
          imageUrl: "https://i.pinimg.com/originals/private-looking-path.jpg",
          authorUsername: "external-account",
          fetchedAt: "2026-08-27T00:00:00.000Z",
          catalog: {
            recordId: "00000000-0000-4000-8000-000000000003",
            notes: "Use the deliberate scale contrast, but create original typography.",
            tags: ["editorial", "type-scale"],
            favorite: true,
            status: "shortlisted",
            savedAt: "2026-08-27T00:00:00.000Z",
            updatedAt: "2026-08-27T00:00:00.000Z",
          },
        },
      ],
    },
  ],
};

describe("AI catalog payload boundary", () => {
  const fingerprintContext = {
    provider: "OpenRouter",
    model: "z-ai/glm-5.2:free",
    promptVersion: CATALOG_ANALYSIS_PROMPT_VERSION,
  };

  it("includes owner-authored research fields and excludes Pinterest content", () => {
    const payload = buildCatalogAnalysisInput(project, [], 50);
    const serialized = JSON.stringify(payload);

    expect(payload.project.brief).toContain("typography-led");
    expect(payload.collections[0]?.references[0]?.notes).toContain("scale contrast");
    expect(payload.collections[0]?.references[0]?.tags).toEqual(["editorial", "type-scale"]);
    expect(serialized).not.toContain("pinterest.com");
    expect(serialized).not.toContain("i.pinimg.com");
    expect(serialized).not.toContain("Pinterest title must not leave");
    expect(serialized).not.toContain("external-account");
    expect(serialized).not.toContain("00000000-0000-4000-8000-000000000003");
  });

  it("creates a stable fingerprint and changes it with reviewed catalog data", () => {
    const first = buildCatalogAnalysisInput(project, [], 50);
    const second = buildCatalogAnalysisInput(
      { ...project, brief: `${project.brief} Add restrained motion.` },
      [],
      50
    );

    expect(catalogInputFingerprint(first, fingerprintContext)).toHaveLength(64);
    expect(catalogInputFingerprint(first, fingerprintContext)).toBe(
      catalogInputFingerprint(first, fingerprintContext)
    );
    expect(catalogInputFingerprint(first, fingerprintContext)).not.toBe(
      catalogInputFingerprint(second, fingerprintContext)
    );
  });

  it("binds consent to the provider, model, and prompt version", () => {
    const payload = buildCatalogAnalysisInput(project, [], 50);
    const reviewed = catalogInputFingerprint(payload, fingerprintContext);

    expect(reviewed).not.toBe(
      catalogInputFingerprint(payload, {
        ...fingerprintContext,
        model: "another/free-model",
      })
    );
    expect(reviewed).not.toBe(
      catalogInputFingerprint(payload, {
        ...fingerprintContext,
        provider: "another-provider",
      })
    );
    expect(reviewed).not.toBe(
      catalogInputFingerprint(payload, {
        ...fingerprintContext,
        promptVersion: "catalog-direction-v3",
      })
    );
  });

  it("limits the number of reference annotations sent", () => {
    const repeated = Array.from({ length: 5 }, (_, index) => ({
      ...project.collections[0]!.references[0]!,
      id: `pinterest:${index}`,
      sourceId: String(index),
      catalog: {
        ...project.collections[0]!.references[0]!.catalog,
        recordId: `00000000-0000-4000-8000-00000000000${index}`,
      },
    }));
    const payload = buildCatalogAnalysisInput(
      {
        ...project,
        collections: [{ ...project.collections[0]!, references: repeated }],
      },
      [],
      2
    );

    expect(payload.totals.references).toBe(5);
    expect(payload.totals.referencesIncluded).toBe(2);
    expect(payload.collections[0]?.references).toHaveLength(2);
  });
});

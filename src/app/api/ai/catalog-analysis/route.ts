import { NextRequest, NextResponse } from "next/server";

import {
  buildCatalogAnalysisInput,
  catalogInputFingerprint,
  CATALOG_ANALYSIS_PROMPT_VERSION,
} from "@/lib/ai/catalog-payload";
import { runOpenAiCatalogAnalysis } from "@/lib/ai/openai-catalog";
import { requireOwnerApi } from "@/lib/auth/authorization";
import {
  aiCatalogConfig,
  isAiCatalogConfigured,
} from "@/lib/config";
import { enforceMutationRateLimit } from "@/lib/security/mutation-rate-limit";
import { hasValidMutationOrigin } from "@/lib/security/request";
import {
  listCatalogAnalyses,
  saveCatalogAnalysis,
} from "@/lib/store/ai-analyses";
import { getProject, recordAuditEvent } from "@/lib/store/projects";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" } as const;
const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!isUuid(projectId)) {
    return NextResponse.json(
      { error: "A valid project ID is required." },
      { status: 400, headers: noStore }
    );
  }
  try {
    return NextResponse.json(
      { analyses: await listCatalogAnalyses(projectId, 10) },
      { headers: noStore }
    );
  } catch (error) {
    console.error(
      "AI analysis history failed",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Analysis history is temporarily unavailable." },
      { status: 503, headers: noStore }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: noStore }
    );
  }
  const limitError = await enforceMutationRateLimit(
    request,
    "ai-catalog-analysis",
    12
  );
  if (limitError) return limitError;

  const body = (await request.json().catch(() => ({}))) as {
    action?: unknown;
    projectId?: unknown;
    collectionIds?: unknown;
    confirmedFingerprint?: unknown;
    consent?: unknown;
  };
  const action = body.action === "analyze" ? "analyze" : body.action === "preview" ? "preview" : null;
  const collectionIds = Array.isArray(body.collectionIds)
    ? [...new Set(body.collectionIds.filter(isUuid))].slice(0, 50)
    : [];
  if (
    !action ||
    !isUuid(body.projectId) ||
    !Array.isArray(body.collectionIds) ||
    collectionIds.length === 0 ||
    collectionIds.length !== body.collectionIds.length
  ) {
    return NextResponse.json(
      { error: "A valid analysis action, project, and collection selection are required." },
      { status: 400, headers: noStore }
    );
  }

  try {
    const project = await getProject(body.projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: noStore }
      );
    }
    if (collectionIds.some((id) => !project.collections.some((collection) => collection.id === id))) {
      return NextResponse.json(
        { error: "The collection selection is not part of this project." },
        { status: 400, headers: noStore }
      );
    }

    const payload = buildCatalogAnalysisInput(
      project,
      collectionIds,
      aiCatalogConfig.maxReferences
    );
    const fingerprint = catalogInputFingerprint(payload);
    const preview = {
      payload,
      fingerprint,
      promptVersion: CATALOG_ANALYSIS_PROMPT_VERSION,
      providerConfigured: isAiCatalogConfigured(),
      model: aiCatalogConfig.model,
      retentionNotice:
        "Only the payload shown here is sent to OpenAI. The request uses store=false. OpenAI API data is not used for training by default, while abuse-monitoring logs may be retained for up to 30 days unless the API project has approved data-retention controls.",
    };

    if (action === "preview") {
      return NextResponse.json({ preview }, { headers: noStore });
    }

    if (body.consent !== true || body.confirmedFingerprint !== fingerprint) {
      return NextResponse.json(
        { error: "Preview and explicitly confirm the current payload before analysis." },
        { status: 409, headers: noStore }
      );
    }
    if (!isAiCatalogConfigured()) {
      return NextResponse.json(
        { error: "AI catalog analysis is not configured on this private host." },
        { status: 503, headers: noStore }
      );
    }
    const hasResearchContext = Boolean(
      payload.project.brief ||
        payload.collections.some(
          (collection) =>
            collection.description ||
            collection.references.some(
              (reference) => reference.notes || reference.tags.length > 0
            )
        )
    );
    if (!hasResearchContext) {
      return NextResponse.json(
        { error: "Add a project brief, collection description, notes, or tags before running AI analysis." },
        { status: 400, headers: noStore }
      );
    }

    const generated = await runOpenAiCatalogAnalysis(payload);
    const analysis = await saveCatalogAnalysis({
      projectId: project.id,
      promptVersion: CATALOG_ANALYSIS_PROMPT_VERSION,
      model: generated.model,
      inputFingerprint: fingerprint,
      inputSummary: {
        collections: payload.totals.collections,
        references: payload.totals.references,
        referencesIncluded: payload.totals.referencesIncluded,
        annotated: payload.totals.annotated,
      },
      result: generated.result,
      usage: generated.usage,
    });
    await recordAuditEvent("ai.catalog_analysis.completed", "ai_analysis", analysis.id, {
      projectId: project.id,
      model: generated.model,
      promptVersion: CATALOG_ANALYSIS_PROMPT_VERSION,
      collections: payload.totals.collections,
      referencesIncluded: payload.totals.referencesIncluded,
    });
    return NextResponse.json({ analysis }, { status: 201, headers: noStore });
  } catch (error) {
    console.error(
      "AI catalog analysis failed",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "AI analysis could not be completed. No catalog data was changed." },
      { status: 503, headers: noStore }
    );
  }
}

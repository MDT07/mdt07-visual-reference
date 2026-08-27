"use client";

import { useEffect, useState } from "react";

import type {
  CatalogAnalysisPreview,
  StoredCatalogAnalysis,
} from "@/lib/ai/catalog-types";
import type { ResearchProject } from "@/lib/store/projects";

interface CatalogAnalysisPanelProps {
  project?: ResearchProject;
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {title}
      </h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
        {items.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}
      </ul>
    </section>
  );
}

function AnalysisResult({ analysis }: { analysis: StoredCatalogAnalysis }) {
  return (
    <article className="space-y-5 rounded-xl border border-surface-3 bg-surface-0 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-tertiary">
            {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.createdAt))}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {analysis.model} · {analysis.usage.totalTokens.toLocaleString()} tokens
          </p>
        </div>
        <span className="rounded-full border border-surface-3 px-3 py-1 text-xs text-text-secondary">
          Read-only report
        </span>
      </div>
      <p className="text-sm leading-7 text-text-primary">{analysis.result.summary}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <ResultList title="Creative directions" items={analysis.result.creativeDirections} />
        <ResultList title="Strengths" items={analysis.result.strengths} />
        <ResultList title="Gaps" items={analysis.result.gaps} />
        <ResultList title="Next research prompts" items={analysis.result.nextResearchPrompts} />
      </div>
      {analysis.result.patterns.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Patterns</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {analysis.result.patterns.map((pattern, index) => (
              <div key={`${index}:${pattern.label}`} className="rounded-lg border border-surface-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{pattern.label}</p>
                  <span className="text-xs text-text-tertiary">{pattern.confidence} confidence</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{pattern.evidence}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {analysis.result.recommendations.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Recommendations</h4>
          <ol className="mt-3 space-y-3">
            {analysis.result.recommendations.map((recommendation, index) => (
              <li key={`${index}:${recommendation.title}`} className="rounded-lg border border-surface-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{recommendation.title}</p>
                  <span className="text-xs text-text-tertiary">{recommendation.priority} priority</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{recommendation.rationale}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      <ResultList title="Cautions" items={analysis.result.cautions} />
    </article>
  );
}

export default function CatalogAnalysisPanel({ project }: CatalogAnalysisPanelProps) {
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<CatalogAnalysisPreview | null>(null);
  const [analyses, setAnalyses] = useState<StoredCatalogAnalysis[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const collectionKey = project?.collections.map((collection) => collection.id).join(":") ?? "";

  useEffect(() => {
    setSelectedCollectionIds(project?.collections.map((collection) => collection.id) ?? []);
    setPreview(null);
    setConsent(false);
    setMessage(null);
  }, [project?.id, collectionKey, project?.updatedAt]);

  useEffect(() => {
    if (!project) {
      setAnalyses([]);
      return;
    }
    const controller = new AbortController();
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await fetch(`/api/ai/catalog-analysis?projectId=${encodeURIComponent(project.id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => ({}))) as {
          analyses?: StoredCatalogAnalysis[];
        };
        if (response.ok) setAnalyses(body.analyses ?? []);
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false);
      }
    };
    void loadHistory();
    return () => controller.abort();
  }, [project?.id]);

  const toggleCollection = (collectionId: string, checked: boolean) => {
    setSelectedCollectionIds((current) =>
      checked
        ? [...new Set([...current, collectionId])]
        : current.filter((id) => id !== collectionId)
    );
    setPreview(null);
    setConsent(false);
    setMessage(null);
  };

  const preparePreview = async () => {
    if (!project || loading || selectedCollectionIds.length === 0) return;
    setLoading(true);
    setMessage(null);
    setConsent(false);
    try {
      const response = await fetch("/api/ai/catalog-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          projectId: project.id,
          collectionIds: selectedCollectionIds,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        preview?: CatalogAnalysisPreview;
        error?: string;
      };
      if (!response.ok || !body.preview) throw new Error(body.error ?? "Preview could not be prepared.");
      setPreview(body.preview);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Preview could not be prepared.");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!project || !preview || !consent || !preview.providerConfigured || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/ai/catalog-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          projectId: project.id,
          collectionIds: selectedCollectionIds,
          confirmedFingerprint: preview.fingerprint,
          consent: true,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        analysis?: StoredCatalogAnalysis;
        error?: string;
      };
      if (!response.ok || !body.analysis) throw new Error(body.error ?? "Analysis could not be completed.");
      setAnalyses((current) => [body.analysis!, ...current]);
      setPreview(null);
      setConsent(false);
      setMessage("Analysis completed. The report is read-only and no catalog or Pinterest data was changed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 border-t border-surface-2 pt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Owner-controlled AI</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Catalog direction analysis</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
            Analyze only the project brief and owner-authored collection descriptions, notes, tags, favorites, and workflow states.
            Pinterest images, Pin text, URLs, account data, and OAuth credentials are excluded.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-surface-3 px-3 py-1 text-xs text-text-secondary">
          No tools · no write actions
        </span>
      </div>

      {!project ? (
        <p className="rounded-xl border border-surface-3 bg-surface-1 p-5 text-sm text-text-tertiary">
          Create or select a project before preparing an AI analysis.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4 rounded-xl border border-surface-3 bg-surface-1 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">1. Choose app-owned scope</h3>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">Nothing is sent while selecting collections.</p>
            </div>
            {project.collections.length === 0 ? (
              <p className="text-sm text-text-tertiary">This project has no collections yet.</p>
            ) : (
              <div className="space-y-2">
                {project.collections.map((collection) => (
                  <label key={collection.id} className="flex items-start gap-3 rounded-lg border border-surface-3 bg-surface-0 p-3">
                    <input
                      type="checkbox"
                      checked={selectedCollectionIds.includes(collection.id)}
                      onChange={(event) => toggleCollection(collection.id, event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-text-primary">{collection.name}</span>
                      <span className="mt-1 block text-xs text-text-tertiary">
                        {collection.references.length} references · {collection.references.filter((reference) => reference.catalog.notes || reference.catalog.tags.length > 0).length} annotated
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => void preparePreview()}
              disabled={loading || selectedCollectionIds.length === 0}
              className="rounded-md bg-text-primary px-4 py-2 text-sm font-medium text-surface-0 disabled:opacity-50"
            >
              {loading ? "Preparing…" : "Prepare exact payload"}
            </button>
          </div>

          <div className="space-y-4 rounded-xl border border-surface-3 bg-surface-1 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">2. Inspect and confirm</h3>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">The fingerprint makes this preview immutable for the analysis request.</p>
            </div>
            {!preview ? (
              <p className="text-sm text-text-tertiary">Prepare the payload to see every field that would leave the private Studio.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    ["Collections", preview.payload.totals.collections],
                    ["References", preview.payload.totals.referencesIncluded],
                    ["Annotated", preview.payload.totals.annotated],
                    ["Provider", preview.provider],
                    ["Model", preview.model],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-surface-3 bg-surface-0 p-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.12em] text-text-tertiary">{label}</p>
                      <p className="mt-1 break-words text-sm font-medium text-text-primary">{value}</p>
                    </div>
                  ))}
                </div>
                <details className="rounded-lg border border-surface-3 bg-surface-0 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-text-primary">View exact JSON payload</summary>
                  <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-text-secondary">
                    {JSON.stringify(preview.payload, null, 2)}
                  </pre>
                </details>
                <p className="text-xs leading-5 text-text-tertiary">{preview.retentionNotice}</p>
                {!preview.providerConfigured && (
                  <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    Preview is ready, but model execution is disabled until AI_CATALOG_ENABLED and OPENROUTER_API_KEY are configured on the private Studio only.
                  </p>
                )}
                <label className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1.5" />
                  I reviewed this exact payload and authorize this one read-only analysis request.
                </label>
                <button
                  type="button"
                  onClick={() => void runAnalysis()}
                  disabled={loading || !consent || !preview.providerConfigured}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? "Analyzing…" : "Run read-only analysis"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {message && <p className="text-sm text-text-secondary" role="status">{message}</p>}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-text-primary">Analysis history</h3>
        {historyLoading ? (
          <p className="text-sm text-text-tertiary">Loading analysis history…</p>
        ) : analyses.length === 0 ? (
          <p className="text-sm text-text-tertiary">No AI reports have been generated for this project.</p>
        ) : (
          analyses.map((analysis) => <AnalysisResult key={analysis.id} analysis={analysis} />)
        )}
      </div>
    </section>
  );
}

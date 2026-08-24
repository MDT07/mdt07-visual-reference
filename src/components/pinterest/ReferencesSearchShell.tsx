"use client";

import { useState } from "react";

import type { VisualReference } from "@/lib/pinterest/types";
import type { SearchPipelineResult } from "@/lib/search/types";
import SearchForm from "./SearchForm";
import ReferenceCard from "@/components/search/ReferenceCard";
import CurateButton from "./CurateButton";
import MoodboardGrid from "./MoodboardGrid";

interface ReferencesSearchShellProps {
  presets: string[];
  isAvailable: boolean;
  labels: {
    placeholder: string;
    button: string;
    save: string;
    saved: string;
    loadMore: string;
    noResults: string;
    initial: string;
  };
  moodboardLabels: {
    attribution: string;
    originalPin: string;
    empty: string;
  };
}

export default function ReferencesSearchShell({
  presets,
  isAvailable,
  labels,
  moodboardLabels,
}: ReferencesSearchShellProps) {
  const [items, setItems] = useState<VisualReference[]>([]);
  const [pipelineMeta, setPipelineMeta] = useState<{
    brief: SearchPipelineResult["brief"];
    strategies: SearchPipelineResult["strategies"];
    candidates: number;
    duplicatesRemoved: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sessionReferences, setSessionReferences] = useState<VisualReference[]>(
    []
  );

  const performSearch = async (q: string) => {
    if (!isAvailable) return;
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pinterest/search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Search failed: ${res.status}`);
      }
      const data: SearchPipelineResult = await res.json();
      setItems(data.results);
      setPipelineMeta({
        brief: data.brief,
        strategies: data.strategies,
        candidates: data.candidates,
        duplicatesRemoved: data.duplicatesRemoved,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <SearchForm
        presets={presets}
        onSearch={(q) => {
          void performSearch(q);
        }}
        isLoading={isLoading}
        isDisabled={!isAvailable}
        labels={{ placeholder: labels.placeholder, button: labels.button }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {pipelineMeta && (
        <details className="rounded-lg border border-surface-3 bg-surface-1 p-4 text-sm text-text-secondary">
          <summary className="cursor-pointer font-medium text-text-primary">
            Search pipeline ({pipelineMeta.candidates} candidates,{" "}
            {pipelineMeta.duplicatesRemoved} duplicates removed)
          </summary>
          <div className="mt-3 space-y-2">
            <p>
              <span className="font-medium">Parsed brief:</span>{" "}
              {pipelineMeta.brief.industry || "—"} /{" "}
              {pipelineMeta.brief.style.join(", ") || "—"} /{" "}
              {pipelineMeta.brief.mood.join(", ") || "—"}
            </p>
            <p className="font-medium">Interpretation strategies:</p>
            <ul className="list-disc space-y-1 pl-5">
              {pipelineMeta.strategies.map((strategy) => (
                <li key={strategy.query}>
                  {strategy.query}{" "}
                  <span className="text-text-tertiary">
                    (weight {strategy.weight}, {strategy.intent})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          {hasSearched ? labels.noResults : labels.initial}
        </p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((reference) => (
              <ReferenceCard
                key={reference.id}
                reference={reference}
                footer={
                  <CurateButton
                    onSave={() => {
                      setSessionReferences((current) =>
                        current.some((item) => item.id === reference.id)
                          ? current
                          : [reference, ...current]
                      );
                      return true;
                    }}
                    labels={{ save: labels.save, saved: labels.saved }}
                  />
                }
              />
            ))}
          </div>
        </div>
      )}

      <section className="border-t border-surface-2 pt-12">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Current session
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            Moodboard
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            Selected references remain only in this open page and are not saved
            to the server or browser storage. Refreshing the page clears this
            moodboard.
          </p>
        </div>
        <MoodboardGrid pins={sessionReferences} labels={moodboardLabels} />
      </section>
    </div>
  );
}

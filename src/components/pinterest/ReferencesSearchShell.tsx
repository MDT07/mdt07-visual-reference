"use client";

import { useEffect, useState } from "react";

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

interface PublicBoardOption {
  id: string;
  name: string;
  pinCount: number;
  ownerUsername?: string;
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
    boardName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [boards, setBoards] = useState<PublicBoardOption[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [boardsLoading, setBoardsLoading] = useState(isAvailable);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [sessionReferences, setSessionReferences] = useState<VisualReference[]>(
    []
  );

  useEffect(() => {
    if (!isAvailable) {
      setBoardsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadBoards = async () => {
      setBoardsLoading(true);
      setBoardsError(null);
      try {
        const response = await fetch("/api/pinterest/boards", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => ({}))) as {
          boards?: PublicBoardOption[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? `Board loading failed: ${response.status}`);
        }
        const publicBoards = body.boards ?? [];
        setBoards(publicBoards);
        setSelectedBoardId((current) => current || publicBoards[0]?.id || "");
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setBoardsError(
          loadError instanceof Error ? loadError.message : "Public boards could not be loaded."
        );
      } finally {
        if (!controller.signal.aborted) setBoardsLoading(false);
      }
    };

    void loadBoards();
    return () => controller.abort();
  }, [isAvailable]);

  const performSearch = async (q: string) => {
    if (!isAvailable) return;
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q, boardId: selectedBoardId });
      const res = await fetch(`/api/pinterest/search?${params.toString()}`, {
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
        boardName:
          boards.find((board) => board.id === selectedBoardId)?.name ?? "Selected board",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {isAvailable && (
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-text-primary"
            htmlFor="pinterest-source-board"
          >
            Public Pinterest board
          </label>
          <select
            id="pinterest-source-board"
            value={selectedBoardId}
            onChange={(event) => {
              setSelectedBoardId(event.target.value);
              setItems([]);
              setPipelineMeta(null);
              setHasSearched(false);
            }}
            disabled={boardsLoading || boards.length === 0}
            className="w-full rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none disabled:opacity-60"
          >
            {boardsLoading && <option value="">Loading public boards…</option>}
            {!boardsLoading && boards.length === 0 && (
              <option value="">No public boards available</option>
            )}
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name} ({board.pinCount} {board.pinCount === 1 ? "Pin" : "Pins"})
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-text-tertiary">
            Only public boards returned by Pinterest are shown. Secret boards and secret Pins are not requested.
          </p>
          {!boardsLoading && !boardsError && boards.length > 0 && (
            <p
              className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs leading-5 text-green-800"
              role="status"
            >
              Live Pinterest API response: {boards.length} public{" "}
              {boards.length === 1 ? "board" : "boards"} loaded now. This
              response is not cached.
            </p>
          )}
          {boardsError && <p className="text-sm text-red-600">{boardsError}</p>}
          {!boardsLoading && !boardsError && boards.length === 0 && (
            <p className="rounded-md border border-surface-3 bg-surface-1 p-3 text-sm leading-6 text-text-secondary">
              No public boards were returned for this account. Create or save Pins to a
              public board in Pinterest, then refresh this page before recording the demo.
            </p>
          )}
        </div>
      )}
      <SearchForm
        presets={presets}
        onSearch={(q) => {
          void performSearch(q);
        }}
        isLoading={isLoading}
        isDisabled={!isAvailable || boardsLoading || !selectedBoardId}
        labels={{ placeholder: labels.placeholder, button: labels.button }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {pipelineMeta && (
        <div className="space-y-3" aria-live="polite">
          <p className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            Live Pinterest API response: {pipelineMeta.candidates} public Pins
            retrieved from {pipelineMeta.boardName} and ranked locally for this
            project brief. Results are not cached.
          </p>
          <details className="rounded-lg border border-surface-3 bg-surface-1 p-4 text-sm text-text-secondary">
            <summary className="cursor-pointer font-medium text-text-primary">
              Search pipeline ({pipelineMeta.candidates} candidates,{" "}
              {pipelineMeta.duplicatesRemoved} duplicates removed)
            </summary>
            <div className="mt-3 space-y-2">
              <p>
                <span className="font-medium">Source board:</span>{" "}
                {pipelineMeta.boardName}
              </p>
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
        </div>
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

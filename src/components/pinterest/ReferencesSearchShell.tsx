"use client";

import { useEffect, useState } from "react";

import type { VisualReference } from "@/lib/pinterest/types";
import type { SearchPipelineResult } from "@/lib/search/types";
import type { ResearchProject } from "@/lib/store/projects";
import SearchForm from "./SearchForm";
import ReferenceCard from "@/components/search/ReferenceCard";
import CurateButton from "./CurateButton";
import MoodboardGrid from "./MoodboardGrid";

interface ReferencesSearchShellProps {
  presets: string[];
  isAvailable: boolean;
  initialProjects: ResearchProject[];
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
  initialProjects,
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
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id ?? "");
  const [collectionName, setCollectionName] = useState(
    initialProjects[0]?.collections[0]?.name ?? "Primary references"
  );
  const [projectName, setProjectName] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const savedReferences =
    selectedProject?.collections.find((collection) => collection.name === collectionName)
      ?.references ?? [];

  const createWorkspaceProject = async () => {
    if (!projectName.trim() || projectSaving) return;
    setProjectSaving(true);
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, brief: projectBrief }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Project could not be created.");
      }
      setProjects((current) => [body.project!, ...current]);
      setSelectedProjectId(body.project.id);
      setCollectionName("Primary references");
      setProjectName("");
      setProjectBrief("");
    } catch (createError) {
      setWorkspaceError(createError instanceof Error ? createError.message : "Project could not be created.");
    } finally {
      setProjectSaving(false);
    }
  };

  const saveReference = async (reference: VisualReference): Promise<boolean> => {
    if (!selectedProjectId || !collectionName.trim()) {
      setWorkspaceError("Create or select a project and enter a collection name first.");
      return false;
    }
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collection: collectionName,
          reference,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Reference could not be saved.");
      }
      setProjects((current) =>
        current.map((project) => (project.id === body.project!.id ? body.project! : project))
      );
      return true;
    } catch (saveError) {
      setWorkspaceError(saveError instanceof Error ? saveError.message : "Reference could not be saved.");
      return false;
    }
  };

  const removeReference = async (reference: VisualReference) => {
    if (!selectedProjectId || !collectionName) return;
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/references", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collection: collectionName,
          referenceId: reference.id,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Reference could not be removed.");
      }
      setProjects((current) =>
        current.map((project) => (project.id === body.project!.id ? body.project! : project))
      );
    } catch (removeError) {
      setWorkspaceError(removeError instanceof Error ? removeError.message : "Reference could not be removed.");
    }
  };

  const deleteActiveProject = async () => {
    if (!selectedProjectId || !selectedProject) return;
    if (!window.confirm(`Delete “${selectedProject.name}” and all of its saved references?`)) return;
    setWorkspaceError(null);
    try {
      const response = await fetch(`/api/projects?id=${encodeURIComponent(selectedProjectId)}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Project could not be deleted.");
      const remaining = projects.filter((project) => project.id !== selectedProjectId);
      setProjects(remaining);
      setSelectedProjectId(remaining[0]?.id ?? "");
      setCollectionName(remaining[0]?.collections[0]?.name ?? "Primary references");
    } catch (deleteError) {
      setWorkspaceError(deleteError instanceof Error ? deleteError.message : "Project could not be deleted.");
    }
  };

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
      <section className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                Persistent workspace
              </p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">Project and collection</h3>
            </div>
            <label className="block text-sm font-medium text-text-primary" htmlFor="research-project">
              Active project
            </label>
            <select
              id="research-project"
              value={selectedProjectId}
              onChange={(event) => {
                const projectId = event.target.value;
                const project = projects.find((item) => item.id === projectId);
                setSelectedProjectId(projectId);
                setCollectionName(project?.collections[0]?.name ?? "Primary references");
              }}
              className="w-full rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {projects.length === 0 && <option value="">Create your first project</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <label className="block text-sm font-medium text-text-primary" htmlFor="reference-collection">
              Collection
            </label>
            <input
              id="reference-collection"
              value={collectionName}
              maxLength={120}
              onChange={(event) => setCollectionName(event.target.value)}
              className="w-full rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
            <p className="text-xs leading-5 text-text-tertiary">
              Saved metadata and original Pinterest links persist in Supabase. Pinterest media files are not copied.
            </p>
            {selectedProject && (
              <button
                type="button"
                onClick={() => void deleteActiveProject()}
                className="text-xs text-red-600 underline-offset-4 hover:underline"
              >
                Delete active project
              </button>
            )}
          </div>
          <div className="space-y-3 border-t border-surface-3 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="text-sm font-medium text-text-primary">New project</p>
            <input
              value={projectName}
              maxLength={120}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Project name"
              className="w-full rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
            <textarea
              value={projectBrief}
              maxLength={2000}
              onChange={(event) => setProjectBrief(event.target.value)}
              placeholder="Creative brief and visual direction"
              rows={3}
              className="w-full resize-y rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void createWorkspaceProject()}
              disabled={!projectName.trim() || projectSaving}
              className="rounded-md bg-text-primary px-4 py-2 text-sm font-medium text-surface-0 disabled:opacity-50"
            >
              {projectSaving ? "Creating…" : "Create project"}
            </button>
          </div>
        </div>
        {workspaceError && <p className="mt-4 text-sm text-red-600" role="alert">{workspaceError}</p>}
      </section>
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
                key={`${reference.id}:${selectedProjectId}:${collectionName}`}
                reference={reference}
                footer={
                  <CurateButton
                    onSave={() => saveReference(reference)}
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
            Saved collection
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            Moodboard
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            References saved to {selectedProject?.name ?? "your project"} / {collectionName || "collection"}
            remain available across sessions. Each item keeps attribution and a link to the original Pin.
          </p>
        </div>
        <MoodboardGrid
          pins={savedReferences}
          labels={moodboardLabels}
          onRemove={(reference) => void removeReference(reference)}
        />
      </section>
    </div>
  );
}

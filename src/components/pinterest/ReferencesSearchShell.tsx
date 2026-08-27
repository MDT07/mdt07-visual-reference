"use client";

import { useEffect, useState } from "react";

import CatalogAnalysisPanel from "@/components/ai/CatalogAnalysisPanel";
import type { VisualReference } from "@/lib/pinterest/types";
import type { SearchPipelineResult } from "@/lib/search/types";
import type {
  ResearchProject,
  SavedReference,
} from "@/lib/store/projects";
import SearchForm from "./SearchForm";
import ReferenceCard from "@/components/search/ReferenceCard";
import CurateButton from "./CurateButton";
import SavedReferenceCatalog, {
  type ReferenceCatalogUpdate,
} from "./SavedReferenceCatalog";

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
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    initialProjects[0]?.collections[0]?.id ?? ""
  );
  const [collectionName, setCollectionName] = useState(
    initialProjects[0]?.collections[0]?.name ?? "Primary references"
  );
  const [collectionDescription, setCollectionDescription] = useState(
    initialProjects[0]?.collections[0]?.description ?? ""
  );
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [activeProjectName, setActiveProjectName] = useState(initialProjects[0]?.name ?? "");
  const [activeProjectBrief, setActiveProjectBrief] = useState(initialProjects[0]?.brief ?? "");
  const [activeProjectStatus, setActiveProjectStatus] = useState<"active" | "archived">(
    initialProjects[0]?.status ?? "active"
  );
  const [projectUpdating, setProjectUpdating] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const selectedCollection = selectedProject?.collections.find(
    (collection) => collection.id === selectedCollectionId
  );
  const savedReferences = selectedCollection?.references ?? [];

  const replaceProject = (project: ResearchProject) => {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item))
    );
  };

  useEffect(() => {
    setActiveProjectName(selectedProject?.name ?? "");
    setActiveProjectBrief(selectedProject?.brief ?? "");
    setActiveProjectStatus(selectedProject?.status ?? "active");
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedCollection) return;
    setCollectionName(selectedCollection.name);
    setCollectionDescription(selectedCollection.description);
  }, [selectedCollection]);

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
      setSelectedCollectionId("");
      setCollectionName("Primary references");
      setCollectionDescription("");
      setProjectName("");
      setProjectBrief("");
    } catch (createError) {
      setWorkspaceError(createError instanceof Error ? createError.message : "Project could not be created.");
    } finally {
      setProjectSaving(false);
    }
  };

  const updateActiveProject = async () => {
    if (!selectedProjectId || !activeProjectName.trim() || projectUpdating) return;
    setProjectUpdating(true);
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProjectId,
          name: activeProjectName,
          brief: activeProjectBrief,
          status: activeProjectStatus,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Project could not be updated.");
      }
      replaceProject(body.project);
    } catch (updateError) {
      setWorkspaceError(updateError instanceof Error ? updateError.message : "Project could not be updated.");
    } finally {
      setProjectUpdating(false);
    }
  };

  const createWorkspaceCollection = async () => {
    if (!selectedProjectId || !collectionName.trim() || collectionSaving) return;
    setCollectionSaving(true);
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          name: collectionName,
          description: collectionDescription,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Collection could not be created.");
      }
      replaceProject(body.project);
      const created = body.project.collections.find(
        (collection) => collection.name === collectionName.trim()
      );
      setSelectedCollectionId(created?.id ?? "");
    } catch (createError) {
      setWorkspaceError(createError instanceof Error ? createError.message : "Collection could not be created.");
    } finally {
      setCollectionSaving(false);
    }
  };

  const updateActiveCollection = async () => {
    if (!selectedProjectId || !selectedCollectionId || !collectionName.trim() || collectionSaving) return;
    setCollectionSaving(true);
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collectionId: selectedCollectionId,
          name: collectionName,
          description: collectionDescription,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Collection could not be updated.");
      }
      replaceProject(body.project);
    } catch (updateError) {
      setWorkspaceError(updateError instanceof Error ? updateError.message : "Collection could not be updated.");
    } finally {
      setCollectionSaving(false);
    }
  };

  const beginNewCollection = () => {
    setSelectedCollectionId("");
    setCollectionName("");
    setCollectionDescription("");
    setWorkspaceError(null);
  };

  const deleteActiveCollection = async () => {
    if (!selectedProjectId || !selectedCollectionId || !selectedCollection) return;
    if (!window.confirm(`Delete collection “${selectedCollection.name}” and its saved references?`)) return;
    setCollectionSaving(true);
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collectionId: selectedCollectionId,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Collection could not be deleted.");
      }
      replaceProject(body.project);
      const nextCollection = body.project.collections[0];
      setSelectedCollectionId(nextCollection?.id ?? "");
      setCollectionName(nextCollection?.name ?? "Primary references");
      setCollectionDescription(nextCollection?.description ?? "");
    } catch (deleteError) {
      setWorkspaceError(deleteError instanceof Error ? deleteError.message : "Collection could not be deleted.");
    } finally {
      setCollectionSaving(false);
    }
  };

  const saveReference = async (reference: VisualReference): Promise<boolean> => {
    const targetCollection = selectedCollection?.name ?? collectionName.trim();
    if (!selectedProjectId || !targetCollection) {
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
          collection: targetCollection,
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
      replaceProject(body.project);
      const collection = body.project.collections.find((item) => item.name === targetCollection);
      if (collection) {
        setSelectedCollectionId(collection.id);
        setCollectionName(collection.name);
        setCollectionDescription(collection.description);
      }
      return true;
    } catch (saveError) {
      setWorkspaceError(saveError instanceof Error ? saveError.message : "Reference could not be saved.");
      return false;
    }
  };

  const removeReference = async (reference: VisualReference) => {
    if (!selectedProjectId || !selectedCollection) return;
    if (!window.confirm("Remove this reference from the collection?")) return;
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/references", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collection: selectedCollection.name,
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
      replaceProject(body.project);
    } catch (removeError) {
      setWorkspaceError(removeError instanceof Error ? removeError.message : "Reference could not be removed.");
    }
  };

  const updateReference = async (
    reference: SavedReference,
    update: ReferenceCatalogUpdate
  ): Promise<boolean> => {
    if (!selectedProjectId || !selectedCollectionId) return false;
    setWorkspaceError(null);
    try {
      const response = await fetch("/api/references", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          collectionId: selectedCollectionId,
          referenceRecordId: reference.catalog.recordId,
          notes: update.notes,
          tags: update.tags,
          favorite: update.favorite,
          status: update.status,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        project?: ResearchProject;
        error?: string;
      };
      if (!response.ok || !body.project) {
        throw new Error(body.error ?? "Reference details could not be updated.");
      }
      replaceProject(body.project);
      return true;
    } catch (updateError) {
      setWorkspaceError(updateError instanceof Error ? updateError.message : "Reference details could not be updated.");
      return false;
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
      setSelectedCollectionId(remaining[0]?.collections[0]?.id ?? "");
      setCollectionName(remaining[0]?.collections[0]?.name ?? "Primary references");
      setCollectionDescription(remaining[0]?.collections[0]?.description ?? "");
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
      <section className="space-y-6 rounded-xl border border-surface-3 bg-surface-1 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Persistent workspace
            </p>
            <h3 className="mt-2 text-xl font-semibold text-text-primary">
              Project and collection
            </h3>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-text-tertiary">
              Notes, tags, workflow state, and original Pinterest links persist in Supabase.
              Pinterest media files are not copied.
            </p>
          </div>
          <a
            href="/api/export"
            className="inline-flex w-fit rounded-md border border-surface-3 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent"
          >
            Export catalog JSON
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary" htmlFor="research-project">
                Active project
              </label>
              <select
                id="research-project"
                value={selectedProjectId}
                onChange={(event) => {
                  const projectId = event.target.value;
                  const project = projects.find((item) => item.id === projectId);
                  const collection = project?.collections[0];
                  setSelectedProjectId(projectId);
                  setSelectedCollectionId(collection?.id ?? "");
                  setCollectionName(collection?.name ?? "Primary references");
                  setCollectionDescription(collection?.description ?? "");
                }}
                className="w-full rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                {projects.length === 0 && <option value="">Create your first project</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}{project.status === "archived" ? " — archived" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <details className="rounded-lg border border-surface-3 bg-surface-0 p-4">
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  Edit active project
                </summary>
                <div className="mt-4 space-y-3">
                  <input
                    value={activeProjectName}
                    maxLength={120}
                    onChange={(event) => setActiveProjectName(event.target.value)}
                    aria-label="Active project name"
                    className="w-full rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                  <textarea
                    value={activeProjectBrief}
                    maxLength={2000}
                    rows={3}
                    onChange={(event) => setActiveProjectBrief(event.target.value)}
                    aria-label="Active project brief"
                    className="w-full resize-y rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                  <select
                    value={activeProjectStatus}
                    onChange={(event) => setActiveProjectStatus(event.target.value as "active" | "archived")}
                    aria-label="Active project status"
                    className="w-full rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void updateActiveProject()}
                      disabled={!activeProjectName.trim() || projectUpdating}
                      className="rounded-md bg-text-primary px-3 py-2 text-xs font-medium text-surface-0 disabled:opacity-50"
                    >
                      {projectUpdating ? "Saving…" : "Save project"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteActiveProject()}
                      className="text-xs text-red-600 underline-offset-4 hover:underline"
                    >
                      Delete project
                    </button>
                  </div>
                </div>
              </details>
            )}

            <div className="space-y-3 rounded-lg border border-surface-3 bg-surface-0 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-primary">Collection</p>
                {selectedProject && (
                  <button
                    type="button"
                    onClick={beginNewCollection}
                    className="text-xs text-accent hover:underline"
                  >
                    New collection
                  </button>
                )}
              </div>
              <select
                value={selectedCollectionId}
                disabled={!selectedProject || selectedProject.collections.length === 0}
                onChange={(event) => {
                  const collection = selectedProject?.collections.find(
                    (item) => item.id === event.target.value
                  );
                  setSelectedCollectionId(event.target.value);
                  setCollectionName(collection?.name ?? "");
                  setCollectionDescription(collection?.description ?? "");
                }}
                aria-label="Active collection"
                className="w-full rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none disabled:opacity-60"
              >
                {(!selectedProject || selectedProject.collections.length === 0) && (
                  <option value="">Create the first collection</option>
                )}
                {selectedProject?.collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>{collection.name}</option>
                ))}
              </select>
              <input
                id="reference-collection"
                value={collectionName}
                maxLength={120}
                onChange={(event) => setCollectionName(event.target.value)}
                placeholder="Collection name"
                className="w-full rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
              <textarea
                value={collectionDescription}
                maxLength={1000}
                rows={2}
                onChange={(event) => setCollectionDescription(event.target.value)}
                placeholder="Optional purpose or design direction"
                className="w-full resize-y rounded-md border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => void (selectedCollectionId ? updateActiveCollection() : createWorkspaceCollection())}
                  disabled={!selectedProjectId || !collectionName.trim() || collectionSaving}
                  className="rounded-md bg-text-primary px-3 py-2 text-xs font-medium text-surface-0 disabled:opacity-50"
                >
                  {collectionSaving ? "Saving…" : selectedCollectionId ? "Save collection" : "Create collection"}
                </button>
                {selectedCollection && (
                  <button
                    type="button"
                    onClick={() => void deleteActiveCollection()}
                    className="text-xs text-red-600 underline-offset-4 hover:underline"
                  >
                    Delete collection
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-surface-3 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
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
              rows={4}
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
        {workspaceError && <p className="text-sm text-red-600" role="alert">{workspaceError}</p>}
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
            References saved to {selectedProject?.name ?? "your project"} / {(selectedCollection?.name ?? collectionName) || "collection"}{" "}
            remain available across sessions. Catalog notes and tags are private app data;
            each item keeps Pinterest attribution and a link to the original Pin.
          </p>
        </div>
        <SavedReferenceCatalog
          pins={savedReferences}
          labels={moodboardLabels}
          onUpdate={updateReference}
          onRemove={(reference) => void removeReference(reference)}
        />
      </section>
      <CatalogAnalysisPanel project={selectedProject} />
    </div>
  );
}

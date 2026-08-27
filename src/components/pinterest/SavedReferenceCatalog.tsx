"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type {
  ReferenceWorkflowStatus,
  SavedReference,
} from "@/lib/store/projects";

export interface ReferenceCatalogUpdate {
  notes: string;
  tags: string[];
  favorite: boolean;
  status: ReferenceWorkflowStatus;
}

interface SavedReferenceCatalogProps {
  pins: SavedReference[];
  onUpdate: (
    pin: SavedReference,
    update: ReferenceCatalogUpdate
  ) => Promise<boolean>;
  onRemove: (pin: SavedReference) => void;
  labels: {
    attribution: string;
    originalPin: string;
    empty: string;
  };
}

function ReferenceCatalogCard({
  pin,
  onUpdate,
  onRemove,
  labels,
}: Omit<SavedReferenceCatalogProps, "pins"> & { pin: SavedReference }) {
  const [notes, setNotes] = useState(pin.catalog.notes);
  const [tags, setTags] = useState(pin.catalog.tags.join(", "));
  const [favorite, setFavorite] = useState(pin.catalog.favorite);
  const [status, setStatus] = useState<ReferenceWorkflowStatus>(pin.catalog.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotes(pin.catalog.notes);
    setTags(pin.catalog.tags.join(", "));
    setFavorite(pin.catalog.favorite);
    setStatus(pin.catalog.status);
  }, [pin.catalog]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const normalizedTags = [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))];
    const saved = await onUpdate(pin, { notes, tags: normalizedTags, favorite, status });
    setMessage(saved ? "Catalog details saved." : "Could not save catalog details.");
    setSaving(false);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-surface-3 bg-surface-1">
      <a href={pin.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="flex min-h-48 items-center justify-center bg-surface-2">
          {pin.imageUrl || pin.thumbnailUrl ? (
            <Image
              src={pin.imageUrl ?? pin.thumbnailUrl ?? ""}
              alt={pin.altText || pin.title || "Pinterest reference"}
              width={pin.imageWidth ?? 600}
              height={pin.imageHeight ?? 750}
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="max-h-[34rem] h-auto w-full object-contain"
            />
          ) : (
            <span className="p-8 text-sm text-text-tertiary">Preview unavailable</span>
          )}
        </div>
      </a>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {pin.title || "Untitled reference"}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">{labels.attribution}</p>
          </div>
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => setFavorite((current) => !current)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              favorite
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-surface-3 text-text-secondary"
            }`}
          >
            {favorite ? "★ Favorite" : "☆ Favorite"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <label className="space-y-1 text-xs font-medium text-text-secondary">
            Workflow status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ReferenceWorkflowStatus)}
              className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="saved">Saved</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-text-secondary">
            Tags
            <input
              value={tags}
              maxLength={679}
              onChange={(event) => setTags(event.target.value)}
              placeholder="editorial, typography, motion"
              className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        <label className="block space-y-1 text-xs font-medium text-text-secondary">
          Research notes
          <textarea
            value={notes}
            maxLength={4000}
            rows={3}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What makes this reference useful for the project?"
            className="w-full resize-y rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm leading-6 text-text-primary focus:border-accent focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-3 pt-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-md bg-text-primary px-3 py-2 text-xs font-medium text-surface-0 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save details"}
            </button>
            <a
              href={pin.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 py-2 text-xs text-accent hover:underline"
            >
              {labels.originalPin}
            </a>
          </div>
          <button
            type="button"
            onClick={() => onRemove(pin)}
            className="text-xs text-red-600 underline-offset-4 hover:underline"
          >
            Remove
          </button>
        </div>
        {message && (
          <p className="text-xs text-text-tertiary" role="status">
            {message}
          </p>
        )}
      </div>
    </article>
  );
}

export default function SavedReferenceCatalog({
  pins,
  onUpdate,
  onRemove,
  labels,
}: SavedReferenceCatalogProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReferenceWorkflowStatus>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredPins = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return pins.filter((pin) => {
      if (status !== "all" && pin.catalog.status !== status) return false;
      if (favoritesOnly && !pin.catalog.favorite) return false;
      if (!needle) return true;
      const searchable = [
        pin.title,
        pin.description,
        pin.catalog.notes,
        ...pin.catalog.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(needle);
    });
  }, [favoritesOnly, pins, query, status]);

  if (pins.length === 0) {
    return <p className="text-sm text-text-tertiary">{labels.empty}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-surface-3 bg-surface-1 p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
        <label className="space-y-1 text-xs font-medium text-text-secondary">
          Search saved references
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, note, or tag"
            className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-secondary">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | ReferenceWorkflowStatus)}
            className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="saved">Saved</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Favorites only
        </label>
      </div>

      <p className="text-xs text-text-tertiary" aria-live="polite">
        Showing {filteredPins.length} of {pins.length} saved references.
      </p>

      {filteredPins.length === 0 ? (
        <p className="rounded-xl border border-surface-3 bg-surface-1 p-5 text-sm text-text-tertiary">
          No saved references match these filters.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredPins.map((pin) => (
            <ReferenceCatalogCard
              key={pin.catalog.recordId}
              pin={pin}
              onUpdate={onUpdate}
              onRemove={onRemove}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  );
}

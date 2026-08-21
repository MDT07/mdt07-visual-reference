"use client";

import { useState } from "react";
import type {
  CuratedPin,
  PinterestPin,
  PinterestSearchResponse,
} from "@/lib/pinterest/types";
import SearchForm from "./SearchForm";
import PinCard from "./PinCard";
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

function toSessionReference(pin: PinterestPin, query: string): CuratedPin | null {
  const image =
    pin.media.images?.["1200x"] ??
    pin.media.images?.["600x"] ??
    pin.media.images?.["400x300"] ??
    pin.media.images?.["150x150"];

  if (!image) return null;

  return {
    id: `session-${pin.id}`,
    pinterestId: pin.id,
    title: pin.title,
    description: pin.description,
    altText: pin.alt_text,
    link: pin.link,
    sourceUrl: `https://www.pinterest.com/pin/${pin.id}/`,
    imageUrl: image.url,
    imageWidth: image.width,
    imageHeight: image.height,
    dominantColor: pin.dominant_color,
    authorUsername: pin.board_owner?.username,
    mediaType: pin.media.media_type,
    usage: "reference",
    query,
    savedAt: new Date().toISOString(),
  };
}

export default function ReferencesSearchShell({
  presets,
  isAvailable,
  labels,
  moodboardLabels,
}: ReferencesSearchShellProps) {
  const [query, setQuery] = useState(presets[0] ?? "");
  const [items, setItems] = useState<PinterestPin[]>([]);
  const [bookmark, setBookmark] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sessionReferences, setSessionReferences] = useState<CuratedPin[]>([]);

  const performSearch = async (q: string, nextBookmark?: string) => {
    if (!isAvailable) return;
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ q });
    if (nextBookmark) params.set("bookmark", nextBookmark);
    try {
      const res = await fetch(`/api/pinterest/search?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Search failed: ${res.status}`);
      }
      const data: PinterestSearchResponse = await res.json();
      setItems((prev) => (nextBookmark ? [...prev, ...data.items] : data.items));
      setBookmark(data.bookmark);
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
          setQuery(q);
          void performSearch(q);
        }}
        isLoading={isLoading}
        isDisabled={!isAvailable}
        labels={{ placeholder: labels.placeholder, button: labels.button }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          {hasSearched ? labels.noResults : labels.initial}
        </p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                footer={
                  <CurateButton
                    onSave={() => {
                      const reference = toSessionReference(pin, query);
                      if (!reference) return false;
                      setSessionReferences((current) =>
                        current.some((item) => item.pinterestId === pin.id)
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
          {bookmark && (
            <button
              type="button"
              onClick={() => performSearch(query, bookmark)}
              disabled={isLoading}
              className="w-full rounded-md border border-surface-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
            >
              {labels.loadMore}
            </button>
          )}
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
            Selected references remain only in this open page and are not saved to the
            server or browser storage. Refreshing the page clears this moodboard.
          </p>
        </div>
        <MoodboardGrid pins={sessionReferences} labels={moodboardLabels} />
      </section>
    </div>
  );
}

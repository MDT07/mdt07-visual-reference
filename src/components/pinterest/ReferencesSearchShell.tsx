"use client";

import { useState } from "react";
import type { PinterestPin, PinterestSearchResponse } from "@/lib/pinterest/types";
import SearchForm from "./SearchForm";
import PinCard from "./PinCard";
import CurateButton from "./CurateButton";

interface ReferencesSearchShellProps {
  presets: string[];
  labels: {
    placeholder: string;
    button: string;
    save: string;
    saved: string;
    loadMore: string;
    noResults: string;
  };
}

export default function ReferencesSearchShell({
  presets,
  labels,
}: ReferencesSearchShellProps) {
  const [query, setQuery] = useState(presets[0] ?? "");
  const [items, setItems] = useState<PinterestPin[]>([]);
  const [bookmark, setBookmark] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (q: string, nextBookmark?: string) => {
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
        labels={{ placeholder: labels.placeholder, button: labels.button }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary">{labels.noResults}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                footer={
                  <CurateButton
                    pin={pin}
                    query={query}
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
    </div>
  );
}

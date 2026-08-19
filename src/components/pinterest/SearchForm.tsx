"use client";

import { useState } from "react";

interface SearchFormProps {
  presets: string[];
  onSearch: (query: string) => void;
  isLoading?: boolean;
  labels: {
    placeholder: string;
    button: string;
  };
}

export default function SearchForm({
  presets,
  onSearch,
  isLoading,
  labels,
}: SearchFormProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {labels.button}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setQuery(preset);
              onSearch(preset);
            }}
            className="rounded-full border border-surface-3 px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

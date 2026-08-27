"use client";

import { useMemo, useState } from "react";

import BoardCard from "@/components/boards/BoardCard";
import type { PublicBoard } from "@/lib/store/public-catalog";

export default function BoardsExplorer({ boards }: { boards: PublicBoard[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredBoards = useMemo(
    () =>
      normalizedQuery
        ? boards.filter((board) =>
            [board.name, board.description, board.projectName, board.projectBrief]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          )
        : boards,
    [boards, normalizedQuery]
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-y border-surface-2 py-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">Filter collections</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search collections or projects"
            className="w-full rounded-full border border-surface-3 bg-surface-0 px-5 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none"
          />
        </label>
        <p className="text-sm text-text-tertiary" aria-live="polite">
          {filteredBoards.length} of {boards.length} collections
        </p>
      </div>

      {filteredBoards.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-surface-3 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-text-primary">No matching collections</h2>
          <p className="mt-2 text-sm text-text-secondary">Try a shorter or broader search.</p>
        </div>
      )}
    </div>
  );
}

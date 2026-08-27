import type { Metadata } from "next";

import BoardsExplorer from "@/components/boards/BoardsExplorer";
import { getPublicUrl } from "@/lib/config";
import { listPublicBoards } from "@/lib/store/public-catalog";

const description =
  "Browse public Pinterest Boards and explore their Pins as visual references for web design, development, and art direction.";

export const metadata: Metadata = {
  title: "Boards",
  description,
  alternates: { canonical: getPublicUrl("/boards") },
  openGraph: {
    title: "Reference Boards | MDT07 Visual Reference",
    description,
    url: getPublicUrl("/boards"),
  },
};

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const boards = await listPublicBoards();
  const pinCount = boards.reduce((total, board) => total + board.pinCount, 0);

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Public reference library
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-text-primary sm:text-6xl">
              Your Pinterest Boards, clearly organized.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-text-secondary">
                Open any public Board to explore all of its available Pins and follow
                every reference back to its original source on Pinterest.
              </p>
            </div>
            <dl className="flex gap-8 text-sm">
              <div>
                <dt className="text-text-tertiary">Boards</dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary">{boards.length}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">References</dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary">{pinCount}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-6">
        {boards.length ? (
          <BoardsExplorer boards={boards} />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-surface-3 bg-surface-0 px-6 py-20 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Catalog in progress
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              Public Boards are temporarily unavailable
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-text-secondary">
              The connected Pinterest account currently has no available public Boards,
              or its owner connection needs to be renewed in the private admin area.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

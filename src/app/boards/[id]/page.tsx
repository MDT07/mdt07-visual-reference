import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PublicPinCard from "@/components/boards/PublicPinCard";
import { getPublicUrl } from "@/lib/config";
import { getPublicBoard } from "@/lib/store/public-catalog";

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const revalidate = 300;

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!uuidPattern.test(id)) return {};
  const board = await getPublicBoard(id);
  if (!board) return {};
  const description =
    board.description || board.projectBrief || `Explore ${board.pinCount} curated visual references.`;

  return {
    title: board.name,
    description,
    alternates: { canonical: getPublicUrl(`/boards/${board.id}`) },
    openGraph: {
      title: `${board.name} | MDT07 Visual Reference`,
      description,
      url: getPublicUrl(`/boards/${board.id}`),
      images: board.pins[0]?.imageUrl ? [{ url: board.pins[0].imageUrl }] : undefined,
    },
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();
  const board = await getPublicBoard(id);
  if (!board) notFound();

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-6">
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-brand"
          >
            <span aria-hidden="true">←</span> All boards
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {board.projectName}
          </p>
          <h1 className="mt-3 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-text-primary sm:text-6xl">
            {board.name}
          </h1>
          <div className="mt-6 grid gap-6 border-t border-surface-2 pt-6 md:grid-cols-[1fr_auto] md:items-start">
            <p className="max-w-3xl text-lg leading-8 text-text-secondary">
              {board.description || board.projectBrief || "A curated visual reference collection."}
            </p>
            <p className="text-sm text-text-tertiary">
              {board.pinCount} {board.pinCount === 1 ? "reference" : "references"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-6">
        {board.pins.length ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
            {board.pins.map((pin) => (
              <PublicPinCard key={`${pin.id}-${pin.sourceId}`} pin={pin} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-surface-3 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-text-primary">No published Pins yet</h2>
            <p className="mt-2 text-sm text-text-secondary">
              This collection is visible, but its first reference has not been added.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-surface-2 bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm leading-6 text-text-secondary lg:px-6">
          References are shown for visual research and remain linked to their original
          Pinterest sources. MDT07 Visual Reference does not claim ownership of third-party content.
        </div>
      </section>
    </main>
  );
}

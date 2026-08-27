import Image from "next/image";
import Link from "next/link";

import type { PublicBoard } from "@/lib/store/public-catalog";

function BoardCover({ board }: { board: PublicBoard }) {
  const images = [board.coverImageUrl, ...board.thumbnailUrls]
    .filter((src): src is string => Boolean(src))
    .filter((src, index, all) => all.indexOf(src) === index)
    .slice(0, 4)
    .map((src) => ({ src, alt: `${board.name} Pinterest Board preview` }));

  if (images.length === 0) {
    return (
      <div className="grid h-full place-items-center bg-surface-1 px-8 text-center text-sm text-text-tertiary">
            This Pinterest Board has no available cover preview.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-1 bg-surface-2">
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={images.length === 1 ? "relative col-span-2 row-span-2 overflow-hidden" : "relative overflow-hidden"}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        </div>
      ))}
      {images.length === 2 && <div className="row-start-2 col-span-2 bg-surface-1" />}
      {images.length === 3 && <div className="bg-surface-1" />}
    </div>
  );
}

export default function BoardCard({ board }: { board: PublicBoard }) {
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-surface-2 bg-surface-0 transition duration-300 hover:-translate-y-1 hover:border-surface-3 hover:shadow-[0_22px_55px_rgba(30,27,21,0.09)]">
      <Link href={`/boards/${board.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden">
          <BoardCover board={board} />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand">
              {board.ownerUsername ? `@${board.ownerUsername}` : "Pinterest Board"}
            </p>
            <span className="shrink-0 text-xs text-text-tertiary">
              {board.pinCount} {board.pinCount === 1 ? "Pin" : "Pins"}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-text-primary">
            {board.name}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-text-secondary">
            {board.description || "Open this Board to explore all available Pins."}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition group-hover:text-brand">
            Open collection <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

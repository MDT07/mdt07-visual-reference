import Image from "next/image";

import type { PublicPin } from "@/lib/store/public-catalog";

export default function PublicPinCard({ pin }: { pin: PublicPin }) {
  const image = pin.imageUrl ?? pin.thumbnailUrl;
  const width = pin.imageWidth && pin.imageWidth > 0 ? pin.imageWidth : 600;
  const height = pin.imageHeight && pin.imageHeight > 0 ? pin.imageHeight : 800;

  return (
    <article className="mb-5 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-surface-2 bg-surface-0 transition duration-300 hover:border-surface-3 hover:shadow-[0_18px_45px_rgba(30,27,21,0.08)]">
      <a href={pin.sourceUrl} target="_blank" rel="noopener noreferrer" className="group block">
        {image ? (
          <div className="overflow-hidden bg-surface-1">
            <Image
              src={image}
              alt={pin.altText ?? pin.title ?? "Pinterest visual reference"}
              width={width}
              height={height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.015]"
            />
          </div>
        ) : (
          <div className="grid aspect-[4/5] place-items-center bg-surface-1 text-xs text-text-tertiary">
            Preview unavailable
          </div>
        )}

        <div className="p-4">
          {pin.title && (
            <h2 className="line-clamp-2 font-semibold leading-5 text-text-primary">{pin.title}</h2>
          )}
          {pin.description && (
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-text-secondary">
              {pin.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-text-tertiary">
              {pin.authorUsername ? `@${pin.authorUsername}` : "Pinterest"}
            </span>
            <span className="shrink-0 font-semibold text-brand">Original Pin ↗</span>
          </div>
        </div>
      </a>
    </article>
  );
}

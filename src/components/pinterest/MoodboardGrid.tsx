import Image from "next/image";
import type { CuratedPin } from "@/lib/pinterest/types";

interface MoodboardGridProps {
  pins: CuratedPin[];
  labels: {
    attribution: string;
    originalPin: string;
    empty: string;
  };
}

export default function MoodboardGrid({ pins, labels }: MoodboardGridProps) {
  if (pins.length === 0) {
    return <p className="text-sm text-text-tertiary">{labels.empty}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {pins.map((pin) => (
        <article
          key={pin.id}
          className="group overflow-hidden rounded-lg border border-surface-3 bg-surface-1"
        >
          <a
            href={pin.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex min-h-40 items-center justify-center bg-surface-2">
              <Image
                src={pin.imageUrl}
                alt={pin.altText || pin.title || "Reference"}
                width={pin.imageWidth ?? 600}
                height={pin.imageHeight ?? 750}
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
                className="h-auto w-full object-contain"
              />
            </div>
          </a>
          <div className="p-3">
            {pin.title && (
              <h3 className="line-clamp-1 text-sm font-medium text-text-primary">
                {pin.title}
              </h3>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-text-tertiary">
                {labels.attribution}
              </span>
              <a
                href={pin.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs text-accent hover:underline"
              >
                {labels.originalPin}
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

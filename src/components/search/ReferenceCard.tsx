import Image from "next/image";

import type { VisualReference } from "@/lib/pinterest/types";

interface ReferenceCardProps {
  reference: VisualReference;
  footer?: React.ReactNode;
}

export default function ReferenceCard({ reference, footer }: ReferenceCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-surface-3 bg-surface-1">
      <a
        href={reference.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {reference.imageUrl ? (
          <div className="flex min-h-40 items-center justify-center bg-surface-2">
            <Image
              src={reference.imageUrl}
              alt={reference.altText || reference.title || "Visual reference"}
              width={reference.imageWidth ?? 600}
              height={reference.imageHeight ?? 750}
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
              className="h-auto w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-surface-2 text-xs text-text-tertiary">
            No image
          </div>
        )}
      </a>
      <div className="p-3">
        {reference.title && (
          <h3 className="line-clamp-1 text-sm font-medium text-text-primary">
            {reference.title}
          </h3>
        )}
        {reference.authorUsername && (
          <p className="mt-1 text-xs text-text-tertiary">
            @{reference.authorUsername}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <a
            href={reference.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            Open on Pinterest
          </a>
          {typeof reference.finalScore === "number" && (
            <span className="text-xs text-text-tertiary">
              {reference.finalScore.toFixed(2)}
            </span>
          )}
        </div>
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </article>
  );
}

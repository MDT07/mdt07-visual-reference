import Image from "next/image";
import type { PinterestPin } from "@/lib/pinterest/types";
import {
  getBestImage,
  getAuthorUsername,
  getPinUrl,
} from "@/lib/pinterest/presentation";

interface PinCardProps {
  pin: PinterestPin;
  footer?: React.ReactNode;
}

export default function PinCard({ pin, footer }: PinCardProps) {
  const image = getBestImage(pin);
  const author = getAuthorUsername(pin);
  const pinUrl = getPinUrl(pin.id);

  return (
    <article className="group overflow-hidden rounded-lg border border-surface-3 bg-surface-1">
      <a
        href={pinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {image ? (
          <div className="flex min-h-40 items-center justify-center bg-surface-2">
            <Image
              src={image.url}
              alt={pin.alt_text || pin.title || "Pinterest reference"}
              width={image.width}
              height={image.height}
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
        {pin.title && (
          <h3 className="line-clamp-1 text-sm font-medium text-text-primary">
            {pin.title}
          </h3>
        )}
        {author && (
          <p className="mt-1 text-xs text-text-tertiary">@{author}</p>
        )}
        <a
          href={pinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-xs text-accent hover:underline"
        >
          Open original on Pinterest
        </a>
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </article>
  );
}

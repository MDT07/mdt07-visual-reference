import Image from "next/image";
import type { PinterestPin } from "@/lib/pinterest/types";
import { getBestImageUrl, getAuthorUsername, getPinUrl } from "@/lib/pinterest/client";

interface PinCardProps {
  pin: PinterestPin;
  footer?: React.ReactNode;
}

export default function PinCard({ pin, footer }: PinCardProps) {
  const imageUrl = getBestImageUrl(pin);
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
        {imageUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
            <Image
              src={imageUrl}
              alt={pin.alt_text || pin.title || "Pinterest reference"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </article>
  );
}

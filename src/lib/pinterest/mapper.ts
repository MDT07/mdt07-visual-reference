import "server-only";

import type { PinterestPin, VisualReference } from "./types";
import { getBestImage, getPinUrl } from "./presentation";

export function toVisualReference(
  pin: PinterestPin,
  query?: string
): VisualReference | null {
  const image = getBestImage(pin);
  if (!image) return null;

  const thumbnail =
    pin.media.images?.["400x300"] ?? pin.media.images?.["150x150"];

  return {
    id: `pinterest:${pin.id}`,
    source: "pinterest",
    sourceId: pin.id,
    sourceUrl: getPinUrl(pin.id),
    title: pin.title,
    description: pin.description,
    altText: pin.alt_text,
    imageUrl: image.url,
    thumbnailUrl: thumbnail?.url,
    imageWidth: image.width,
    imageHeight: image.height,
    aspectRatio: image.height ? image.width / image.height : undefined,
    dominantColor: pin.dominant_color,
    link: pin.link,
    authorUsername: pin.board_owner?.username,
    designAttributes: {},
    rawQuery: query,
    fetchedAt: new Date().toISOString(),
  };
}

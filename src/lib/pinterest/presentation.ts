import type {
  PinterestImage,
  PinterestPin,
} from "./types";

export function getPinUrl(pinId: string): string {
  return `https://www.pinterest.com/pin/${pinId}/`;
}

export function getBestImage(pin: PinterestPin): PinterestImage | undefined {
  const images = pin.media?.images;
  if (!images) return undefined;
  return (
    images["1200x"] ??
    images["600x"] ??
    images["400x300"] ??
    images["150x150"]
  );
}

export function getAuthorUsername(pin: PinterestPin): string | undefined {
  return pin.board_owner?.username;
}

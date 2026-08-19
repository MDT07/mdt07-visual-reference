import type { PinterestPin, PinterestUsage } from "./types";

/**
 * Определяет, можно ли использовать медиа пина напрямую на сайте.
 * В Pinterest API нет прямого флага лицензии, поэтому по умолчанию
 * весь контент Pinterest используется только как reference.
 */
export function determineUsage(pin: PinterestPin): PinterestUsage {
  // Прямое использование возможно только если пин создан владельцем
  // аккаунта и не является чужим репином.
  if (pin.is_owner && !pin.parent_pin_id) {
    return "direct";
  }
  return "reference";
}

export function isDirectUsable(usage: PinterestUsage): boolean {
  return usage === "direct";
}

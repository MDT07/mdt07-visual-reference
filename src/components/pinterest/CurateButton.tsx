"use client";

import { useState } from "react";
import type { PinterestPin, PinterestUsage } from "@/lib/pinterest/types";

interface CurateButtonProps {
  pin: PinterestPin;
  query: string;
  usage?: PinterestUsage;
  labels: {
    save: string;
    saved: string;
  };
}

export default function CurateButton({
  pin,
  query,
  usage = "reference",
  labels,
}: CurateButtonProps) {
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (saved || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, query, usage }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saved || isLoading}
      className={`w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        saved
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
          : "bg-surface-2 text-text-secondary hover:bg-surface-3"
      }`}
    >
      {saved ? labels.saved : labels.save}
    </button>
  );
}

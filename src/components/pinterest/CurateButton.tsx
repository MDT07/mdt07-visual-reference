"use client";

import { useState } from "react";

interface CurateButtonProps {
  onSave: () => boolean;
  labels: {
    save: string;
    saved: string;
  };
}

export default function CurateButton({
  onSave,
  labels,
}: CurateButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    if (saved) return;
    if (onSave()) setSaved(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saved}
      className={`w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        saved
          ? "bg-green-100 text-green-700"
          : "bg-surface-2 text-text-secondary hover:bg-surface-3"
      }`}
    >
      {saved ? labels.saved : labels.save}
    </button>
  );
}

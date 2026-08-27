"use client";

import { useState } from "react";

interface CurateButtonProps {
  onSave: () => boolean | Promise<boolean>;
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
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      if (await onSave()) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={saved || saving}
      className={`w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        saved
          ? "bg-green-100 text-green-700"
          : "bg-surface-2 text-text-secondary hover:bg-surface-3"
      }`}
    >
      {saved ? labels.saved : saving ? "Saving…" : labels.save}
    </button>
  );
}

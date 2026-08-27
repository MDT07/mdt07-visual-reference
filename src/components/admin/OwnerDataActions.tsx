"use client";

import { useState } from "react";

export default function OwnerDataActions() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runCleanup = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/maintenance", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as {
        expiredConnections?: number;
        expiredRateLimits?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Maintenance could not be completed.");
      setMessage(
        `Cleanup complete: ${body.expiredConnections ?? 0} expired OAuth connections and ${body.expiredRateLimits ?? 0} expired rate-limit records removed.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Maintenance could not be completed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        href="/api/export"
        className="inline-flex w-fit rounded-md bg-text-primary px-4 py-2 text-sm font-medium text-surface-0"
      >
        Export catalog JSON
      </a>
      <button
        type="button"
        onClick={() => void runCleanup()}
        disabled={running}
        className="inline-flex w-fit rounded-md border border-surface-3 px-4 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
      >
        {running ? "Cleaning…" : "Clean expired security state"}
      </button>
      {message && <p className="text-xs leading-5 text-text-secondary" role="status">{message}</p>}
    </div>
  );
}

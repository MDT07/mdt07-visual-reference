import type { Metadata } from "next";
import { redirect } from "next/navigation";

import OwnerSignOut from "@/components/auth/OwnerSignOut";
import { getOwnerSession } from "@/lib/auth/authorization";
import { isPinterestConfigured } from "@/lib/config";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Control",
  description: "Private owner control surface for MDT07 Visual Reference.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const owner = await getOwnerSession();
  if (!owner) redirect("/login");

  const pinterestConfigured = isPinterestConfigured();
  const pinterestConnected =
    pinterestConfigured && Boolean(await getPinterestSessionFromCookies());

  const checks = [
    ["Deployment mode", deploymentConfig.appMode],
    ["Owner authentication", isOwnerAuthConfigured() ? "configured" : "missing"],
    ["Owner GitHub ID", owner.user.githubId],
    [
      "Pinterest server configuration",
      pinterestConfigured ? "configured" : "missing or invalid",
    ],
    ["Pinterest browser connection", pinterestConnected ? "connected" : "disconnected"],
    ["Pinterest access", "boards:read, pins:read"],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <div className="flex flex-col gap-5 border-b border-surface-2 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Owner-only control surface
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
            Access and connection status
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
            This page intentionally exposes configuration state only. Secret values,
            OAuth tokens, and encryption material are never rendered.
          </p>
        </div>
        <OwnerSignOut />
      </div>

      <dl className="grid gap-px overflow-hidden rounded-2xl border border-surface-2 bg-surface-2 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map(([label, value]) => (
          <div key={label} className="bg-surface-0 p-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              {label}
            </dt>
            <dd className="mt-3 break-words text-sm font-medium text-text-primary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}

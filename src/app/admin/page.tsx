import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import OwnerDataActions from "@/components/admin/OwnerDataActions";
import OwnerSignOut from "@/components/auth/OwnerSignOut";
import { getOwnerSession } from "@/lib/auth/authorization";
import { aiCatalogConfig, isAiCatalogConfigured, isPinterestConfigured } from "@/lib/config";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";
import { listAuditEvents } from "@/lib/store/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Control",
  description: "Private owner control surface for MDT07 Visual Reference.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!deploymentConfig.isStudio) notFound();

  const owner = await getOwnerSession();
  if (!owner) redirect("/login");

  const pinterestConfigured = isPinterestConfigured();
  const pinterestConnected =
    pinterestConfigured && Boolean(await getPinterestSessionFromCookies());
  const auditEvents = await listAuditEvents(20);

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
    ["AI provider", `${aiCatalogConfig.provider} · ${aiCatalogConfig.model}`],
    ["AI catalog analysis", isAiCatalogConfigured() ? "configured" : "disabled or missing key"],
    ["AI external actions", "none — no tools or write access"],
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

      <section className="mt-12 space-y-5 border-t border-surface-2 pt-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Owner data controls
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Export app-owned catalog data or remove only expired OAuth and rate-limit records.
            Project and reference data is never removed by maintenance.
          </p>
        </div>
        <OwnerDataActions />
      </section>

      <section className="mt-12 space-y-5 border-t border-surface-2 pt-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Recent owner activity
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            The latest security and catalog events. Secret values and Pinterest tokens are never logged here.
          </p>
        </div>
        {auditEvents.length === 0 ? (
          <p className="text-sm text-text-tertiary">No audit events recorded yet.</p>
        ) : (
          <ol className="divide-y divide-surface-3 overflow-hidden rounded-xl border border-surface-3 bg-surface-1">
            {auditEvents.map((event) => (
              <li key={event.id} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-text-primary">{event.action}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {event.targetType ?? "system"}{event.targetId ? ` · ${event.targetId}` : ""}
                  </p>
                </div>
                <time className="text-xs text-text-tertiary" dateTime={event.createdAt}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  }).format(new Date(event.createdAt))} UTC
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

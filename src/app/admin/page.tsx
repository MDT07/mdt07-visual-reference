import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import OwnerDataActions from "@/components/admin/OwnerDataActions";
import OwnerSignOut from "@/components/auth/OwnerSignOut";
import ReferencesSearchShell from "@/components/pinterest/ReferencesSearchShell";
import { getOwnerSession } from "@/lib/auth/authorization";
import { isPinterestConfigured } from "@/lib/config";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";
import { REFERENCE_PRESETS } from "@/lib/reference-presets";
import { listAuditEvents, listProjects } from "@/lib/store/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Admin",
  description: "Private catalog and Pinterest connection controls for MDT07.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!deploymentConfig.isAdmin) notFound();

  const owner = await getOwnerSession();
  if (!owner) redirect("/login");

  const pinterestConfigured = isPinterestConfigured();
  const pinterestConnected =
    pinterestConfigured && Boolean(await getPinterestSessionFromCookies());
  const [projects, auditEvents] = await Promise.all([
    pinterestConfigured ? listProjects() : Promise.resolve([]),
    listAuditEvents(12),
  ]);

  const checks = [
    ["Deployment mode", deploymentConfig.appMode],
    ["Owner authentication", isOwnerAuthConfigured() ? "configured" : "missing"],
    ["Owner GitHub ID", owner.user.githubId],
    [
      "Pinterest server configuration",
      pinterestConfigured ? "configured" : "missing or invalid",
    ],
    ["Pinterest connection", pinterestConnected ? "connected" : "disconnected"],
    ["Pinterest access", "boards:read, pins:read"],
  ];

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Owner-only administration
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-text-primary sm:text-5xl">
              Catalog control room
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              Manage the private Pinterest connection, research projects, collections,
              and the references published in the public catalog. Signed in as{" "}
              {owner.user.name ?? owner.user.email ?? "MDT07"}.
            </p>
          </div>
          <OwnerSignOut />
        </div>
      </section>

      <section className="border-b border-surface-2 bg-surface-1/60">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Pinterest connection</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Read-only access is available only inside this owner-authenticated deployment.
              </p>
            </div>
            {pinterestConnected ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-medium text-green-800">
                  Connected · boards:read, pins:read
                </span>
                <form action="/api/pinterest/auth/disconnect" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-surface-3 px-4 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                  >
                    Disconnect
                  </button>
                </form>
              </div>
            ) : pinterestConfigured ? (
              <a
                href="/api/pinterest/auth"
                className="inline-flex w-fit rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Give Pinterest access
              </a>
            ) : (
              <span className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                Pinterest server configuration is incomplete
              </span>
            )}
          </div>
        </div>
      </section>

      <section id="catalog" className="bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Private workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text-primary">
              Find and organize references
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-text-secondary">
              Search Pins from an available public Pinterest board, then save selected
              references into project collections. Active project collections appear in
              the public Boards catalog.
            </p>
          </div>

          <ReferencesSearchShell
            presets={[...REFERENCE_PRESETS]}
            isAvailable={pinterestConnected}
            initialProjects={projects}
            labels={{
              placeholder: "Describe the visual direction...",
              button: "Search",
              save: "Save to collection",
              saved: "Saved",
              loadMore: "Load more",
              noResults: "No results found",
              initial: pinterestConnected
                ? "Choose a public Pinterest board, then describe the direction you want to explore."
                : "Search becomes available after the private Pinterest connection is active.",
            }}
            moodboardLabels={{
              attribution: "Pinterest",
              originalPin: "Open original Pin",
              empty: "No references selected in this session yet.",
            }}
          />
        </div>
      </section>

      <section className="border-t border-surface-2 bg-surface-1">
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 lg:px-6">
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                System status
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Access and data controls
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                Configuration state is shown without rendering credentials, tokens, or
                encryption material.
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-surface-2 bg-surface-2 sm:grid-cols-2 lg:grid-cols-3">
              {checks.map(([label, value]) => (
                <div key={label} className="bg-surface-0 p-5">
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                    {label}
                  </dt>
                  <dd className="mt-2 break-words text-sm font-medium text-text-primary">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h3 className="text-xl font-semibold text-text-primary">Owner data controls</h3>
              <p className="mt-2 mb-5 text-sm leading-6 text-text-secondary">
                Export app-owned catalog data or remove expired OAuth and rate-limit
                records. Maintenance does not delete projects or references.
              </p>
              <OwnerDataActions />
            </section>

            <section>
              <h3 className="text-xl font-semibold text-text-primary">Recent activity</h3>
              <p className="mt-2 mb-5 text-sm leading-6 text-text-secondary">
                Security and catalog events never contain Pinterest tokens or secrets.
              </p>
              {auditEvents.length === 0 ? (
                <p className="text-sm text-text-tertiary">No audit events recorded yet.</p>
              ) : (
                <ol className="divide-y divide-surface-3 overflow-hidden rounded-xl border border-surface-3 bg-surface-0">
                  {auditEvents.map((event) => (
                    <li key={event.id} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{event.action}</p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {event.targetType ?? "system"}
                          {event.targetId ? ` · ${event.targetId}` : ""}
                        </p>
                      </div>
                      <time className="text-xs text-text-tertiary" dateTime={event.createdAt}>
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "UTC",
                        }).format(new Date(event.createdAt))}{" "}
                        UTC
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

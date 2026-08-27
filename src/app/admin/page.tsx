import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import OwnerSecurityActions from "@/components/admin/OwnerSecurityActions";
import OwnerSignOut from "@/components/auth/OwnerSignOut";
import { getOwnerSession } from "@/lib/auth/authorization";
import { isPinterestConfigured } from "@/lib/config";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";
import { listAuditEvents } from "@/lib/store/security-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Admin",
  description: "Private Pinterest connection and security controls for MDT07.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!deploymentConfig.isAdmin) notFound();

  const owner = await getOwnerSession();
  if (!owner) redirect("/login");

  const pinterestConfigured = isPinterestConfigured();
  const pinterestConnected =
    pinterestConfigured && Boolean(await getPinterestSessionFromCookies());
  const auditEvents = await listAuditEvents(12);

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
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Owner-only administration
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-text-primary sm:text-5xl">
              Pinterest connection
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              This private host controls OAuth access for the public Board catalog.
              Visitors never receive the Pinterest token or access to these controls.
              Signed in as {owner.user.name ?? owner.user.email ?? "MDT07"}.
            </p>
          </div>
          <OwnerSignOut />
        </div>
      </section>

      <section className="border-b border-surface-2 bg-surface-1">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              {pinterestConnected ? "Public Boards are connected" : "Connect the owner account"}
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-text-secondary">
              The public site reads real public Pinterest Boards and their Pins through a
              sanitized server endpoint. Only the read-only `boards:read` and `pins:read`
              permissions are used.
            </p>
          </div>

          {pinterestConnected ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${deploymentConfig.publicUrl}/boards`}
                className="inline-flex rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
              >
                View public Boards
              </Link>
              <form action="/api/pinterest/auth/disconnect" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-surface-3 px-5 py-2.5 text-sm font-semibold text-text-secondary transition hover:border-brand hover:text-brand"
                >
                  Disconnect
                </button>
              </form>
            </div>
          ) : pinterestConfigured ? (
            <a
              href="/api/pinterest/auth"
              className="inline-flex w-fit rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Give Pinterest access
            </a>
          ) : (
            <span className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900">
              Pinterest server configuration is incomplete
            </span>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-4 py-14 lg:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            System status
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Access and security controls
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Configuration state is shown without rendering credentials, tokens, or
            encryption material.
          </p>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-surface-2 bg-surface-2 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="grid gap-10 border-t border-surface-2 pt-10 lg:grid-cols-2">
          <section>
            <h3 className="text-xl font-semibold text-text-primary">Security maintenance</h3>
            <p className="mt-2 mb-5 text-sm leading-6 text-text-secondary">
              Remove expired OAuth connections and rate-limit records without exposing or
              changing active credentials.
            </p>
            <OwnerSecurityActions />
          </section>

          <section>
            <h3 className="text-xl font-semibold text-text-primary">Recent activity</h3>
            <p className="mt-2 mb-5 text-sm leading-6 text-text-secondary">
              Security events never contain Pinterest tokens or application secrets.
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
      </section>
    </main>
  );
}

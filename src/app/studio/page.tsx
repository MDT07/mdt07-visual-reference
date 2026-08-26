import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import OwnerSignOut from "@/components/auth/OwnerSignOut";
import ReferencesSearchShell from "@/components/pinterest/ReferencesSearchShell";
import { getOwnerSession } from "@/lib/auth/authorization";
import { isPinterestConfigured } from "@/lib/config";
import { deploymentConfig } from "@/lib/deployment";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";
import { REFERENCE_PRESETS } from "@/lib/reference-presets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Studio",
  description: "Private visual research workspace for the MDT07 owner.",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  if (!deploymentConfig.isStudio) notFound();

  const owner = await getOwnerSession();
  if (!owner) redirect("/login");

  const configured = isPinterestConfigured();
  const connected = configured && Boolean(await getPinterestSessionFromCookies());

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Owner-only workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
              Visual Research Studio
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
              Signed in as {owner.user.name ?? owner.user.email ?? "MDT07"}. This
              deployment isolates Pinterest access from the public website.
            </p>
          </div>
          <OwnerSignOut />
        </div>
      </section>

      <section id="workspace" className="bg-surface-0">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Reference workspace
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
                Search your Pinterest references
              </h2>
            </div>
            {connected ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex w-fit rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs text-green-800">
                  Connected via Pinterest OAuth — read-only access
                </span>
                <form action="/api/pinterest/auth/disconnect" method="post">
                  <button
                    type="submit"
                    className="text-xs text-text-secondary underline-offset-4 hover:underline"
                  >
                    Disconnect
                  </button>
                </form>
              </div>
            ) : configured ? (
              <a
                href="/api/pinterest/auth"
                className="inline-flex w-fit rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Connect with Pinterest OAuth
              </a>
            ) : (
              <span className="inline-flex w-fit rounded-full border border-surface-3 px-4 py-2 text-xs text-text-tertiary">
                Pinterest API access is pending private-host configuration
              </span>
            )}
          </div>

          <ReferencesSearchShell
            presets={[...REFERENCE_PRESETS]}
            isAvailable={connected}
            labels={{
              placeholder: "Describe the visual direction...",
              button: "Search",
              save: "Save to moodboard",
              saved: "Saved",
              loadMore: "Load more",
              noResults: "No results found",
              initial: connected
                ? "Choose a public board, then describe the direction you want to explore."
                : "Search becomes available after Pinterest access is connected.",
            }}
            moodboardLabels={{
              attribution: "Pinterest",
              originalPin: "Open original",
              empty: "No references selected in this session yet.",
            }}
          />
        </div>
      </section>
    </main>
  );
}

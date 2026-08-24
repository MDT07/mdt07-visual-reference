import { getPublicUrl, isPinterestConfigured } from "@/lib/config";
import { getPinterestSessionFromCookies } from "@/lib/pinterest/session";
import ReferencesSearchShell from "@/components/pinterest/ReferencesSearchShell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description:
    "Turn a web-project brief into a focused, temporary visual reference workspace with source-linked Pinterest results.",
  alternates: { canonical: getPublicUrl() },
  openGraph: {
    title: "MDT07 Visual Reference",
    description:
      "Project-scoped visual research for web design and development, with transient Pinterest references and original-source links.",
    url: getPublicUrl(),
  },
};

const PRESETS = [
  "fashion editorial",
  "architecture",
  "luxury interior",
  "minimalist design",
  "creative studio",
  "automotive",
  "product photography",
  "art direction",
  "brutalist web design",
  "luxury brand",
];

export default async function HomePage() {
  const configured = isPinterestConfigured();
  const connected = configured && Boolean(await getPinterestSessionFromCookies());

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.25fr_0.75fr] md:items-end md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Visual research for the web
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-text-primary sm:text-5xl md:text-6xl">
              MDT07 Visual Reference
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-text-secondary md:text-xl">
              A project-scoped workspace for discovering and comparing visual
              references from public boards connected to your Pinterest account while
              planning an original website or interface.
            </p>
          </div>
          <div className="rounded-2xl border border-surface-2 bg-surface-1 p-6">
            <p className="text-sm leading-6 text-text-secondary">
              Built for web designers, developers, and creative teams who want to
              turn a specific project brief into a focused research session.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">01</p>
            <h2 className="text-xl font-semibold text-text-primary">Find a direction</h2>
            <p className="leading-7 text-text-secondary">
              Define the visual style, layout language, art direction, or product
              presentation needed for one specific web project.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">02</p>
            <h2 className="text-xl font-semibold text-text-primary">Explore sources</h2>
            <p className="leading-7 text-text-secondary">
              Choose one of the public boards available to your connected Pinterest
              account, then rank its Pins against a project brief. Every reference links
              back to its original source on Pinterest.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">03</p>
            <h2 className="text-xl font-semibold text-text-primary">Curate references</h2>
            <p className="leading-7 text-text-secondary">
              Compare selected references in a temporary session workspace, then use
              the research to make original design decisions.
            </p>
          </div>
        </div>
        <p className="mt-10 max-w-4xl border-l-2 border-brand pl-5 text-sm leading-6 text-text-tertiary">
          The application helps organize visual research. It does not automatically
          copy Pinterest content or transfer ownership of it. Pinterest remains the
          source for the referenced Pins.
        </p>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-text-tertiary">
          This is not a replacement client for Pinterest. The added workflow is scoped
          to a web-project brief, keeps selections only for the open session, and helps
          designers compare references before creating their own work.
        </p>
      </section>

      <section id="workspace" className="border-y border-surface-2 bg-surface-0">
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
                  Pinterest access is connected for this session
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
                Connect Pinterest
              </a>
            ) : (
              <span className="inline-flex w-fit rounded-full border border-surface-3 px-4 py-2 text-xs text-text-tertiary">
                Pinterest API access is pending configuration
              </span>
            )}
          </div>
          <ReferencesSearchShell
            presets={PRESETS}
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

      <section className="border-t border-surface-2 bg-surface-1">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="max-w-4xl text-sm leading-6 text-text-secondary">
            MDT07 Visual Reference is an independent application. It is not
            endorsed by, affiliated with, or an official product of Pinterest.
          </p>
        </div>
      </section>
    </main>
  );
}

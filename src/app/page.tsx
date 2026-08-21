import { getPublicUrl, isPinterestConfigured } from "@/lib/config";
import { getTokens } from "@/lib/pinterest/token-store";
import ReferencesSearchShell from "@/components/pinterest/ReferencesSearchShell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description:
    "Discover and explore Pinterest visual references for web design and development projects, then curate useful ideas into a working moodboard.",
  alternates: { canonical: getPublicUrl() },
  openGraph: {
    title: "MDT07 Pinterest Reference",
    description:
      "Discover and explore Pinterest visual references for web design and development projects.",
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

export default function HomePage() {
  const configured = isPinterestConfigured();
  const connected = Boolean(getTokens());

  return (
    <main>
      <section className="border-b border-surface-2 bg-surface-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.25fr_0.75fr] md:items-end md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Visual research for the web
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-text-primary sm:text-5xl md:text-6xl">
              MDT07 Pinterest Reference
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-text-secondary md:text-xl">
              A web tool for discovering and exploring Pinterest visual references
              for web design and development projects.
            </p>
          </div>
          <div className="rounded-2xl border border-surface-2 bg-surface-1 p-6">
            <p className="text-sm leading-6 text-text-secondary">
              Built for web designers, developers, and creative teams who need a
              focused way to research visual direction before they build.
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
              Search for a visual style, layout language, art direction, or product
              presentation relevant to a web project.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">02</p>
            <h2 className="text-xl font-semibold text-text-primary">Explore sources</h2>
            <p className="leading-7 text-text-secondary">
              Review relevant Pins through Pinterest data, with links back to the
              original Pinterest source for deeper exploration.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">03</p>
            <h2 className="text-xl font-semibold text-text-primary">Curate references</h2>
            <p className="leading-7 text-text-secondary">
              Save useful discoveries to a moodboard and use them as inspiration for
              an original website or interface.
            </p>
          </div>
        </div>
        <p className="mt-10 max-w-4xl border-l-2 border-brand pl-5 text-sm leading-6 text-text-tertiary">
          The application helps organize visual research. It does not automatically
          copy Pinterest content or transfer ownership of it. Pinterest remains the
          source for the referenced Pins.
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
                Search Pinterest references
              </h2>
            </div>
            {connected ? (
              <span className="inline-flex w-fit rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs text-green-800">
                Pinterest access is connected
              </span>
            ) : configured ? (
              <a
                href="/api/pinterest/auth"
                className="inline-flex w-fit rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Connect Pinterest
              </a>
            ) : (
              <span className="inline-flex w-fit rounded-full border border-surface-3 px-4 py-2 text-xs text-text-tertiary">
                Pinterest connection is being configured
              </span>
            )}
          </div>
          <ReferencesSearchShell
            presets={PRESETS}
            isAvailable={connected}
            labels={{
              placeholder: "Enter a query...",
              button: "Search",
              save: "Save to moodboard",
              saved: "Saved",
              loadMore: "Load more",
              noResults: "No results found",
              initial: connected
                ? "Search results will appear here."
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
            MDT07 Pinterest Reference is an independent application. It is not
            endorsed by, affiliated with, or an official product of Pinterest.
          </p>
        </div>
      </section>
    </main>
  );
}

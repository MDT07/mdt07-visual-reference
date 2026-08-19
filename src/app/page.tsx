import { getReferences } from "@/lib/references";
import { isPinterestConfigured, siteConfig } from "@/lib/config";
import ReferencesSearchShell from "@/components/pinterest/ReferencesSearchShell";
import MoodboardGrid from "@/components/pinterest/MoodboardGrid";

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
  const pins = await getReferences();

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pinterest Integration
          </h1>
          <p className="text-[var(--text-secondary)]">
            Search visual references via official Pinterest API v5 and curate your moodboard.
          </p>
          {!configured && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              Pinterest is not configured. Create an app at{" "}
              <a
                href="https://developers.pinterest.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                developers.pinterest.com
              </a>
              , fill <code>.env.local</code>, then{" "}
              <a
                href={`${siteConfig.url}/api/pinterest/auth`}
                className="underline"
              >
                connect Pinterest
              </a>
              .
            </div>
          )}
        </header>

        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold">Search References</h2>
          <ReferencesSearchShell
            presets={PRESETS}
            labels={{
              placeholder: "Enter a query...",
              button: "Search",
              save: "Save to moodboard",
              saved: "Saved",
              loadMore: "Load more",
              noResults: "No results found",
            }}
          />
        </section>

        <section>
          <h2 className="mb-6 text-xl font-semibold">Moodboard</h2>
          <MoodboardGrid
            pins={pins}
            labels={{
              attribution: "Pinterest",
              originalPin: "Open original",
              empty: "No saved references yet.",
            }}
          />
        </section>
      </div>
    </main>
  );
}

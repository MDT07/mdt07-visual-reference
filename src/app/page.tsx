import type { Metadata } from "next";
import Link from "next/link";

import BoardCard from "@/components/boards/BoardCard";
import { getPublicUrl, siteConfig } from "@/lib/config";
import { deploymentConfig } from "@/lib/deployment";
import { listPublicBoards } from "@/lib/store/public-catalog";

const description =
  "A curated visual reference library for discovering stronger directions for web design and development projects.";

export const metadata: Metadata = {
  description,
  alternates: { canonical: getPublicUrl() },
  openGraph: {
    title: "MDT07 Visual Reference",
    description,
    url: getPublicUrl(),
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const boards = await listPublicBoards();
  const featuredBoards = boards.slice(0, 3);
  const pinCount = boards.reduce((total, board) => total + board.pinCount, 0);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-surface-2 bg-surface-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_75%_10%,rgba(163,43,43,0.11),transparent_48%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:px-6 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Curated visual research for the web
              </p>
              <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-text-primary sm:text-7xl lg:text-[5.8rem]">
                Better references.<br />Stronger web ideas.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-text-secondary sm:text-xl">
                MDT07 Visual Reference presents the connected account&apos;s public Pinterest
                Boards as a clear visual library for web design, development, and art direction.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/boards"
                  className="inline-flex rounded-full bg-text-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand"
                >
                  Browse boards
                </Link>
                <Link
                  href="/about"
                  className="inline-flex rounded-full border border-surface-3 bg-surface-0 px-6 py-3.5 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-surface-2 bg-surface-2">
              <div className="bg-surface-1 p-6">
                <p className="text-4xl font-semibold tracking-[-0.05em] text-text-primary">{boards.length}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-text-tertiary">Public boards</p>
              </div>
              <div className="bg-surface-1 p-6">
                <p className="text-4xl font-semibold tracking-[-0.05em] text-text-primary">{pinCount}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-text-tertiary">Curated Pins</p>
              </div>
              <div className="col-span-2 bg-surface-1 p-6">
                <p className="text-sm leading-6 text-text-secondary">
                  Every reference stays linked to its original Pinterest source. The
                  public library requires no account or Pinterest authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Public Pinterest Boards
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-text-primary sm:text-5xl">
              Explore the catalog
            </h2>
          </div>
          <Link href="/boards" className="text-sm font-semibold text-text-primary hover:text-brand">
            View all boards <span aria-hidden="true">→</span>
          </Link>
        </div>

        {featuredBoards.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-surface-3 bg-surface-0 px-6 py-16 text-center">
            <h3 className="text-xl font-semibold text-text-primary">The first collection is being curated</h3>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-text-secondary">
              The catalog structure is live. Public Pinterest Boards will appear here
              while the private owner connection is active.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-surface-2 bg-text-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/10 lg:grid-cols-3">
          {[
            ["01", "Start with intent", "Define the visual problem: a hero, editorial layout, interface system, motion language, or complete project direction."],
            ["02", "Study curated references", "Open a focused Board and compare all its Pins without losing the project context or original source."],
            ["03", "Create original work", "Translate patterns, principles, and atmosphere into an original website rather than copying a finished design."],
          ].map(([number, title, text]) => (
            <article key={number} className="bg-text-primary px-6 py-12 sm:px-10">
              <p className="text-xs font-semibold tracking-[0.18em] text-red-300">{number}</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-4 leading-7 text-white/65">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface-1">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:items-center lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Access model</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
              Open catalog. Private management.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              Anyone can browse public Boards and Pins. Pinterest OAuth, tokens, and
              connection controls remain isolated behind owner-only GitHub authentication.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {deploymentConfig.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Open admin
              </Link>
            )}
            <a
              href={`${siteConfig.githubUrl}/mdt07-visual-reference`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-surface-3 px-5 py-3 text-sm font-semibold text-text-primary hover:border-brand hover:text-brand"
            >
              View source on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-2 bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm leading-6 text-text-tertiary lg:px-6">
          MDT07 Visual Reference is an independent application. It is not endorsed by,
          affiliated with, or an official product of Pinterest.
        </div>
      </section>
    </main>
  );
}

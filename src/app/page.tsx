import Link from "next/link";
import type { Metadata } from "next";
import { getPublicUrl, siteConfig } from "@/lib/config";
import { deploymentConfig } from "@/lib/deployment";

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

export default function HomePage() {
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

      <section className="border-y border-surface-2 bg-surface-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Access model
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
              Public information, private connected workspace
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              The public website explains the project and keeps its legal pages openly
              available. Pinterest OAuth, tokens, and connected research tools are
              isolated to an owner-authorized studio deployment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {deploymentConfig.isStudio && (
              <Link
                href="/studio"
                className="inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Open owner studio
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

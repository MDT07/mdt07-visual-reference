import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl } from "@/lib/config";

const description =
  "Learn how MDT07 Visual Reference turns a web-project brief into a focused, source-linked visual research session.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: getPublicUrl("/about") },
  openGraph: {
    title: "About MDT07 Visual Reference",
    description,
    url: getPublicUrl("/about"),
  },
};

const workflow = [
  {
    number: "01",
    title: "Search for a visual style",
    text: "Start with the look, layout language, art direction, subject, or interaction mood needed for a web project.",
  },
  {
    number: "02",
    title: "Find relevant references",
    text: "The application lists public boards available to your connected Pinterest account, retrieves Pins from the board you select, and ranks them against the project brief.",
  },
  {
    number: "03",
    title: "Explore the source",
    text: "Study imagery, composition, typography, color, and presentation, then follow attribution links to explore the original Pin and its Pinterest context.",
  },
  {
    number: "04",
    title: "Build something original",
    text: "Use the collected ideas as references while designing and developing your own website or interface.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="About the project"
        title="A clearer path from research to web design"
        description="MDT07 Visual Reference is designed for finding and studying source-linked visual references that can inform an original website or interface."
      />

      <section className="grid gap-8 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Why it exists
          </h2>
          <p className="leading-7 text-text-secondary">
            Visual research often gets scattered across tabs, links, and disconnected
            screenshots. This tool starts with one web-project brief and creates a
            focused, temporary workspace for comparing useful directions.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Who it is for
          </h2>
          <p className="leading-7 text-text-secondary">
            The application is intended for web designers, developers, art directors,
            and creative teams who use visual references to explore a project before
            creating original design work.
          </p>
        </div>
      </section>

      <section className="border-t border-surface-2 py-12">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-text-primary">
          The workflow
        </h2>
        <ol className="grid gap-5 sm:grid-cols-2">
          {workflow.map((step) => (
            <li key={step.number} className="rounded-2xl border border-surface-2 bg-surface-0 p-6">
              <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-brand">
                {step.number}
              </p>
              <h3 className="mb-2 font-semibold text-text-primary">{step.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-surface-2 bg-surface-1 p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-text-primary">
          References are inspiration, not ownership
        </h2>
        <p className="leading-7 text-text-secondary">
          MDT07 Visual Reference does not claim ownership of third-party content,
          automatically copy complete designs, or grant rights to reuse content. Pins
          remain linked to Pinterest as their source, and users are responsible for
          respecting the rights attached to any material they study.
        </p>
      </section>
    </main>
  );
}

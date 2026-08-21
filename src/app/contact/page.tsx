import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Contact MDT07 Visual Reference for support, privacy questions, and Pinterest connection requests.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: getPublicUrl("/contact") },
  openGraph: {
    title: "Contact",
    description,
    url: getPublicUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="Contact"
        title="Questions about the project?"
        description="Contact the project by email or visit the MDT07 GitHub profile for the public source repository."
      />

      <section className="py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-surface-2 bg-surface-0 p-7 sm:p-9">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Email
            </p>
            <a
              className="break-all text-xl font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:text-brand-hover"
              href={`mailto:${siteConfig.contactEmail}`}
            >
              {siteConfig.contactEmail}
            </a>
            <p className="mt-6 text-sm leading-6 text-text-secondary">
              Use email for support, privacy questions, Pinterest connection issues,
              and data deletion requests.
            </p>
          </article>

          <article className="rounded-2xl border border-surface-2 bg-surface-0 p-7 sm:p-9">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              GitHub
            </p>
            <a
              className="text-xl font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:text-brand-hover"
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{siteConfig.githubUsername}
            </a>
            <p className="mt-6 text-sm leading-6 text-text-secondary">
              View the public profile and the source repository for this project on
              GitHub.
            </p>
          </article>
        </div>

        <p className="mt-6 max-w-3xl text-sm leading-6 text-text-secondary">
          For a privacy or data deletion request, include “Privacy” or “Data deletion”
          in the email subject. Do not send an App Secret, access token, refresh token,
          or password by email or through a public GitHub issue.
        </p>
      </section>
    </main>
  );
}

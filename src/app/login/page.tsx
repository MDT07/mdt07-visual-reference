import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { signIn } from "@/auth";
import { getOwnerSession } from "@/lib/auth/authorization";
import {
  deploymentConfig,
  isOwnerAuthConfigured,
} from "@/lib/deployment";

export const metadata: Metadata = {
  title: "Owner sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (!deploymentConfig.isAdmin) notFound();

  const ownerSession = await getOwnerSession();
  if (ownerSession) redirect("/admin");

  const configured = isOwnerAuthConfigured();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16">
      <section className="w-full rounded-3xl border border-surface-2 bg-surface-0 p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Private owner access
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          MDT07 Admin
        </h1>
        <p className="mt-4 leading-7 text-text-secondary">
          This administration area is restricted to the configured MDT07 GitHub owner.
          Pinterest OAuth and connected API routes are unavailable without this
          application session.
        </p>

        {configured ? (
          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin" });
            }}
          >
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-text-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
            >
              Continue with GitHub
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Owner authentication is not configured for this deployment. Add the
            private Auth.js and GitHub OAuth environment variables before enabling
            admin access.
          </div>
        )}
      </section>
    </main>
  );
}

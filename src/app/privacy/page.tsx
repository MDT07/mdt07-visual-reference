import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pinterest Integration",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)]]">Last updated: August 19, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            This Pinterest Integration application is a personal developer tool used
            to search and curate visual references via the official Pinterest API.
            It is operated by Emir Semenov.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Data We Collect</h2>
          <p>
            We do not collect personal data from end users. The application stores
            only:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pinterest OAuth tokens on the server side.</li>
            <li>Curated pin references chosen by the application owner.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. How We Use Data</h2>
          <p>
            Pinterest access tokens are used solely to authenticate API requests to
            Pinterest on behalf of the application owner. We do not share tokens or
            user data with third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Cookies</h2>
          <p>
            We use a short-lived cookie to protect the OAuth state parameter during
            the Pinterest authorization flow.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Contact</h2>
          <p>
            For questions about this privacy policy, contact{" "}
            <a href="mailto:emirsemenov086@gmail.com" className="text-[var(--accent)] underline">
              emirsemenov086@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

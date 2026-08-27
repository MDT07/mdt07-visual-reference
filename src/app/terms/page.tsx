import type { Metadata } from "next";

import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Terms of Service for the MDT07 Visual Reference public catalog and owner-only Pinterest-connected administration features.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: getPublicUrl("/terms") },
  openGraph: { title: "Terms of Service", description, url: getPublicUrl("/terms") },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="Legal"
        title="Terms of Service"
        description="The permitted use of MDT07 Visual Reference, its public catalog, and its Pinterest-connected owner features."
      />

      <div className="legal-content py-12">
        <p><strong>Last updated:</strong> August 28, 2026</p>

        <section>
          <h2>1. Purpose</h2>
          <p>
            MDT07 Visual Reference (the “Application”) is an independent visual research
            catalog for web design and development. It organizes owner-selected,
            source-linked Pinterest references into project Boards to support study and
            original work. It is not an official Pinterest product, a replacement
            Pinterest client, or endorsed by or affiliated with Pinterest.
          </p>
        </section>

        <section>
          <h2>2. Acceptance and permitted use</h2>
          <p>
            By using the Application, you agree to these Terms. You may browse its public
            catalog and use it for lawful visual research, reference organization, and
            related design or development work. You must comply with applicable law,
            Pinterest&apos;s terms and policies, and the rights attached to content you view.
          </p>
          <p>The Application is not intended for children under 13.</p>
        </section>

        <section>
          <h2>3. Prohibited use</h2>
          <p>You must not:</p>
          <ul>
            <li>Infringe copyright, trademark, privacy, or other rights.</li>
            <li>Misrepresent third-party content as your own or remove source attribution.</li>
            <li>Bypass authentication, Pinterest permissions, rate limits, or access controls.</li>
            <li>Probe, disrupt, overload, scrape, or gain unauthorized access to the Application.</li>
            <li>Extract or use Pinterest data contrary to Pinterest&apos;s developer rules.</li>
            <li>Use the Application for unlawful, deceptive, or harmful activity.</li>
          </ul>
        </section>

        <section>
          <h2>4. Access controls</h2>
          <p>
            Public Boards and Pins are read-only and require no registration. Pinterest
            OAuth, synchronization, project changes, and catalog management are restricted
            to a private administration area and its configured owner. Public source code
            does not grant access to the hosted administration area, its Pinterest account,
            sessions, credentials, or data-management endpoints.
          </p>
        </section>

        <section>
          <h2>5. User responsibility and third-party content</h2>
          <p>
            You are responsible for how you use ideas found through the catalog and for
            work you create from your research. Visibility of a Pin does not grant a
            license to copy, publish, sell, or reuse it. You must obtain any permission
            required for your intended use and independently verify that your work does not infringe rights.
          </p>
        </section>

        <section>
          <h2>6. Pinterest and other services</h2>
          <p>
            Owner features depend on Pinterest OAuth and the Pinterest API. Pinterest may
            change permissions, endpoints, limits, content, or availability, which may
            cause features or references to change or stop working. Pinterest use remains
            subject to Pinterest&apos;s own terms, privacy policy, and developer requirements.
          </p>
          <p>
            The Application also relies on GitHub, Supabase, Vercel, and links to external
            sites. Those services are controlled by their respective providers.
          </p>
        </section>

        <section>
          <h2>7. Intellectual property</h2>
          <p>
            The Application&apos;s original code, interface, and branding remain the property
            of their respective owner, subject to any repository license. Pinterest, its
            marks, API, and Pinterest content belong to Pinterest or the relevant rights
            holders. These Terms transfer no ownership of third-party content.
          </p>
        </section>

        <section>
          <h2>8. Availability and changes</h2>
          <p>
            The Application is provided on an “as available” basis. Features may be
            corrected, limited, suspended, or changed for security, maintenance,
            compliance, or API changes. No promise is made that every Board, Pin, remote
            image, source link, or saved reference will remain available.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers and limitation of liability</h2>
          <p>
            To the extent permitted by law, the Application is provided without warranties
            of uninterrupted operation, accuracy, fitness for a particular purpose, or
            non-infringement. References and third-party content must be independently evaluated.
          </p>
          <p>
            To the extent permitted by law, the maintainer is not liable for indirect,
            incidental, special, consequential, or punitive losses, or losses caused by
            third-party content, API availability, unauthorized use, missing references,
            or decisions based on the catalog. Nothing excludes liability that cannot legally be excluded.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            You may stop using the Application at any time. Access may be limited or
            terminated to address abuse, security risks, legal duties, Pinterest policy
            requirements, or material violations of these Terms. The owner may revoke Pinterest access at any time.
          </p>
        </section>

        <section>
          <h2>11. Changes to these Terms</h2>
          <p>
            Updated Terms will be published at this URL with a revised “Last updated”
            date. Continued use after an update means you accept the revised Terms.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions may be sent to
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

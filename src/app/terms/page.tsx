import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Terms of Service for using MDT07 Visual Reference and its Pinterest-connected visual research features.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: getPublicUrl("/terms") },
  openGraph: {
    title: "Terms of Service",
    description,
    url: getPublicUrl("/terms"),
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="Legal"
        title="Terms of Service"
        description="These terms describe the permitted use of MDT07 Visual Reference and its Pinterest-connected features."
      />

      <div className="legal-content py-12">
        <p><strong>Last updated:</strong> August 27, 2026</p>

        <section>
          <h2>1. Purpose of the Application</h2>
          <p>
            MDT07 Visual Reference (the “Application”) is an independent,
            project-scoped visual research workspace for web design and development.
            It may use owner-selected, source-linked Pinterest references to support research
            and the creation of original work. It is not a replacement Pinterest client,
            an official Pinterest product, or endorsed by or affiliated with Pinterest.
          </p>
        </section>

        <section>
          <h2>2. Acceptance and permitted use</h2>
          <p>
            By using the Application, you agree to these Terms. You may use it for
            lawful visual research, reference organization, and related design or
            development work. You must comply with applicable laws, Pinterest’s terms
            and policies, and the rights attached to any content you view.
          </p>
          <p>The Application is not intended for children under 13.</p>
        </section>

        <section>
          <h2>3. Prohibited use</h2>
          <p>You must not:</p>
          <ul>
            <li>Use the Application to infringe copyright, trademark, privacy, or other rights.</li>
            <li>Misrepresent third-party content as your own or remove source attribution.</li>
            <li>Attempt to bypass Pinterest permissions, rate limits, or access controls.</li>
            <li>Probe, disrupt, overload, or gain unauthorized access to the Application or its connected services.</li>
            <li>Extract or use Pinterest data in a way prohibited by Pinterest’s developer terms or policies.</li>
            <li>Use the Application for unlawful, deceptive, or harmful activity.</li>
          </ul>
        </section>

        <section>
          <h2>4. Access controls</h2>
          <p>
            The public website provides project and legal information. Connected
            Pinterest features are restricted to a private studio and its configured
            owner account. You must not bypass authentication, use another person&apos;s
            session, reuse private credentials, or attempt to promote your own access.
            Public availability of the source repository does not grant access to the
            maintainer&apos;s hosted private studio or Pinterest credentials.
          </p>
        </section>

        <section>
          <h2>5. Your responsibilities</h2>
          <p>
            You are responsible for the search terms you submit, references you select,
            and any work you create from your research. A Pin being visible through the
            Application does not grant permission to copy, publish, sell, or otherwise
            reuse it. You must obtain any rights or licenses required for your intended
            use and verify that your final work does not infringe another party’s rights.
          </p>
        </section>

        <section>
          <h2>6. Pinterest and other third-party services</h2>
          <p>
            Connected features depend on Pinterest OAuth and the Pinterest API. Your
            use of Pinterest remains subject to Pinterest’s own terms, privacy policy,
            developer rules, and availability. Pinterest may change permissions,
            endpoints, limits, or access at any time, which may cause Application
            features to change or stop working.
          </p>
          <p>
            The Application may also depend on a hosting provider and may link to
            external websites. Those services are controlled by their respective
            providers, not by this Application.
          </p>
        </section>

        <section>
          <h2>7. Intellectual property</h2>
          <p>
            The Application’s original code, interface, and branding remain the
            property of their respective owner, subject to any license included with
            the source code. Pinterest, its name, marks, API, and Pinterest content
            belong to Pinterest or the relevant rights holders. These Terms do not
            transfer ownership of Pinterest content or other third-party material to
            you or to the Application.
          </p>
        </section>

        <section>
          <h2>8. Availability and changes</h2>
          <p>
            The Application is provided on an “as available” basis. Features may be
            corrected, limited, suspended, or changed, including to comply with
            Pinterest requirements, protect security, or account for API changes. There
            is no promise that every Pin, board, search result, or saved reference will
            remain available.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers and limitation of liability</h2>
          <p>
            To the extent permitted by applicable law, the Application is provided
            without warranties of uninterrupted operation, accuracy, fitness for a
            particular purpose, or non-infringement. Search results and third-party
            content are supplied for reference and should be independently evaluated.
          </p>
          <p>
            To the extent permitted by law, the Application’s maintainer will not be
            liable for indirect, incidental, special, consequential, or punitive losses,
            or for losses caused by third-party content, Pinterest API availability,
            unauthorized use, lost references, or decisions based on search results.
            Nothing in these Terms excludes liability that cannot legally be excluded.
          </p>
        </section>

        <section>
          <h2>10. Suspension or termination</h2>
          <p>
            You may stop using the Application at any time and may revoke Pinterest
            access through Pinterest. Access may be limited or terminated when necessary
            to address abuse, security risks, legal obligations, Pinterest policy
            requirements, or material violations of these Terms.
          </p>
        </section>

        <section>
          <h2>11. Changes to these Terms</h2>
          <p>
            These Terms may be updated as the Application or its connected services
            evolve. Updates will be published at this URL with a revised “Last updated”
            date. Continued use after an update means you accept the revised Terms.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions about these Terms may be sent to
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

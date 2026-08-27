import type { Metadata } from "next";

import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Privacy Policy for MDT07 Visual Reference, including its public catalog, owner-only Pinterest OAuth, storage, security, and deletion choices.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: getPublicUrl("/privacy") },
  openGraph: { title: "Privacy Policy", description, url: getPublicUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description="How MDT07 Visual Reference handles information in its public catalog and private Pinterest-connected administration area."
      />

      <div className="legal-content py-12">
        <p><strong>Last updated:</strong> August 28, 2026</p>

        <section>
          <h2>1. Scope</h2>
          <p>
            This policy applies to MDT07 Visual Reference (the “Application”), an
            independent web tool for organizing and studying source-linked Pinterest
            references for web design and development. The Application is not an official
            Pinterest product and is not endorsed by or affiliated with Pinterest.
          </p>
          <p>
            Visitors can browse the public catalog without an account. The Application
            does not offer public registration. Pinterest connection and catalog changes
            are restricted to a private administration area available only to its configured owner.
          </p>
        </section>

        <section>
          <h2>2. Information the Application processes</h2>
          <h3>Public catalog requests</h3>
          <p>
            You do not need to submit personal information to browse public Boards and
            Pins. The hosting provider may process routine request data such as IP address,
            browser type, requested URL, time, and security or error logs to deliver and protect the site.
          </p>
          <h3>Owner authentication</h3>
          <p>
            The private administration area may receive the owner&apos;s GitHub numeric
            identifier, display name, email when GitHub makes it available, and profile
            image. Access is permitted only when the GitHub identifier matches the
            server-side owner allowlist. The Application never receives the GitHub password.
          </p>
          <h3>Pinterest OAuth and account data</h3>
          <p>
            Pinterest handles its authorization screen. After approval, the Application
            receives a short-lived authorization code and exchanges it server-side for an
            access token and, when supplied, a refresh token. With the read-only
            <code>boards:read</code> and <code>pins:read</code> scopes, it may list public
            boards available to the connected owner account and retrieve public Pins from
            a selected board. It does not request write, profile, or secret-content scopes.
          </p>
          <p>
            Board data may include an identifier, name, description, Pin count, privacy
            classification, and owner username. Pin data may include identifiers, titles,
            descriptions, alt text, remote images, media details, links, timestamps, and
            an attribution username included by Pinterest.
          </p>
          <h3>Public Board catalog</h3>
          <p>
            The public catalog requests the connected account&apos;s public Boards and the
            Pins of a Board that a visitor opens. It exposes only sanitized Pinterest
            metadata and original-source links. The Application does not store private
            curation notes, favorites, or copied Pinterest image and video files.
          </p>
        </section>

        <section>
          <h2>3. How Pinterest OAuth works</h2>
          <p>
            Connection is optional and owner-only. The Application redirects the owner
            to Pinterest, where the requested permissions are displayed. Pinterest then
            returns to the exact configured callback URL. A random, short-lived state
            value in an HTTP-only cookie is checked to protect the exchange against request forgery.
          </p>
          <p>
            The owner can disconnect inside the Application or revoke access in Pinterest
            account settings. Revocation prevents further connected API retrieval.
          </p>
        </section>

        <section>
          <h2>4. Purposes</h2>
          <ul>
            <li>Deliver and secure the public website and reference catalog.</li>
            <li>Authenticate the configured owner and authorized Pinterest API requests.</li>
            <li>Retrieve the connected owner account&apos;s public Boards and their Pins.</li>
            <li>Present a read-only visual catalog with links to original Pinterest sources.</li>
            <li>Enforce request limits, audit security-relevant actions, and diagnose errors.</li>
            <li>Respond to support, privacy, or deletion messages sent by email.</li>
          </ul>
          <p>
            Pinterest data is not sold, used for advertising, or used to claim ownership
            of Pins or automatically reproduce a third party&apos;s finished design.
          </p>
        </section>

        <section>
          <h2>5. Storage and retention</h2>
          <p>
            The Pinterest App Secret and Supabase secret key remain in protected
            server-side environment configuration. OAuth tokens are encrypted before
            storage in a private Supabase record. The browser receives only an opaque,
            random session identifier in an HTTP-only Secure production cookie.
          </p>
          <p>
            OAuth connection records expire no later than their available refresh
            lifetime and are deleted when the owner disconnects. OAuth state cookies
            expire after approximately ten minutes. Short-lived one-way request
            identifiers and counters are retained only as needed for rate limiting.
          </p>
          <p>
            The public site reads a sanitized server-side endpoint hosted by the private backend; database
            credentials never enter the public deployment or browser code. Pinterest API responses use no-store
            instructions. Remote Pin media is loaded from its original source without
            being copied to Application storage.
          </p>
        </section>

        <section>
          <h2>6. Cookies and browser storage</h2>
          <p>
            Public browsing does not require an Application account cookie. The private
            administration area uses an essential HTTP-only authentication cookie, a
            short-lived HTTP-only OAuth state cookie, and an HTTP-only cookie containing
            an opaque Pinterest connection identifier. The Application does not currently
            use advertising cookies, behavioral analytics cookies, local storage, or session storage.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            Measures include owner allowlisting, server-only secrets, encrypted OAuth
            tokens, opaque browser session identifiers, OAuth state validation, distributed
            rate limits, database row-level security, restrictive response headers, and
            HTTPS in production. No internet service or storage method can be guaranteed completely secure.
          </p>
        </section>

        <section>
          <h2>8. Third-party services</h2>
          <p>
            GitHub provides private owner authentication. Pinterest provides OAuth, API,
            and referenced content. Supabase provides database storage. Vercel hosts the
            production site. Each provider processes data under its own terms and privacy
            policy. Email providers process messages you choose to send. External Pin
            links lead to services the Application does not control.
          </p>
        </section>

        <section>
          <h2>9. Your choices and rights</h2>
          <p>
            Depending on your location, you may have rights to request access,
            correction, deletion, restriction, or a copy of personal information, or to
            object to certain processing. The connected owner may disconnect or revoke Pinterest at any time.
          </p>
          <p>
            For a privacy or deletion request, email
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            Disconnecting removes the encrypted Pinterest connection record and stops
            further Board retrieval. Routine provider logs may remain until the
            provider&apos;s normal retention cycle completes.
          </p>
        </section>

        <section>
          <h2>10. Children&apos;s privacy</h2>
          <p>
            The Application is not directed to children under 13. Contact the project if
            you believe a child has provided information so the concern can be reviewed.
          </p>
        </section>

        <section>
          <h2>11. Changes</h2>
          <p>
            This policy may change as the Application, Pinterest integration, or data
            practices evolve. The revised policy will be published here with a new “Last updated” date.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Privacy questions and deletion requests:
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

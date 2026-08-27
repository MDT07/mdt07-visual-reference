import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Privacy Policy for MDT07 Visual Reference, including Pinterest OAuth, encrypted server-side sessions, saved references, and deletion choices.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: getPublicUrl("/privacy") },
  openGraph: {
    title: "Privacy Policy",
    description,
    url: getPublicUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description="This policy explains how MDT07 Visual Reference handles information when you visit the public website or connect Pinterest through OAuth."
      />

      <div className="legal-content py-12">
        <p><strong>Last updated:</strong> August 27, 2026</p>

        <section>
          <h2>1. Scope of this policy</h2>
          <p>
            This Privacy Policy applies to MDT07 Visual Reference (the
            “Application”), an independent web tool for discovering, exploring, and
            curating Pinterest visual references for web design and development
            projects. The Application is not an official Pinterest product and is not
            endorsed by or affiliated with Pinterest.
          </p>
          <p>
            The public website does not offer open account registration. Connected
            Pinterest functionality is separated into a private studio that authenticates
            its configured owner through GitHub. The Application does not sell personal
            information.
          </p>
        </section>

        <section>
          <h2>2. Information the Application may process</h2>
          <h3>Pinterest OAuth information</h3>
          <p>
            If you choose to connect Pinterest, Pinterest handles the sign-in and
            authorization screen. The Application receives an authorization code and
            then exchanges it server-side for an access token and, when Pinterest
            supplies one, a refresh token. It also processes the permissions associated
            with those tokens. Pinterest credentials and tokens are not intentionally
            exposed to browser code.
          </p>
          <h3>Private studio authentication</h3>
          <p>
            The private studio may receive the configured owner&apos;s GitHub numeric
            account identifier, display name, email address when GitHub makes it
            available, and profile image for authentication and authorization. Access
            is allowed only when the GitHub identifier matches the server-side owner
            allowlist. The Application does not receive or store the owner&apos;s GitHub
            password.
          </p>
          <h3>Pinterest content</h3>
          <p>
            With the permission you approve, the Application may list public boards
            available to your connected Pinterest account, including public group boards
            the account has joined, and retrieve public Pins from the board you select.
            Board data may include an identifier, name, description, Pin count, and owner
            username. Pin data may include identifiers, titles, descriptions, images,
            source links, media details, and a board owner username included with a Pin.
            Pinterest requires the read-only <code>boards:read</code> and
            <code>pins:read</code> scopes for these operations. The Application does not
            request profile, secret-content, or write scopes and does not retrieve secret
            boards or secret Pins.
          </p>
          <h3>Projects and saved references</h3>
          <p>
            When the private-studio owner explicitly saves a reference, the Application
            stores the project name, project brief, collection name, relevant Pin
            metadata, original Pinterest source URL, and owner-authored catalog details
            such as notes, tags, favorite state, and workflow status in its Supabase
            database. It
            does not copy Pinterest image or video files into its own storage. Unsaved
            search results remain transient and are not added to a project automatically.
          </p>
          <h3>Optional AI catalog analysis</h3>
          <p>
            If the private-studio owner enables AI analysis and explicitly confirms a
            preview, the Application may send a limited, displayed payload to OpenAI.
            That payload contains app-owned project fields and owner-authored collection
            descriptions, notes, tags, favorite state, and workflow status. It excludes
            Pinterest images and video, Pin titles and descriptions, Pinterest URLs and
            account identifiers, GitHub profile data, email addresses, OAuth tokens, and
            application secrets. Merely opening the Studio or preparing a preview does
            not send catalog data to OpenAI.
          </p>
          <h3>Technical information</h3>
          <p>
            The hosting provider may process routine request information such as IP
            address, browser type, request time, and error or security logs to deliver
            and protect the website. The Application itself does not currently include
            advertising, behavioral tracking, or a separate analytics service.
          </p>
        </section>

        <section>
          <h2>3. How Pinterest OAuth works</h2>
          <p>
            Connecting Pinterest is optional. The Application redirects you to
            Pinterest, where Pinterest displays the requested permissions. After you
            authorize access, Pinterest redirects you to the configured callback URL.
            A random, short-lived state value stored in an HTTP-only cookie is checked
            to protect the OAuth exchange against request forgery.
          </p>
          <p>
            You can decline authorization or later revoke the Application’s access in
            your Pinterest account settings. Revocation prevents connected Pin retrieval
            and related reference features from working.
          </p>
        </section>

        <section>
          <h2>4. Why information is used</h2>
          <ul>
            <li>To authenticate authorized requests to the Pinterest API.</li>
            <li>To authenticate and authorize the configured private-studio owner.</li>
            <li>To list available public boards and rank Pins from the board you select for visual research.</li>
            <li>To save and organize owner-selected references into projects and collections.</li>
            <li>When explicitly requested, to generate a read-only structured research report from the previewed app-owned catalog fields.</li>
            <li>To link users back to original Pinterest sources.</li>
            <li>To enforce short-lived request limits and protect API access from abuse.</li>
            <li>To operate, secure, and diagnose the Application.</li>
            <li>To respond to privacy or support messages sent by email.</li>
          </ul>
          <p>
            Pinterest data is not used to claim ownership of Pins or to automatically
            reproduce a third party’s finished design.
          </p>
        </section>

        <section>
          <h2>5. Storage and retention</h2>
          <p>
            The Pinterest App Secret is held only in protected server environment
            configuration. After OAuth, the access token and any refresh token are
            encrypted before being stored in a private Supabase record. The browser
            receives only a random, opaque identifier in an HTTP-only, Secure production
            cookie; browser JavaScript cannot read the cookie or Pinterest tokens. The
            record is scoped to the configured owner and expires no later than the
            available refresh lifetime. Tokens are never written to the source repository.
          </p>
          <p>
            Private-studio authentication currently uses an encrypted application
            session cookie. The Application does not currently maintain a public user
            directory or accept self-service registrations. Saved projects and
            references are available only through owner-authorized server routes on the
            private studio; the public production website has no database access key.
          </p>
          <p>
            Pinterest API responses are returned with instructions not to cache and
            are kept only in the memory of the open page unless the owner explicitly
            saves a reference. Pinterest images are loaded from their original remote
            source without the Application’s image optimization cache. The
            developer-only Agent API remains disabled on the public production website.
            OAuth state cookies expire after approximately ten minutes. One-way request
            identifiers and short-lived counters are stored in Supabase to enforce
            request limits across server instances.
            Routine hosting security and request logs follow the hosting provider’s
            retention settings.
          </p>
          <p>
            AI requests use the OpenAI Responses API with response storage disabled.
            The Application stores the resulting structured report, model name, token
            usage, input fingerprint, and aggregate scope counts in Supabase; it does
            not duplicate the full preview payload in the AI history table. OpenAI
            states that API data is not used to train its models by default. Depending
            on the OpenAI API project&apos;s approved data controls, customer content may
            still be retained in abuse-monitoring logs for up to 30 days. The owner
            should not enter sensitive personal information into project briefs, notes,
            tags, or collection descriptions intended for AI analysis.
          </p>
        </section>

        <section>
          <h2>6. Cookies and browser storage</h2>
          <p>
            The private studio uses an essential HTTP-only application session cookie
            after GitHub authentication. The Application also uses a short-lived,
            HTTP-only cookie during
            Pinterest OAuth to verify the state parameter. If authorization succeeds, it
            uses a separate HTTP-only cookie containing only an opaque random identifier
            for the encrypted server-side Pinterest connection. It does not currently use local storage,
            session storage, advertising cookies, or analytics cookies. If those
            practices change, this policy will be updated.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            Reasonable technical measures are used to protect data, including keeping
            the Pinterest App Secret and Supabase secret key in server-side configuration,
            encrypting OAuth tokens before database storage, keeping only an opaque
            identifier in the browser, checking OAuth state, enforcing distributed
            request limits, applying database row-level security, and serving production
            traffic over HTTPS.
            No internet service or storage method can be guaranteed to be completely
            secure.
          </p>
        </section>

        <section>
          <h2>8. Third-party services</h2>
          <p>
            GitHub supplies the owner authentication service used by the private
            studio. Pinterest supplies the content and OAuth/API services used by the
            Application. Pinterest processes information under its own terms and privacy
            policy. Supabase provides the private database used for encrypted OAuth
            sessions, saved project metadata, rate-limit counters, and security audit
            events. If owner-controlled AI analysis is enabled, OpenAI processes only
            the exact app-owned payload displayed and confirmed in the Studio to
            generate a structured read-only report. The production website is currently hosted on Vercel, whose systems
            may process technical request data needed to deliver the service. If you
            contact the project by email, your email provider and the recipient’s email
            provider will process that message under their own policies.
          </p>
          <p>
            Links to Pins or other external sites take you to services not
            controlled by this Application.
          </p>
        </section>

        <section>
          <h2>9. Your choices and rights</h2>
          <p>
            Depending on your location, you may have rights to request access,
            correction, deletion, restriction, or a copy of personal information, or to
            object to certain processing. You may also disconnect Pinterest by revoking
            authorization through Pinterest.
          </p>
          <p>
            Use the Disconnect control to delete both the opaque browser cookie and its
            encrypted Pinterest connection record. You can also revoke the Application in Pinterest
            account settings. Saved projects, collections, and references can be deleted
            through the private studio, and the owner can download an app-owned catalog
            export in JSON format. For questions or a request concerning other information,
            email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            Routine security logs may remain until the hosting provider’s normal
            retention cycle completes.
          </p>
        </section>

        <section>
          <h2>10. Children’s privacy</h2>
          <p>
            The Application is not directed to children under 13, and Pinterest’s
            Developer Guidelines do not permit apps intended for children under 13. If
            you believe a child has provided information to the Application, contact the
            project so the concern can be reviewed.
          </p>
        </section>

        <section>
          <h2>11. Changes to this policy</h2>
          <p>
            This policy may be updated when the Application, Pinterest integration, or
            data practices change. The revised version will be published at this URL
            with a new “Last updated” date. Material changes should be reviewed before
            continuing to use connected features.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            For privacy questions or data deletion requests, contact
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

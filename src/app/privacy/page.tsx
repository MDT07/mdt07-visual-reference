import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Privacy Policy for MDT07 Visual Reference, including Pinterest OAuth, encrypted sessions, transient API data, and deletion choices.";

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
        <p><strong>Last updated:</strong> August 24, 2026</p>

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
            The current Application does not provide its own user account registration
            system and does not sell personal information.
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
          <h3>Session moodboard</h3>
          <p>
            When you select a reference for the moodboard, the Application keeps the
            relevant Pin data only in the memory of the open browser page. The current
            moodboard is cleared when the page is refreshed or closed. It is not written
            to the server, local storage, session storage, or the source repository.
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
            <li>To list available public boards and rank Pins from the board you select for visual research.</li>
            <li>To curate selected references into the Application’s moodboard.</li>
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
            encrypted into an HTTP-only, Secure production session cookie that browser
            JavaScript cannot read. The Application does not keep one shared user token,
            write user tokens to its source repository, or persist them in an application
            database. The session cookie expires no later than the configured refresh
            lifetime and is replaced when Pinterest refreshes authorization.
          </p>
          <p>
            Pinterest API responses are returned with instructions not to cache and
            are kept only in the memory of the open page. Pinterest images are loaded
            from their original remote source without the Application’s image optimization
            cache. The developer-only Agent API and its local project store are disabled
            on the public production website. OAuth state cookies expire after approximately ten minutes. A one-way
            identifier derived from request and session information may remain briefly
            in an individual server instance to enforce one-minute request windows,
            until routine cleanup or instance recycling.
            Routine hosting security and request logs follow the hosting provider’s
            retention settings.
          </p>
        </section>

        <section>
          <h2>6. Cookies and browser storage</h2>
          <p>
            The Application uses an essential, short-lived, HTTP-only cookie during
            Pinterest OAuth to verify the state parameter. If authorization succeeds, it
            uses a separate encrypted HTTP-only cookie to isolate that browser’s Pinterest
            tokens and connection state. It does not currently use local storage,
            session storage, advertising cookies, or analytics cookies. If those
            practices change, this policy will be updated.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            Reasonable technical measures are used to protect data, including keeping
            the Pinterest App Secret in server-side configuration, encrypting tokens in
            an HTTP-only session cookie, checking OAuth state, limiting connected API
            requests, and serving production traffic over HTTPS.
            No internet service or storage method can be guaranteed to be completely
            secure.
          </p>
        </section>

        <section>
          <h2>8. Third-party services</h2>
          <p>
            Pinterest supplies the content and OAuth/API services used by the
            Application. Pinterest processes information under its own terms and privacy
            policy. The production website is currently hosted on Vercel, whose systems
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
            Use the Disconnect control on the home page to delete the encrypted token
            cookie from this browser. You can also revoke the Application in Pinterest
            account settings. Because the Application does not maintain a user-token
            database, it generally has no separate token record to locate after the
            cookie is removed. For questions or a request concerning other information,
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

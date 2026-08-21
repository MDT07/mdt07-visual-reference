import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import { getPublicUrl, siteConfig } from "@/lib/config";

const description =
  "Privacy Policy for MDT07 Pinterest Reference, including Pinterest OAuth, data use, storage, cookies, and deletion requests.";

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
        description="This policy explains how MDT07 Pinterest Reference handles information when you visit the public website or connect Pinterest through OAuth."
      />

      <div className="legal-content py-12">
        <p><strong>Last updated:</strong> August 21, 2026</p>

        <section>
          <h2>1. Scope of this policy</h2>
          <p>
            This Privacy Policy applies to MDT07 Pinterest Reference (the
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
            With the permissions you approve, the Application may retrieve Pins and
            boards that Pinterest makes available through its API. That data may include
            Pin and board identifiers, titles, descriptions, images, source links,
            media details, and a board owner username included with a Pin. The current
            implementation requests read-only access for Pins and boards and does not
            request a separate Pinterest profile scope.
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
            your Pinterest account settings. Revocation may prevent Pinterest search,
            board access, or other connected features from working.
          </p>
        </section>

        <section>
          <h2>4. Why information is used</h2>
          <ul>
            <li>To authenticate authorized requests to the Pinterest API.</li>
            <li>To search and display relevant Pins for visual research.</li>
            <li>To retrieve boards when that feature is used.</li>
            <li>To curate selected references into the Application’s moodboard.</li>
            <li>To link users back to original Pinterest sources.</li>
            <li>To operate, secure, diagnose, and improve the Application.</li>
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
            Access credentials are handled on the server. Depending on deployment
            configuration, tokens are loaded from protected server environment variables
            or retained temporarily in server memory after an OAuth callback. They are
            not stored in local storage in the browser. Production credentials must not
            be committed to the public source repository.
          </p>
          <p>
            Pinterest content returned for search, board access, or the session
            moodboard is not intentionally persisted by the Application. OAuth state
            cookies expire after approximately ten minutes. Routine hosting security
            and request logs follow the hosting provider’s retention settings.
          </p>
        </section>

        <section>
          <h2>6. Cookies and browser storage</h2>
          <p>
            The current Application uses one essential, short-lived, HTTP-only cookie
            during Pinterest OAuth to verify the state parameter. It does not currently
            use local storage or session storage, and it does not use advertising or
            analytics cookies. If those practices change, this policy will be updated.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            Reasonable technical measures are used to protect data, including keeping
            Pinterest App Secrets and tokens in server-side configuration, using an
            HTTP-only OAuth state cookie, and serving production traffic over HTTPS.
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
            Links to Pins, boards, or other external sites take you to services not
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
            To request deletion of a token or other information held by the Application, email
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            with enough context to identify the connected data. The request may need to
            be verified before relevant tokens or related records are deleted. Data
            may remain briefly in security logs or backups until their normal retention
            cycles complete.
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

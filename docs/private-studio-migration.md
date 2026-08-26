# Private studio migration and rollback runbook

During migration, the approved public deployment remained unchanged until the
private preview passed all checks. The split deployment cutover is now complete.

## Current status — August 27, 2026

- Created Vercel project `mdt07-reference-studio`.
- Deployed the Studio at `https://mdt07-reference-studio.vercel.app`.
- Created a GitHub OAuth App with the exact private callback, installed a single
  working Client Secret, and verified the immutable-ID owner session.
- Installed the existing Pinterest server credentials without exposing an access
  token, added the exact private callback, and kept the old public callback for
  rollback.
- Completed a fresh live Pinterest OAuth flow using only `boards:read` and
  `pins:read`.
- Verified two public boards, retrieval and local ranking of 15 Pins from the selected
  board, the session-only moodboard, connected Admin status, and an error-free browser
  console.
- Confirmed unauthenticated Studio/Admin redirects, 403 Pinterest APIs, 404 Agent API,
  and full-host `robots.txt` exclusion.
- Merged the reviewed private-boundary branch into `main` and deployed the same
  verified codebase to both Vercel projects.
- Switched the public host to `APP_MODE=public`, removed Pinterest and Agent secrets
  from that Vercel project, and redeployed from the cleaned environment.
- Verified the public Home, About, Privacy, Terms, and Contact routes, canonical
  metadata, security headers, and contact links. Verified that private pages and
  Auth/Pinterest/Agent handlers fail closed on the public host.
- Reverified the private owner session, connected Pinterest status, two public
  boards, and a live uncached 15-Pin search after the final redeploy.
- Kept the old public Pinterest callback registered temporarily for rollback and
  observation; the public application no longer serves the callback route.

## Preparation

1. Keep the `standard-access-approved-2026-08-25` Git tag.
2. Use the existing second Vercel project `mdt07-reference-studio`.
3. Keep `APP_MODE=studio`, `PUBLIC_SITE_URL`, and `APP_URL` configured.
4. Configure GitHub OAuth with
   `https://mdt07-reference-studio.vercel.app/api/auth/callback/github`.
5. Set `OWNER_GITHUB_ID=172265857` and private Auth.js variables.
6. Do not expose Pinterest secrets to public or preview environments.

## Pinterest cutover

1. Deploy the private project without changing the existing Pinterest redirect.
2. Verify owner login, 403/404 behavior, CSP, and private route isolation.
3. Add
   `https://mdt07-reference-studio.vercel.app/api/pinterest/auth/callback` in
   Pinterest App settings.
4. Configure the matching `PINTEREST_REDIRECT_URI` in the private project.
5. Deploy and complete a fresh owner OAuth flow.
6. Verify boards, search, token refresh, disconnect, and reconnect.
7. Switch the public project to `APP_MODE=public` with no Pinterest credentials.
8. Confirm public legal pages remain available and `/api/pinterest/auth` returns 404.
9. Remove the old public redirect URI only after an observation period.

## Rollback

1. Restore the prior public Vercel deployment.
2. Restore the prior registered redirect URI if it was removed.
3. Revoke the failed private connection and inspect redacted logs.
4. Do not copy tokens between hosts.

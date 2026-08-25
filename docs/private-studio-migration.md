# Private studio migration and rollback runbook

The approved public deployment must remain unchanged until the private preview
passes all checks.

## Current status — August 25, 2026

- Created Vercel project `mdt07-reference-studio`.
- Deployed a secret-free Studio scaffold at
  `https://mdt07-reference-studio.vercel.app`.
- Confirmed Studio/Admin redirect to owner login, connected APIs fail closed, Agent
  API returns 404, and the host disallows indexing.
- GitHub OAuth credentials and Pinterest credentials are not installed on this new
  project yet, so connected functionality cannot start.
- The existing public production and Pinterest Redirect URI remain unchanged.

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

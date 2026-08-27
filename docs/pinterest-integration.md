# Pinterest Integration Architecture

## Access boundary

Pinterest integration exists only when `APP_MODE=studio`. Every Pinterest route first
requires a valid Auth.js session whose GitHub account has the configured immutable
`OWNER_GITHUB_ID`. The public deployment returns 404 for the same routes, regardless
of any accidentally present Pinterest credentials.

The approved integration remains read-only (`boards:read`, `pins:read`). It lists
public boards available to the connected owner, retrieves Pins from the selected
board through Pinterest API v5, and ranks them locally against a project brief. It
does not claim global Pinterest search or write access.

## Authentication sequence

```text
Owner -> GitHub OAuth -> Auth.js owner session
Owner -> /api/pinterest/auth -> Pinterest consent
Pinterest -> /api/pinterest/auth/callback -> state validation + token exchange
Server -> encrypted Pinterest token record in Supabase
Browser <- opaque, Secure, HTTP-only session identifier
Studio -> owner-protected API route -> Pinterest API v5
```

The GitHub application session and Pinterest token session are separate. A Pinterest
cookie alone never authorizes an API request: server routes require the owner session
first. State cookies protect the Pinterest callback, while mutation routes also verify
the request `Origin`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `APP_MODE` | Must be `studio` to enable private routes |
| `APP_URL` | Exact private Studio origin |
| `OWNER_GITHUB_ID` | Immutable numeric GitHub ID allowed to sign in |
| `AUTH_SECRET` | Auth.js session signing secret |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret |
| `PINTEREST_APP_ID` | Pinterest App ID |
| `PINTEREST_APP_SECRET` | Pinterest App Secret |
| `PINTEREST_REDIRECT_URI` | Exact Pinterest callback registered for this host |
| `PINTEREST_SESSION_SECRET` | At least 32 random characters; encrypts the server-side token payload |
| `PINTEREST_API_BASE` | Production or supported Sandbox API base |
| `PINTEREST_SEARCH_PAGE_SIZE` | Pin page size |
| `SUPABASE_URL` | Private Supabase project API URL |
| `SUPABASE_SECRET_KEY` | Dedicated server-only secret key; never sent to the browser |

No credential or access token belongs in a `NEXT_PUBLIC_*` variable, Git history,
logs, screenshots, or demo fixtures.

## Search pipeline

```text
Project brief -> structured design intent -> query strategy
              -> list connected account public boards
              -> select board -> list its Pins
              -> normalize -> deduplicate -> score -> rank
              -> owner-selected, source-linked project references
```

Pinterest responses use `Cache-Control: no-store`. Unsaved results remain in open-page
React state. When the owner explicitly saves a reference, the application persists
selected Pin metadata and the original source URL in Supabase; Pinterest media files
remain at their original source and are not copied into application storage.

## Production redirect values

- Local: `http://localhost:3000/api/pinterest/auth/callback`
- Production:
  `https://mdt07-reference-studio.vercel.app/api/pinterest/auth/callback`

Do not use the public website as the production callback after private Studio cutover
and do not register a preview deployment URL. The value above uses the stable private
origin and must match Pinterest configuration exactly. Register it only after GitHub
owner authentication works on that host.

## Known hardening work

- Rotate all credentials previously handled during development before final cutover.
- Add audited write actions only if a later product need justifies additional scopes.

See `docs/threat-model.md` and `docs/private-studio-migration.md` for acceptance and
cutover requirements.

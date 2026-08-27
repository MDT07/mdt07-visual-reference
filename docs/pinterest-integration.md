# Pinterest integration

Pinterest integration is enabled only when `APP_MODE=admin`. Every connected route
requires the authenticated GitHub owner and uses server-side credentials.

## Current scope

- `boards:read`
- `pins:read`

The application lists real public Boards available to the connected owner account and
retrieves all available Pins when a visitor opens a Board. It does not use global Pinterest
search, secret content, write actions, scraping, media copying, or an AI provider.

## Flow

```text
Owner GitHub session
  -> /api/pinterest/auth
  -> Pinterest authorization
  -> /api/pinterest/auth/callback
  -> encrypted server-side Supabase connection
  -> server-only owner Pinterest connection
  -> sanitized no-store /api/public/boards endpoints
  -> public /boards catalog and individual Board pages
```

The browser receives only an opaque HTTP-only connection identifier. Access and refresh
tokens are encrypted at rest and never rendered or returned by JSON APIs.

## Required private environment

| Variable | Purpose |
| --- | --- |
| `APP_MODE=admin` | Enables private routes |
| `APP_URL` | Exact private administration origin |
| `PUBLIC_SITE_URL` | Canonical public catalog origin |
| `OWNER_GITHUB_ID` | Immutable owner allowlist key |
| `PINTEREST_APP_ID` | Server-side Pinterest application ID |
| `PINTEREST_APP_SECRET` | Server-only secret |
| `PINTEREST_REDIRECT_URI` | Exact private callback URI |
| `PINTEREST_SESSION_SECRET` | Encrypts stored OAuth sessions |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | Server-side durable storage |

Local callback:

```text
http://localhost:3000/api/pinterest/auth/callback
```

Production uses `<PRIVATE_ADMIN_ORIGIN>/api/pinterest/auth/callback`. It must match the
Pinterest registration character-for-character. Public deployments must not contain
Pinterest, Auth.js, or session-encryption credentials.

# MDT07 Visual Reference

A curated public library of source-linked Pinterest references for web design and
development projects. Visitors browse the connected owner account's public Pinterest
Boards and Pins without registration; Pinterest OAuth stays on a separate owner-only deployment.

The application is independent and is not endorsed by, affiliated with, or an
official product of Pinterest.

## Architecture

| Mode | `APP_MODE` | Purpose |
| --- | --- | --- |
| Public | `public` or omitted | Home, real public Pinterest Boards, Pins, About, Contact, Privacy, Terms |
| Admin | `admin` | GitHub owner authentication, Pinterest OAuth, connection status, audit and security controls |

Unknown `APP_MODE` values fail closed to `public`. Public mode returns 404 for
owner-only pages and APIs. Admin access additionally requires the exact numeric GitHub
owner ID configured server-side.

The public host is currently:

- `https://mdt07-visual-reference.vercel.app`

The separate private host must use `APP_MODE=admin`. Its URL and Pinterest callback
must match the environment configuration exactly.

## Public routes

| Route | Description |
| --- | --- |
| `/` | Product overview and featured Pinterest Boards |
| `/boards` | Searchable public Pinterest Board catalog |
| `/boards/[id]` | All available Pins in one public Board |
| `/about` | Purpose and workflow |
| `/contact` | Email and GitHub contact |
| `/privacy` | Public Privacy Policy |
| `/terms` | Public Terms of Service |

## Private routes

| Route | Public mode | Admin mode |
| --- | --- | --- |
| `/login` | 404 | GitHub owner sign-in |
| `/admin` | 404 | Pinterest connection, status, audit and security controls |
| `/api/pinterest/*` | 404/forbidden | Owner-authenticated read-only Pinterest API |
| `/api/admin/*` | 404/forbidden | Owner-only security maintenance |

There is no public registration, AI runtime, Agent API, or Pinterest write scope.

## Data boundary

The public catalog reads only public Pinterest Boards from the connected owner account.
It displays sanitized Board names, descriptions, cover media and Pin counts, plus Pin
titles, descriptions, remote image URLs, attribution usernames, and original Pinterest links.

It never exposes GitHub IDs, OAuth sessions, access or refresh tokens, secrets,
rate-limit records, or audit events. Pinterest media remains remote and is not copied
into application storage. Pinterest responses and public catalog routes use no-store caching.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

For the public catalog, configure `PUBLIC_CATALOG_API_URL` to the private backend's
`/api/public/boards` endpoint. For private administration, set `APP_MODE=admin` and add
the owner ID, Auth.js, Pinterest, and Supabase credentials shown in `.env.example`.

Local Pinterest callback:

```text
http://localhost:3000/api/pinterest/auth/callback
```

The production callback must use the private admin origin and match the URI registered
in Pinterest exactly. Do not hardcode a production callback in source code.

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Use two Vercel projects from the same repository:

1. Public: `APP_MODE=public`, public URLs, and `PUBLIC_CATALOG_API_URL`. Do not add
   Supabase, Pinterest, or Auth.js secrets.
2. Admin: `APP_MODE=admin`, private `APP_URL`, `PUBLIC_SITE_URL`, GitHub Auth.js,
   Pinterest OAuth, Supabase, and the owner ID.

Changing the private hostname requires coordinated updates to:

- `APP_URL`;
- GitHub OAuth callback (`/api/auth/callback/github`);
- `PINTEREST_REDIRECT_URI` (`/api/pinterest/auth/callback`);
- the exact redirect URI registered in Pinterest.

See [SECURITY.md](./SECURITY.md), [docs/pinterest-integration.md](./docs/pinterest-integration.md),
and [docs/threat-model.md](./docs/threat-model.md).

## Security

- Pinterest App Secret, tokens, Auth.js secret, and Supabase secret are server-only.
- OAuth state, owner GitHub ID allowlisting, encrypted token storage, no-store API
  responses, database RLS, and distributed rate limiting protect the connected surface.
- The application requests only `boards:read` and `pins:read`.
- Never commit `.env*`, tokens, secrets, cookies, or exported private data.

Security reports: `emirsemenov@yahoo.com`.

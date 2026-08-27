# MDT07 Visual Reference

A private, project-scoped visual research studio with a public product and legal
website. The studio lets its owner connect Pinterest with read-only access, select a
public board, rank Pins against a web-project brief, and compare source-linked
references in persistent, owner-scoped project collections.

MDT07 Visual Reference is an independent project. It is not endorsed by, affiliated
with, or an official product of Pinterest.

## Deployment boundary

The same codebase supports two deliberately separate deployments:

| Mode | `APP_MODE` | Purpose |
| --- | --- | --- |
| Public website | `public` or unset | Product information and public legal pages only |
| Private studio | `studio` | GitHub owner sign-in, Pinterest OAuth/API, Studio, and Admin |

`APP_MODE` fails closed to `public`. In public mode, private pages and Auth/Pinterest
API routes return 404 even if credentials are accidentally present in the environment.

Current verified public identity:

- GitHub owner: `MDT07`
- Repository: `https://github.com/MDT07/mdt07-visual-reference`
- Public website: `https://mdt07-visual-reference.vercel.app/`
- Privacy Policy: `https://mdt07-visual-reference.vercel.app/privacy`
- Private Studio: `https://mdt07-reference-studio.vercel.app/`

GitHub owner authentication and the read-only Pinterest OAuth flow were verified on
the private host on August 27, 2026. The public host remains the product and legal
website; connected functionality belongs only on the private Studio deployment.

## Features

- Public Home, About, Privacy Policy, Terms of Service, and Contact pages
- Private GitHub owner authentication through Auth.js
- Pinterest OAuth 2.0 protected by both owner auth and a short-lived state cookie
- Read-only `boards:read` and `pins:read` access
- Revocable server-side Pinterest token vault with an opaque HTTP-only session cookie
- Board Pin retrieval and local relevance ranking against a project brief
- Supabase-backed projects and collections with notes, tags, favorites, workflow status,
  local filtering, and original Pinterest source links
- Owner-only JSON catalog export, deletion controls, and security-state maintenance
- Optional owner-confirmed AI analysis of app-owned briefs, descriptions, notes, tags,
  favorites, and workflow state; no Pinterest content or external tools are included
- Distributed rate limiting and owner audit events in Supabase
- Fail-closed deployment modes, mutation origin checks, security headers, and CI
- No public registration and no shared Pinterest account access

## Stack and entry points

- Next.js 16 App Router and server routes
- React 19, TypeScript 5, Tailwind CSS 4
- Public home: `src/app/page.tsx`
- Private studio: `src/app/studio/page.tsx`
- Owner administration: `src/app/admin/page.tsx`
- Shared layout: `src/app/layout.tsx`
- Auth configuration: `src/auth.ts`
- Route boundary: `src/proxy.ts`
- API routes: `src/app/api/`

## Routes

| Route | Public mode | Studio mode |
| --- | --- | --- |
| `/` | Product website | Product website |
| `/about`, `/privacy`, `/terms`, `/contact` | Public | Public |
| `/login` | 404 | Owner sign-in |
| `/studio` | 404 | Authenticated visual workspace |
| `/admin` | 404 | Authenticated configuration status |
| `/api/auth/*` | 404 | Auth.js owner authentication |
| `/api/pinterest/*` | 404 | Authenticated Pinterest OAuth/API |
| `/api/projects`, `/api/collections`, `/api/references` | 404 | Owner-only catalog API |
| `/api/export`, `/api/audit`, `/api/admin/*` | 404 | Owner-only data and operations API |
| `/api/ai/catalog-analysis` | 404 | Owner-only preview and read-only AI reports |
| `/api/agent/*` | 404 by default | Optional developer-only API |

## Local development

Public mode requires no secrets:

```bash
npm install
cp .env.example .env.local
npm run dev
```

For private Studio development, set `APP_MODE=studio`, configure GitHub OAuth and
Pinterest server variables, and register the exact localhost callbacks with each
provider. See `.env.example` and `docs/private-studio-migration.md`.

## Environment variables

All authentication and Pinterest values are server-side. Never prefix them with
`NEXT_PUBLIC_`, expose them to client components, or commit `.env.local`.

```bash
APP_MODE=public
PUBLIC_SITE_URL=https://mdt07-visual-reference.vercel.app
APP_URL=https://mdt07-visual-reference.vercel.app

# Studio-only owner authentication
OWNER_GITHUB_ID=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_TRUST_HOST=true

# Studio-only Pinterest integration
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
PINTEREST_REDIRECT_URI=
PINTEREST_SESSION_SECRET=
PINTEREST_API_BASE=https://api.pinterest.com/v5
PINTEREST_SEARCH_PAGE_SIZE=25

# Studio-only Supabase storage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=

# Optional Studio-only AI analysis
AI_CATALOG_ENABLED=false
OPENROUTER_API_KEY=
OPENROUTER_MODEL=z-ai/glm-5.2:free
AI_CATALOG_MAX_REFERENCES=50

# Optional private developer endpoints
AGENT_API_ENABLED=false
AGENT_API_KEY=
```

`OWNER_GITHUB_ID` must be the immutable numeric GitHub account ID, not a mutable
username. `AUTH_SECRET` and `PINTEREST_SESSION_SECRET` must each contain at least 32
cryptographically random characters.
Pinterest tokens are encrypted before they enter the private Supabase vault. The
Secure, HTTP-only browser cookie contains only an opaque random session identifier.
Neither OAuth tokens nor the Supabase secret key are exposed to browser JavaScript or
stored in the repository.

## Deployment

Use two separate Vercel projects:

1. Public project: `APP_MODE=public`, public URL only, no Auth/Pinterest/Supabase/Agent secrets.
2. Private Studio project: `APP_MODE=studio`,
   `https://mdt07-reference-studio.vercel.app`, owner Auth.js and Pinterest
   variables, plus the exact provider callback URLs.

After the private deployment is verified, register these exact callbacks:

- GitHub OAuth callback:
  `https://mdt07-reference-studio.vercel.app/api/auth/callback/github`
- Pinterest local callback: `http://localhost:3000/api/pinterest/auth/callback`
- Pinterest production callback:
  `https://mdt07-reference-studio.vercel.app/api/pinterest/auth/callback`

The Pinterest Company/App Website and Privacy Policy should remain the public URLs
shown above. The production Pinterest Redirect URI must use the verified private
Studio origin and match Pinterest configuration character-for-character.

See `docs/private-studio-migration.md`, `docs/threat-model.md`, and
`docs/architecture/` before cutover.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

CI also runs a production build, dependency audit, and CodeQL analysis. Dependabot is
configured for npm and GitHub Actions updates.

## Current limitations

- AI visual analysis and Pinterest write operations are not implemented or claimed.
- AI catalog analysis is limited to previewed app-owned text and workflow metadata;
  it is routed server-side through OpenRouter with per-request privacy controls.
  Image analysis, autonomous tools, and catalog mutations remain disabled.
- Credential rotation is intentionally deferred during the active integration phase;
  rotate all previously handled credentials before expanding access beyond the owner
  or treating the security milestone as complete.

## Contact

- Email: `emirsemenov@yahoo.com`
- GitHub: `https://github.com/MDT07`

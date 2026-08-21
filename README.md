# MDT07 Pinterest Reference

A web tool for discovering and exploring Pinterest visual references for web design
and development projects. The application searches Pinterest data through server-side
API routes, links users back to original Pins, and lets selected references be curated
into a non-persistent moodboard for the current open page.

MDT07 Pinterest Reference is an independent project. It is not endorsed by, affiliated
with, or an official product of Pinterest.

## Repository and production site

- GitHub owner: `MDT07`
- Current repository: `visref-moodboard`
- Repository URL: `https://github.com/MDT07/visref-moodboard`
- GitHub profile: `https://github.com/MDT07`
- Production website: `https://pinterest-integration.vercel.app/`
- Privacy Policy: `https://pinterest-integration.vercel.app/privacy`
- Production OAuth callback:
  `https://pinterest-integration.vercel.app/api/pinterest/auth/callback`

Vercel hosts both the public review website and the server-side Next.js application so
the product pages, Privacy Policy, and OAuth callback use one stable production host.

## Features

- Public Home, About, Privacy Policy, Terms of Service, and Contact pages
- Pinterest OAuth 2.0 endpoints with a short-lived state cookie
- Read-only Pin search and board access through Pinterest API v5
- Server-side App Secret and token handling
- Session-only reference moodboard with original Pinterest source links
- Per-page metadata, Open Graph image, favicon, robots, and sitemap

## Stack and entry points

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Main page: `src/app/page.tsx`
- Shared layout: `src/app/layout.tsx`
- API routes: `src/app/api/`

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Product explanation, Pinterest search, and session moodboard |
| `/about` | Project purpose and workflow |
| `/privacy` | Public Privacy Policy |
| `/terms` | Terms of Service |
| `/contact` | Email and GitHub contact information |
| `/robots.txt` | Crawler rules |
| `/sitemap.xml` | Public route index |

## API routes

| Route | Purpose |
| --- | --- |
| `/api/pinterest/auth` | Start Pinterest OAuth |
| `/api/pinterest/auth/callback` | Validate OAuth state and exchange the code |
| `/api/pinterest/auth/refresh` | Refresh an access token |
| `/api/pinterest/search?q=...` | Search Pins |
| `/api/pinterest/boards` | List boards available to the authorized account |

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The OAuth Redirect URI registered in Pinterest must
exactly match `PINTEREST_REDIRECT_URI`.

## Environment variables

All Pinterest credentials and tokens are server-side variables. Do not prefix them
with `NEXT_PUBLIC_`, put them in browser code, or commit `.env.local`.

```bash
SITE_URL=http://localhost:3000
SITE_DOMAIN=localhost

PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
PINTEREST_REDIRECT_URI=http://localhost:3000/api/pinterest/auth/callback

PINTEREST_ACCESS_TOKEN=
PINTEREST_REFRESH_TOKEN=
PINTEREST_TOKEN_EXPIRES_AT=

PINTEREST_API_BASE=https://api.pinterest.com/v5
PINTEREST_SEARCH_PAGE_SIZE=25
```

The current OAuth callback keeps newly exchanged tokens only in server memory.
Environment tokens remain supported for the current single-account workflow. Do not
persist Pinterest API content without confirming compliance with the current Pinterest
Developer Guidelines.

## Production deployment

Set these variables in the Vercel project settings:

```bash
SITE_URL=https://pinterest-integration.vercel.app
SITE_DOMAIN=pinterest-integration.vercel.app
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
PINTEREST_REDIRECT_URI=https://pinterest-integration.vercel.app/api/pinterest/auth/callback
PINTEREST_ACCESS_TOKEN=...
PINTEREST_REFRESH_TOKEN=...
PINTEREST_TOKEN_EXPIRES_AT=...
```

Redeploy after changing environment variables. Never use a temporary Vercel preview
URL as the registered production Redirect URI.

## Pinterest App registration values

Use these values only after the updated production deployment has been verified:

| Pinterest field | Value |
| --- | --- |
| Company website / App link | `https://pinterest-integration.vercel.app/` |
| Privacy Policy | `https://pinterest-integration.vercel.app/privacy` |
| Redirect URI (local) | `http://localhost:3000/api/pinterest/auth/callback` |
| Redirect URI (production) | `https://pinterest-integration.vercel.app/api/pinterest/auth/callback` |

## Pinterest Sandbox

Pinterest Sandbox is separate from production and uses its own API host and token. A
Sandbox token generated in Pinterest App management currently lasts 30 days. Set
`PINTEREST_API_BASE=https://api-sandbox.pinterest.com/v5` only for endpoints Pinterest
lists as Sandbox-supported, and never reuse a Sandbox token in production. See the
official [Pinterest Sandbox documentation](https://developers.pinterest.com/docs/developer-tools/sandbox/).

Before requesting access, review the current [Pinterest Developer Guidelines](https://policy.pinterest.com/en/developer-guidelines)
and [access tier requirements](https://developers.pinterest.com/docs/key-concepts/access-tiers/).

## Repository rename

The local package is named `mdt07-pinterest-reference`, while the remote repository is
still `MDT07/visref-moodboard`. Renaming the GitHub repository does not automatically
rename or reconfigure the Vercel production domain.

## Contact

- Email: `emirsemenov@yahoo.com`
- GitHub: `https://github.com/MDT07`

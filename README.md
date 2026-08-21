# MDT07 Visual Reference

A project-scoped visual research workspace for web design and development. The
application turns a specific project brief into a temporary comparison workspace,
retrieves source-linked Pinterest references through server-side API routes, and keeps
selected references only in the current open page.

MDT07 Visual Reference is an independent project. It is not endorsed by, affiliated
with, or an official product of Pinterest.

## Repository and production site

- GitHub owner: `MDT07`
- Current repository: `visref-moodboard`
- Repository URL: `https://github.com/MDT07/visref-moodboard`
- GitHub profile: `https://github.com/MDT07`
- Production website: `https://mdt07-visual-reference.vercel.app/`
- Privacy Policy: `https://mdt07-visual-reference.vercel.app/privacy`
- Production OAuth callback:
  `https://mdt07-visual-reference.vercel.app/api/pinterest/auth/callback`

Vercel hosts both the public review website and the server-side Next.js application so
the product pages, Privacy Policy, and OAuth callback use one stable production host.

## Features

- Public Home, About, Privacy Policy, Terms of Service, and Contact pages
- Pinterest OAuth 2.0 with a short-lived state cookie
- Read-only Pin search through Pinterest API v5 using only `pins:read`
- Per-browser encrypted HTTP-only token sessions; no shared user token
- Authenticated API routes with short-lived rate limiting
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
| `/api/pinterest/auth/disconnect` | Delete the current browser's encrypted token session |
| `/api/pinterest/search?q=...` | Search Pins |

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
PINTEREST_SESSION_SECRET=

PINTEREST_API_BASE=https://api.pinterest.com/v5
PINTEREST_SEARCH_PAGE_SIZE=25
```

`PINTEREST_SESSION_SECRET` must contain at least 32 random characters. OAuth tokens are
encrypted into a Secure, HTTP-only cookie scoped to the browser that completed OAuth.
They are not shared through process memory, exposed to browser JavaScript, or persisted
in an application database. Pinterest API content is returned with `no-store` and kept
only in the current page state.

## Production deployment

Set these variables in the Vercel project settings:

```bash
SITE_URL=https://mdt07-visual-reference.vercel.app
SITE_DOMAIN=mdt07-visual-reference.vercel.app
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
PINTEREST_REDIRECT_URI=https://mdt07-visual-reference.vercel.app/api/pinterest/auth/callback
PINTEREST_SESSION_SECRET=...
```

Redeploy after changing environment variables. Never use a temporary Vercel preview
URL as the registered production Redirect URI.

## Pinterest App registration values

Use these values only after the updated production deployment has been verified:

| Pinterest field | Value |
| --- | --- |
| Company website / App link | `https://mdt07-visual-reference.vercel.app/` |
| Privacy Policy | `https://mdt07-visual-reference.vercel.app/privacy` |
| Redirect URI (local) | `http://localhost:3000/api/pinterest/auth/callback` |
| Redirect URI (production) | `https://mdt07-visual-reference.vercel.app/api/pinterest/auth/callback` |

Suggested access-request description:

> MDT07 Visual Reference is a project-scoped creative research workspace for web
> designers and developers. A user starts with a specific website or interface brief,
> authorizes read-only Pinterest access, searches relevant public Pins, and compares
> selected references in a temporary session workspace before creating original work.
> Pinterest API content is not persisted, every Pin links to its original Pinterest
> source, and the application requests only `pins:read`.

## Pinterest Sandbox

Pinterest Sandbox is separate from production and uses its own API host and token. A
Sandbox token generated in Pinterest App management currently lasts 30 days. Set
`PINTEREST_API_BASE=https://api-sandbox.pinterest.com/v5` only for endpoints Pinterest
lists as Sandbox-supported, and never reuse a Sandbox token in production. See the
official [Pinterest Sandbox documentation](https://developers.pinterest.com/docs/developer-tools/sandbox/).

Before requesting access, review the current [Pinterest Developer Guidelines](https://policy.pinterest.com/en/developer-guidelines)
and [access tier requirements](https://developers.pinterest.com/docs/key-concepts/access-tiers/).

## Repository rename

The local package is named `mdt07-visual-reference`, while the remote repository remains
`MDT07/visref-moodboard`. This repository name is already brand-neutral and does not need
to change for the Vercel production alias.

## Contact

- Email: `emirsemenov@yahoo.com`
- GitHub: `https://github.com/MDT07`

# Pinterest Integration

Standalone Next.js application for official Pinterest API v5 integration.
Search visual references, curate a moodboard, and manage OAuth securely.

## Features

- Pinterest OAuth 2.0 flow
- Search pins via `/v5/search/pins`
- Curate references into local `data/references.json`
- Public moodboard gallery with attribution links
- Server-side token storage (no tokens exposed to browser)
- Privacy policy page included

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in PINTEREST_APP_ID and PINTEREST_APP_SECRET
npm run dev
```

Open http://localhost:3000.

## Pinterest App Setup

1. Go to https://developers.pinterest.com/ and create an app.
2. Fill in the fields with your deployed URLs:

| Field | Value |
|-------|-------|
| App purpose | Visual reference moodboard for creative projects: search Pinterest pins, curate a private reference board, and display saved images with proper attribution. |
| Company website or App link | `https://mdt07.github.io/visref-moodboard/` |
| Privacy policy link | `https://mdt07.github.io/visref-moodboard/privacy` |
| Redirect URI (dev) | `http://localhost:3000/api/pinterest/auth/callback` |
| Redirect URI (prod) | `https://visref-moodboard.vercel.app/api/pinterest/auth/callback` |

3. Copy **App ID** and **App Secret** into `.env.local`.
4. Set `SITE_URL=http://localhost:3000` in `.env.local` for local development.
5. Start the dev server and click **Connect Pinterest**.
6. After OAuth callback, copy tokens from the console into `.env.local`.
7. Restart the dev server.

## Deployment

### GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/visref-moodboard.git
git branch -M main
git push -u origin main
```

### Vercel

```bash
npx vercel
```

Or import the GitHub repository in the Vercel Dashboard.

Add these environment variables in Vercel project settings:

```bash
SITE_URL=https://visref-moodboard.vercel.app
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
PINTEREST_REDIRECT_URI=https://visref-moodboard.vercel.app/api/pinterest/auth/callback
PINTEREST_ACCESS_TOKEN=...
PINTEREST_REFRESH_TOKEN=...
PINTEREST_TOKEN_EXPIRES_AT=...
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/pinterest/auth` | Start OAuth flow |
| `/api/pinterest/auth/callback` | OAuth callback handler |
| `/api/pinterest/auth/refresh` | Refresh access token |
| `/api/pinterest/search?q=...` | Search pins |
| `/api/pinterest/boards` | List user boards |
| `/api/references` | Save a pin to moodboard |

## Notes

- `.env.local` is gitignored. Never commit tokens.
- All Pinterest API requests are proxied through server-side routes.
- Rate limits: Trial 1000 req/day, Standard 100 req/sec per user.

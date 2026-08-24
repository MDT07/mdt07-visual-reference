# Pinterest Integration Architecture

## Overview

MDT07 Visual Reference uses the official Pinterest API v5 with read-only access
(`boards:read` and `pins:read`). It retrieves public Pins owned by the connected
Pinterest account and ranks them locally against the user's project brief. All
Pinterest requests are proxied through server-side Next.js API routes. OAuth tokens
are encrypted into a per-browser HTTP-only cookie and never exposed to the client.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PINTEREST_APP_ID` | Pinterest App ID |
| `PINTEREST_APP_SECRET` | Pinterest App Secret |
| `PINTEREST_REDIRECT_URI` | Must match the redirect URI registered in Pinterest exactly |
| `PINTEREST_SESSION_SECRET` | At least 32 random characters; encrypts the OAuth session cookie |
| `PINTEREST_API_BASE` | `https://api.pinterest.com/v5` or sandbox host |
| `PINTEREST_SEARCH_PAGE_SIZE` | Pinterest search page size |
| `AGENT_API_ENABLED` | Explicit opt-in for developer-only `/api/agent/*` endpoints; defaults to disabled |
| `AGENT_API_KEY` | Server-side bearer key required when the Agent API is enabled |

## Search pipeline

```text
User prompt
    ↓
Design Brief Parser
    ↓
Structured Design Intent
    ↓
Query Generator
    ↓
Pinterest List Pins (one live request)
    ↓
Raw Candidates
    ↓
Normalization (PinterestPin → VisualReference)
    ↓
Deduplication
    ↓
Heuristic Scoring
    ↓
Ranking
    ↓
Final References
```

## Data flow

- Browser sends search request to `/api/pinterest/search`.
- Server decrypts the Pinterest session cookie.
- Pipeline interprets the project brief, retrieves a page of the connected account's public Pins, deduplicates, scores, and ranks results locally.
- Results are returned as `SearchPipelineResult` and displayed in the UI.

## Optional developer project storage

The developer-only Agent API can store research projects and collections in
`data/projects.json` for local, single-user testing. It is disabled by default and
must remain disabled on the public Pinterest review deployment. The public web UI
does not call this store; its moodboard remains only in the open browser page.

## Limitations

- Listing public Pins requires the read-only `boards:read` and `pins:read` scopes.
- Global Pinterest discovery is not claimed; the public application uses Pins owned by the connected account.
- The optional JSON project store is not suitable for Vercel production runtime.
- AI visual analysis is planned as a future enhancement.

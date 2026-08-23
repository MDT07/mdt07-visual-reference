# Pinterest Integration Architecture

## Overview

MDT07 Visual Reference uses the official Pinterest API v5 with read-only access (`pins:read`). All Pinterest requests are proxied through server-side Next.js API routes. OAuth tokens are encrypted into a per-browser HTTP-only cookie and never exposed to the client.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PINTEREST_APP_ID` | Pinterest App ID |
| `PINTEREST_APP_SECRET` | Pinterest App Secret |
| `PINTEREST_REDIRECT_URI` | Must match the redirect URI registered in Pinterest exactly |
| `PINTEREST_SESSION_SECRET` | At least 32 random characters; encrypts the OAuth session cookie |
| `PINTEREST_API_BASE` | `https://api.pinterest.com/v5` or sandbox host |
| `PINTEREST_SEARCH_PAGE_SIZE` | Pinterest search page size |

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
Multi-query Pinterest Search
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
- Pipeline generates multiple Pinterest queries, fetches pages, merges, deduplicates, scores, and ranks results.
- Results are returned as `SearchPipelineResult` and displayed in the UI.

## Project storage

Research projects and collections are stored in `data/projects.json` for single-user deployments. Each reference keeps its original Pinterest source URL and ID for attribution.

## Limitations

- Pinterest Trial Access allows only `pins:read`.
- Saving a reference does not create a Pin on Pinterest; it is stored locally.
- AI visual analysis is planned as a future enhancement.

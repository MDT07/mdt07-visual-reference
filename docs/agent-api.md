# AI Agent API

The Agent API is an experimental, owner-only interface for local development and a
future private Studio. It is not part of the public product surface and is disabled by
default.

## Security boundary

To enable it, the deployment must use `APP_MODE=studio` and set:

```bash
AGENT_API_ENABLED=true
AGENT_API_KEY=<strong-random-value>
```

Requests require both the authenticated GitHub owner session and
`Authorization: Bearer <AGENT_API_KEY>`. Pinterest search additionally requires an
active Pinterest OAuth session in the same browser. Keep these endpoints disabled in
the public deployment.

This interface is not ready for private production yet:

- the bearer key is static rather than a short-lived, scoped machine credential;
- rate limiting is process-local;
- project data uses `data/projects.json`, which is not durable on Vercel;
- there is no audit log or per-action approval policy.

Before production agent access, replace these components with a server-side durable
store, scoped credentials, distributed rate limits, idempotency, audit events, and an
explicit allowlist of Pinterest actions. Do not give an agent browser cookies, an app
secret, or a Pinterest access token.

## Current endpoints

| Route | Purpose |
| --- | --- |
| `POST /api/agent/search` | Rank connected-board references for a project brief |
| `GET /api/agent/projects` | List local research projects |
| `POST /api/agent/projects` | Create a local research project |
| `POST /api/agent/references` | Save a reference to a local collection |
| `DELETE /api/agent/references` | Remove a local reference |

Request and response schemas are implemented in the corresponding handlers under
`src/app/api/agent/`. Treat them as unstable until the durable storage and
authorization redesign is complete.

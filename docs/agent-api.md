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
- the agent key has no granular per-action scope or approval policy;
- write idempotency is limited to database uniqueness constraints.

Before production agent access, add scoped short-lived credentials, explicit
per-action approval, and stronger idempotency semantics. Durable Supabase storage,
distributed rate limits, and audit events are already in place. Do not give an agent browser cookies, an app
secret, or a Pinterest access token.

## Current endpoints

| Route | Purpose |
| --- | --- |
| `POST /api/agent/search` | Rank connected-board references for a project brief |
| `GET /api/agent/projects` | List owner-scoped research projects |
| `POST /api/agent/projects` | Create an owner-scoped research project |
| `POST /api/agent/references` | Save a reference to a Supabase collection |
| `DELETE /api/agent/references` | Remove a saved reference |

Request and response schemas are implemented in the corresponding handlers under
`src/app/api/agent/`. Treat them as unstable until the durable storage and
authorization redesign is complete.

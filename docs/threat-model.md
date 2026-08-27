# Threat model

## Assets

Pinterest credentials and OAuth tokens, Auth.js sessions, Supabase credentials, owner
identity, rate-limit state, and maintenance endpoints.

## Trust boundaries

| Boundary | Control |
| --- | --- |
| Public visitor -> catalog | Sanitized server-side projection; public Pinterest Boards only |
| Public visitor -> private route | Public mode returns 404 |
| Browser -> admin | GitHub session plus numeric owner-ID allowlist |
| Admin -> Pinterest | OAuth state validation, exact redirect URI, read-only scopes |
| Browser -> OAuth storage | Opaque HTTP-only cookie; encrypted tokens stay server-side |
| Requests -> mutable API | Repeated owner authorization, validation, no-store, rate limiting |
| App -> Supabase | Server-only secret, owner scoping, RLS, audit events |

## Primary risks and mitigations

- Credential leakage: secrets are environment-only and excluded from response payloads.
- Unauthorized management: fail-closed mode plus immutable GitHub owner ID.
- CSRF/OAuth substitution: random expiring state cookie and exact callback validation.
- Public overexposure: explicit field validation excludes owner ID, sessions, tokens,
  audit events, and all non-public Boards.
- Content misuse: original Pinterest attribution and links are preserved; media is not copied.
- Abuse: distributed request limiting and owner-only mutation routes.
- Stale Pinterest content: no-store retrieval keeps Pinterest as the current authoritative source.

The application currently has no public accounts, AI runtime, Agent API, or Pinterest write actions.

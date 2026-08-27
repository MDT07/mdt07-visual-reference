# Security threat model

## Assets

- Pinterest App Secret and OAuth tokens
- Auth.js session and GitHub owner identity
- Owner project briefs and future owned assets
- Agent credentials and approval records
- Pinterest API quota and Standard access standing

## Trust boundaries

1. Public browser to public Vercel project
2. Owner browser to private Vercel project
3. Private server to GitHub OAuth
4. Private server to Pinterest OAuth/API
5. Private server to Supabase database, token vault, and rate-limit storage

## Primary threats and controls

| Threat | Control |
| --- | --- |
| Public user starts Pinterest OAuth | Public mode returns 404; studio requires owner app-session |
| OAuth login CSRF or callback replay | Random state, HTTP-only state cookie, owner session, short expiry |
| CSRF on disconnect/refresh | Owner session, SameSite cookie, mandatory matching Origin |
| Token exposure | Server-only modules, encrypted Supabase vault, opaque HTTP-only cookie, redacted errors/logs |
| Catalog text leaks through AI | Exact preview, fingerprint confirmation, app-owned field allowlist, no Pinterest fields, server-only API key, `store=false` |
| Prompt injection in owner notes | Notes treated as untrusted data, fixed developer instructions, structured output, no model tools |
| AI performs an external action | No tools, no Pinterest write scopes, output saved only as a separate read-only report |
| Preview deployment leaks production secret | Separate Vercel projects and environment targeting |
| Cross-instance abuse | Atomic distributed rate limiter in Supabase |
| Unauthorized role escalation | Immutable GitHub ID allowlist; no role mutation endpoint |
| Agent key abuse | Production-disabled; local opt-in additionally requires owner session and bearer key |
| Pinterest policy violation | Live no-store responses, attribution, no external AI processing or hidden writes |

## Residual risks before private production

- Credentials have not yet been rotated at the owner's instruction.

The owner has accepted these risks temporarily for the working private Studio. They
block expansion beyond the single-owner model.

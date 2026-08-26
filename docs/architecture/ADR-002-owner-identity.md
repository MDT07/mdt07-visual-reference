# ADR-002: Owner identity and authorization

Status: Accepted for the owner-only milestone

## Decision

Authenticate the private studio with Auth.js and GitHub OAuth. Authorize only the
immutable GitHub numeric ID configured in `OWNER_GITHUB_ID`. The MDT07 account ID
is `172265857`, but deployments must set it explicitly rather than relying on a
hard-coded application default.

The only initial role is `OWNER`. Public registration, password storage, and role
promotion endpoints are out of scope.

## Enforcement

- `proxy.ts` performs an optimistic page check.
- Every private route handler performs a secure server-side authorization check.
- Pinterest OAuth start and callback require the existing owner application
  session in addition to Pinterest state validation.
- Role and GitHub ID are derived from the trusted OAuth profile, never request
  parameters or browser-managed application state.

## Future

Invite-only access may add `PENDING`, `APPROVED`, `SUSPENDED`, and `REVOKED` after
a database-backed authorization model is implemented.

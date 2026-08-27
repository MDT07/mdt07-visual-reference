# ADR-001: Public catalog and private administration deployments

Status: Accepted

## Decision

Run the same Next.js repository as two Vercel deployments:

- `APP_MODE=public` serves the website, legal pages, public Boards, and sanitized
  Pin metadata. It does not enable Auth.js or Pinterest routes.
- `APP_MODE=admin` serves owner authentication, Pinterest OAuth/API, catalog
  mutations, export, maintenance, and audit controls.

Unknown mode values resolve to `public`. Owner-only pages and APIs fail closed outside
admin mode. The public server reads only the sanitized `/api/public/boards` endpoint
from the private backend and has no Supabase credential.

## Consequences

The public and private hosts require separate environment configuration. Pinterest and
Auth.js credentials exist only on the private host. A private-host rename requires
coordinated GitHub OAuth and Pinterest redirect URI updates.

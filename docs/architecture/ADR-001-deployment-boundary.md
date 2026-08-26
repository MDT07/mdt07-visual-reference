# ADR-001: Public website and private studio deployments

Status: Accepted

## Decision

Use two Vercel projects connected to the same Git repository.

- `APP_MODE=public` serves the public product and legal pages. It must not receive
  Pinterest, Auth.js, database, or agent credentials. Private routes return 404.
- `APP_MODE=studio` serves the owner workspace, owner control surface, Auth.js,
  Pinterest OAuth, and protected APIs.

`PUBLIC_SITE_URL` is the canonical public website. `APP_URL` is the current
deployment origin and is used for same-origin checks and private redirects.

## Why

The public Pinterest review website must remain accessible while connected
credentials and tools need an independent owner-only security boundary. Keeping
one repository preserves reuse without sharing environment configuration.

## Consequences

- The private production URL must be known before registering its exact Pinterest
  redirect URI.
- Preview deployments must not inherit production credentials.
- Public and private deployments require separate smoke tests.

# ADR-003: Data classification

Status: Accepted

## Public

- application and legal copy;
- active project and collection names/descriptions;
- non-archived Pin title, description, remote image URL, attribution username, and
  original Pinterest URL.

## Private app data

- project briefs, notes, tags, favorite and workflow state;
- numeric GitHub owner identifier;
- audit and rate-limit records.

## Secrets

- Pinterest App Secret, access tokens, and refresh tokens;
- Auth.js and GitHub OAuth secrets;
- Supabase secret key and Pinterest session encryption material.

Secrets remain server-only. OAuth tokens are encrypted before database storage. The
public catalog projection explicitly selects and validates publishable fields and never
serializes private app data or secrets.

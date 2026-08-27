# ADR-003: Data classification

Status: Accepted

## Public

- application and legal copy;
- public Pinterest Board names, descriptions, cover media and Pin counts;
- public Pin title, description, remote image URL, attribution username, and
  original Pinterest URL.

## Private app data

- numeric GitHub owner identifier;
- audit and rate-limit records.

## Secrets

- Pinterest App Secret, access tokens, and refresh tokens;
- Auth.js and GitHub OAuth secrets;
- Supabase secret key and Pinterest session encryption material.

Secrets remain server-only. OAuth tokens are encrypted before database storage. The
public catalog projection explicitly selects and validates publishable fields and never
serializes private app data or secrets.

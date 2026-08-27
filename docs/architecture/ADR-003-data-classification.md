# ADR-003: Data classification and retention

Status: Accepted

| Class | Examples | Storage rule |
| --- | --- | --- |
| Secret | App secret, OAuth tokens, Auth secret | Private server environment or encrypted token vault only |
| Owner identity | GitHub ID, role, application session | Minimum necessary retention |
| App-owned | Project brief, collections, notes, tags, favorites, workflow status | May be persisted with deletion and export controls |
| Pinterest API | Boards, Pins, media URLs, source metadata | Live `no-store`; do not persist without express permission |
| AI outbound | Explicitly previewed allowlist of app-owned fields | One confirmed server request, `store=false`; never persist the raw payload |
| AI derived | Structured report, usage counts, input fingerprint | Owner-only Supabase record; deleted by project cascade |
| Security | Denials, rate limits, audit event metadata | Redacted, bounded retention |

The browser must never receive the Pinterest App Secret or any plaintext token in
JavaScript-accessible state. The browser stores only an opaque, HTTP-only Pinterest
session identifier; tokens are encrypted in Supabase. API responses remain non-cacheable and Pinterest media is
loaded from its original source without creating an application copy.

The browser cookie holds only an application session identifier. Pinterest tokens are
encrypted server-side and bound to
the authenticated owner.

Expired Pinterest connection records and stale distributed rate-limit buckets can be
removed through the owner-only maintenance endpoint. This cleanup never deletes
projects, collections, saved references, or owner-authored annotations. Audit event
payloads are limited to action metadata and must not contain credentials or plaintext
tokens.

AI execution is available only in the owner-authenticated Studio. The server rebuilds
the allowlisted payload after confirmation and rejects it if its SHA-256 fingerprint
no longer matches the reviewed preview. AI reports are separate derived records and
cannot mutate the catalog or initiate Pinterest actions.

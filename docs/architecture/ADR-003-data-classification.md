# ADR-003: Data classification and retention

Status: Accepted

| Class | Examples | Storage rule |
| --- | --- | --- |
| Secret | App secret, OAuth tokens, Auth secret | Private server environment or encrypted token vault only |
| Owner identity | GitHub ID, role, application session | Minimum necessary retention |
| App-owned | Project brief, owner notes, owned assets | May be persisted with deletion controls |
| Pinterest API | Boards, Pins, media URLs, source metadata | Live `no-store`; do not persist without express permission |
| Security | Denials, rate limits, audit event metadata | Redacted, bounded retention |

The browser must never receive the Pinterest App Secret or any plaintext token in
JavaScript-accessible state. The current browser stores only an encrypted, HTTP-only
Pinterest session cookie. API responses remain non-cacheable and Pinterest media is
loaded from its original source without creating an application copy.

When PostgreSQL is introduced, the browser cookie will hold only an application
session identifier. Pinterest tokens will be encrypted server-side and bound to
the authenticated owner.

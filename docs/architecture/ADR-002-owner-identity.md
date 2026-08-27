# ADR-002: Owner identity

Status: Accepted

The private administration area uses Auth.js with GitHub OAuth. Authorization succeeds
only when the immutable numeric GitHub identifier matches `OWNER_GITHUB_ID` and the
session role is `OWNER`. Email, login name, and display name are not authorization keys.

All owner APIs repeat the server-side check. Public mode returns 404 before evaluating a
session. Missing authentication configuration fails closed.

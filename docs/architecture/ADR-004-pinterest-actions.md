# ADR-004: Pinterest data and action boundary

Status: Accepted

- Request only `boards:read` and `pins:read`.
- Fetch public Boards and Pins only for the authenticated owner.
- Persist only references the owner explicitly saves.
- Publish only sanitized active catalog records with Pinterest attribution and links.
- Do not copy Pinterest media binaries into application storage.
- Do not scrape, train models on Pinterest material, call external AI providers, or
  perform Pinterest write actions.

Any future write integration requires separate product design, explicit owner
confirmation, updated scopes, security review, and updated public legal pages before deployment.

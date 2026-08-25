# ADR-004: Pinterest data and action boundary

Status: Accepted

## Current boundary

- Request only `boards:read` and `pins:read`.
- Fetch boards and Pins live for the authenticated owner.
- Keep the moodboard in the open page only.
- Preserve Pinterest attribution and original Pin links.
- Do not scrape, train models on Pinterest material, or send API content to an
  external AI provider.

## Future write boundary

`boards:write` and `pins:write` may be requested only after the matching UI exists.
Every create/save operation requires a specific owner preview and confirmation.
Agents may propose an action but cannot execute it without a short-lived approval.

Material data-practice changes require updated public Privacy Policy and Terms
before production deployment.

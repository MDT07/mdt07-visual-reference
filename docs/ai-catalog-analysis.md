# Owner-controlled AI catalog analysis

## Purpose

The first AI layer generates a structured visual-research report from app-owned
catalog fields. It does not analyze Pinterest media, browse Pinterest, call tools,
change projects, or perform Pinterest write actions.

## Data boundary

Allowed outbound fields:

- project name, brief, and active/archive status;
- collection name and owner-authored description;
- owner-authored notes and tags;
- favorite and reference workflow status;
- aggregate counts and anonymous per-collection ordinals.

Explicitly excluded:

- Pinterest images, video, Pin titles, Pin descriptions, and source URLs;
- Pinterest usernames, board IDs, Pin IDs, and account information;
- GitHub identity data, email, browser/session identifiers;
- OAuth tokens, application secrets, and Supabase credentials.

The payload builder has tests that fail if known Pinterest fields cross the boundary.

## Confirmation sequence

```text
Owner selects collections
  -> server builds allowlisted payload
  -> Studio displays exact JSON + SHA-256 fingerprint
  -> owner confirms this one payload
  -> server rebuilds payload and compares a payload/provider/model/prompt fingerprint
  -> OpenRouter Chat Completions API, ZDR routing, structured output, no tools
  -> separate read-only report saved to Supabase
  -> redacted audit event
```

If catalog data changes between preview and execution, the fingerprints differ and
the request is rejected. Changing the provider, model, or prompt version also invalidates
the confirmation. Preparing a preview never calls OpenRouter.

## OpenRouter configuration

Set these only on the private Studio deployment:

```bash
AI_CATALOG_ENABLED=true
OPENROUTER_API_KEY=<server-side-key>
OPENROUTER_MODEL=z-ai/glm-5.2:free
AI_CATALOG_MAX_REFERENCES=50
```

The public deployment must not contain `OPENROUTER_API_KEY`. The implementation uses
the OpenAI-compatible Chat Completions endpoint, strict JSON Schema output, and no
tools. Each request sets `provider.zdr=true`, `provider.data_collection=deny`, and
`provider.require_parameters=true`. This limits routing to zero-data-retention
endpoints that do not collect request data and support the requested structured output;
the request fails if no compatible endpoint is available. The dedicated key also has
an OpenRouter guardrail with a daily spending cap, prompt-injection blocking, and
sensitive-information blocking.

The default is a currently compatible free, ZDR-capable chat endpoint. It is suitable
for an owner-only prototype, not a reliability SLA: free-model availability, latency,
supported parameters, and rate limits can change. A different reviewed model can later
replace it through `OPENROUTER_MODEL` without changing code.

## Stored data

`mdt07_ai_analyses` stores the structured report, model, prompt version, token usage,
payload fingerprint, and aggregate scope counts. It does not duplicate the raw
preview payload. OpenRouter retains request metadata such as token counts and latency;
prompt/response logging is not enabled. Routed providers receive the request only under
the required zero-data-retention and no-data-collection policy. Row-level security is
enabled and only the server secret role is granted table access.

## Deliberate non-goals

- no image or vision analysis;
- no embeddings or vector database;
- no web search, file search, MCP, browser, shell, or function tools;
- no automatic tags, favorites, status changes, saves, deletes, or Pinterest writes;
- no access for public visitors or general registered users.

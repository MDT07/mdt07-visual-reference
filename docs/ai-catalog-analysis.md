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
  -> server rebuilds payload and compares fingerprint
  -> OpenAI Responses API, store=false, structured output, no tools
  -> separate read-only report saved to Supabase
  -> redacted audit event
```

If catalog data changes between preview and execution, the fingerprints differ and
the request is rejected. Preparing a preview never calls OpenAI.

## OpenAI configuration

Set these only on the private Studio deployment:

```bash
AI_CATALOG_ENABLED=true
OPENAI_API_KEY=<server-side-project-key>
OPENAI_MODEL=gpt-5.4-mini
AI_CATALOG_MAX_REFERENCES=50
```

The public deployment must not contain `OPENAI_API_KEY`. The implementation uses the
Responses API, strict JSON Schema output, `store=false`, low reasoning effort, no
tools, and a hashed safety identifier. OpenAI states that API data is not used for
training by default. Standard abuse-monitoring retention may still be up to 30 days
unless the API project has approved Zero Data Retention or Modified Abuse Monitoring.

## Stored data

`mdt07_ai_analyses` stores the structured report, model, prompt version, token usage,
payload fingerprint, and aggregate scope counts. It does not duplicate the raw
preview payload. Row-level security is enabled and only the server secret role is
granted table access.

## Deliberate non-goals

- no image or vision analysis;
- no embeddings or vector database;
- no web search, file search, MCP, browser, shell, or function tools;
- no automatic tags, favorites, status changes, saves, deletes, or Pinterest writes;
- no access for public visitors or general registered users.

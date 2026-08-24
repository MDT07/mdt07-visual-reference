# AI Agent API

Machine-readable endpoints for Claude Code, Codex, Kimi, Cursor, and other AI coding agents.

## Authentication

The Agent API is a developer-only feature and is disabled by default. To enable it
for a controlled local or private environment, set:

```bash
AGENT_API_ENABLED=true
AGENT_API_KEY=<strong-random-value>
```

Every request must include the server-side key:

```http
Authorization: Bearer <AGENT_API_KEY>
```

Pinterest search additionally requires an active Pinterest OAuth session. The user
must first click **Connect Pinterest** in the UI; that session remains in an
HTTP-only cookie.

Keep the Agent API disabled on the public Pinterest review deployment. The local
JSON project store is not suitable for Vercel production and must not be used to
persist Pinterest API content there.

## POST /api/agent/search

Find and rank visual references for a design brief.

### Request

```json
{
  "prompt": "luxury fashion ecommerce with editorial art direction",
  "mode": "premium",
  "limit": 20
}
```

`mode` is optional and can be `inspiration`, `precision`, `premium`, or `experimental`.

### Response

```json
{
  "brief": {
    "raw": "luxury fashion ecommerce with editorial art direction",
    "industry": "fashion",
    "style": ["editorial", "luxury"],
    "mood": [],
    "colors": [],
    "typography": [],
    "layout": [],
    "quality": "premium",
    "quantity": 20
  },
  "strategies": [
    { "query": "fashion ecommerce website design", "weight": 1, "intent": "primary" }
  ],
  "candidates": 87,
  "duplicatesRemoved": 12,
  "results": [
    {
      "id": "pinterest:123456789",
      "source": "pinterest",
      "sourceId": "123456789",
      "sourceUrl": "https://www.pinterest.com/pin/123456789/",
      "title": "Editorial fashion website",
      "imageUrl": "https://i.pinimg.com/...",
      "relevanceScore": 0.82,
      "qualityScore": 0.75,
      "finalScore": 0.79,
      "fetchedAt": "2026-08-23T18:00:00.000Z"
    }
  ]
}
```

## GET /api/agent/projects

List saved research projects.

```json
{
  "projects": [
    {
      "id": "...",
      "name": "Luxury Fashion Website",
      "brief": "...",
      "collections": []
    }
  ]
}
```

## POST /api/agent/projects

Create a research project.

```json
{
  "name": "Luxury Fashion Website",
  "brief": "Editorial ecommerce for high-end fashion brand"
}
```

## POST /api/agent/references

Save a reference into a project collection. The collection is created automatically if it does not exist.

```json
{
  "projectId": "...",
  "collection": "Hero References",
  "reference": {
    "id": "pinterest:123456789",
    "source": "pinterest",
    "sourceId": "123456789",
    "sourceUrl": "https://www.pinterest.com/pin/123456789/",
    "imageUrl": "https://i.pinimg.com/...",
    "fetchedAt": "2026-08-23T18:00:00.000Z"
  }
}
```

## DELETE /api/agent/references

Remove a reference from a collection.

```json
{
  "projectId": "...",
  "collection": "Hero References",
  "referenceId": "pinterest:123456789"
}
```

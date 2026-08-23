# AI Agent API

Machine-readable endpoints for Claude Code, Codex, Kimi, Cursor, and other AI coding agents.

## Authentication

All agent endpoints require an active Pinterest OAuth session. The user must first click **Connect Pinterest** in the UI. The session is stored in an HTTP-only cookie.

For server-to-server use, call the endpoints from the same browser session or extend authentication later.

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

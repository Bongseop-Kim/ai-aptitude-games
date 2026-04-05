# API Contract — Assessment Run Submission + Score Retrieval

This document specifies the minimal REST contract between the client app and the backend service for submitting an assessment run and retrieving its scored result. It covers all fields currently emitted by the app.

## Base URL

`/api/v1`

## Authentication

Assessment result APIs require a Bearer access token issued by the auth backend.

- Header: `Authorization: Bearer <accessToken>`
- Scope: project/company scoped token bound to the signed-in user (`serverUserId`)
- Missing/invalid/expired token: `401 Unauthorized`
- Insufficient permission: `403 Forbidden`

Request example:

```
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
```

## Resources

### Submit session result

- Method: `POST`
- Path: `/assessments/sessions/{sessionId}/results`
- Body (application/json):

```
{
  "sessionId": "string",            // UUID/slug used consistently in telemetry
  "userId": "string",               // optional if resolved server-side
  "gameKey": "nback|gonogo|rotation|rps|promise|numbers|potion|stroop|taskswitch|arith|sequence|vsearch",
  "difficultyTier": "easy|normal|hard",
  "scoring": {
    "readinessScore": number,        // 0..100 normalized (one decimal max)
    "accuracy": number,              // 0..1
    "completionRate": number,        // 0..1
    "speedScore": number,            // 0..1
    "answeredCount": number,         // integer
    "correctCount": number,          // integer
    "totalQuestions": number         // integer
  },
  "events": [                        // optional, compact ordered trace
    {
      "eventId": "string",
      "event": "assessment.<gameKey>.<eventType>",
      "timestamp": "ISO-8601",
      "blockIndex": number,
      "trialIndex": number|null,
      "latencyMs": number|null,
      "isCorrect": boolean|null,
      "payload": object|null
    }
  ]
}
```

- Responses:
  - `201 Created` `{ "resultId": "uuid", "sessionId": "..." }`
  - `400 Bad Request` (schema/validation error)
  - `401 Unauthorized` (missing/invalid/expired token)
  - `403 Forbidden` (token scope does not allow write)
  - `404 Not Found` (unknown `sessionId`)
  - `409 Conflict` (result already submitted for `sessionId`)
  - `429 Too Many Requests` (rate limited)
  - `5xx` (transient backend/server failure)

### Get session result

- Method: `GET`
- Path: `/assessments/sessions/{sessionId}/results`
- Responses:
  - `200 OK`
  - `401 Unauthorized` (missing/invalid/expired token)
  - `403 Forbidden` (token scope does not allow read)
  - `404 Not Found` (no result for `sessionId`)
  - `429 Too Many Requests` (rate limited)
  - `5xx` (transient backend/server failure)

```
{
  "sessionId": "string",
  "userId": "string",
  "gameKey": "...",
  "difficultyTier": "...",
  "scoring": { "readinessScore": number, "accuracy": number, "completionRate": number, "speedScore": number, "answeredCount": number, "correctCount": number, "totalQuestions": number },
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## Notes

- The client persists a full telemetry trace locally (SQLite) and can attach it to the submission for auditability; the backend may choose to store only aggregate metrics.
- `answeredCount` is part of the `scoring` object (not top-level) and the client UI reads it from `payload.scoring.answeredCount` when rendering results.

## Error Code Table

Error responses should use a stable code in the body so the app can map backend failures to UX branches.

```
{
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "Access token is expired.",
    "requestId": "optional-trace-id"
  }
}
```

| HTTP | `error.code`              | Meaning                                    | Client handling |
|------|---------------------------|--------------------------------------------|-----------------|
| 400  | `VALIDATION_ERROR`        | Request body/path/query does not match schema | Show generic validation failure and stop retry |
| 401  | `AUTH_INVALID_CREDENTIALS`| Invalid sign-in credentials                 | Map to `invalid_credentials` |
| 401  | `AUTH_INVALID_TOKEN`      | Access token missing/invalid/expired        | Trigger refresh flow, then retry once |
| 403  | `AUTH_FORBIDDEN`          | Authenticated but not allowed by scope/role | Show permission error, no retry |
| 404  | `SESSION_NOT_FOUND`       | Session or result does not exist            | Show not-found state, no retry |
| 409  | `RESULT_ALREADY_SUBMITTED`| Duplicate submit for same `sessionId`       | Treat as idempotent completion |
| 429  | `RATE_LIMITED`            | Rate limit exceeded                         | Backoff and retry later |
| 500+ | `INTERNAL_ERROR`          | Backend transient/server error              | Retry with exponential backoff (max 2) |

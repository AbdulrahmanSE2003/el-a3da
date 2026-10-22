# Player feedback

**Status: implemented end to end.** Players submit feedback on `/feedback` with
optional screenshots, and the single admin reviews it read-only in
`/admin/feedback`. Screenshots live in the private Neon `feedbacks` bucket.

## User flow

1. `/feedback` (`app/feedback/page.tsx`) renders `FeedbackForm`.
2. The form collects: type (general / bug / suggestion / question issue),
   message (10–4000 chars), optional rating 1–5, optional contact, optional
   content set + question external id, and up to 3 screenshots (PNG/JPG/WebP,
   ≤5 MB each). A hidden honeypot field catches naive bots.
3. `POST /api/feedback` validates everything server-side. With no files it
   inserts the row and returns. With files it returns a signed token plus
   presigned `PUT` URLs (10-minute expiry).
4. The browser uploads each image directly to Neon Storage (bucket CORS allows
   `PUT`), then calls `POST /api/feedback/complete` with the token.
5. The server re-verifies the token, `HEAD`s each object to confirm size and
   content type, then writes `feedback` + `feedback_attachments` in one
   transaction. Retries are idempotent via `on conflict do nothing`.

## Why a token instead of trusting the client

The upload token is an HMAC-signed, 15-minute payload (signed with a
`feedback-upload-v1` derivation of `AUTH_SECRET`). It binds the feedback draft
to the exact object keys, content types, and byte sizes. The completion step
therefore only accepts objects the server itself authorized, at the size and
type it expected — an attacker can't attach arbitrary bucket objects to a row.

## Admin flow (read-only)

- `/admin/feedback` (`features/admin/server/feedback-queries.ts`) lists rows with
  20-per-page pagination, search, and type/status filters, plus status counts.
- `features/admin/feedback/FeedbackDetailDialog.tsx` shows the full message,
  metadata, and screenshots.
- Screenshots are **not** served from the bucket directly. The browser requests
  `/api/admin/feedback/attachments/[id]`, which runs `requireAdmin()`, looks up
  the row, signs a 5-minute download URL, and redirects with
  `Cache-Control: private, no-store`. Unauthenticated requests get `401`, unknown
  ids get `404`.
- Status is display-only right now; there is no admin write path yet.

## Storage configuration

Server-only env (see `.env.example`):

```
AWS_ENDPOINT_URL_S3=https://BRANCH_ID.storage.REGION.aws.neon.tech
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
FEEDBACK_BUCKET=feedbacks
```

- Create a branch-scoped credential with `storage:read` + `storage:write`
  (`neon credentials create --branch dev --scopes storage:read,storage:write`),
  or copy the S3 values from the Neon Console.
- The `feedbacks` bucket already exists on the dev branch and its CORS rules
  allow browser `PUT`. Re-check CORS if you recreate the bucket.
- Never point these values at `production` for local work.

`lib/server/neon-storage.ts` owns the S3 client. It sets
`requestChecksumCalculation: "WHEN_REQUIRED"`, which Neon Storage needs for
browser presigned `PUT`s.

## Guardrails

- Public routes use `isSameOrigin()` and an in-process rate limiter
  (`features/feedback/server/rate-limit.ts`) — a basic local safeguard, not a
  distributed limiter. Replace it with a shared store before multi-instance
  deploys.
- File validation happens on both sides; the server trusts neither the declared
  MIME type nor size until `HEAD` confirms them.
- All SQL is parameterized. Admin reads call `requireAdmin()` inside the query
  layer, not just the page, so moving a page can't leak data.
- The public game pages still read `contents/*.ts`; feedback does not touch them.

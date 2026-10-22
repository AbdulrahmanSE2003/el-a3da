# Admin authentication

**Status: implemented for the single internal administrator.** The dashboard is
authenticated and supports creating questions, editing question fields,
soft-deleting questions, and reviewing player feedback (read-only). Publishing
and developer notes are still disabled. There is no `admin_users` table and no
player accounts. See `docs/admin-questions.md` for the question mutation rules
and `docs/feedback.md` for the feedback pipeline.

## Routes

| Route | Purpose |
| --- | --- |
| `GET /login` | Login page. Redirects to `/admin` when a valid session already exists. |
| `POST /api/admin/login` | Verifies credentials on the server and sets the signed session cookie. Accepts JSON or form data. |
| `POST /api/admin/logout` | Clears the session cookie and redirects to `/login` for form posts (JSON response for fetch clients). |
| `/admin/*` | Protected dashboard subtree. Unauthenticated page requests are redirected to `/login?next=...`. |

The login page and logout endpoint are intentionally public. Any other
`/api/admin/*` request is rejected by `proxy.ts` with `401` when there is no valid
session. There are currently no privileged `/api/admin/*` handlers; any future
handler must also call `requireAdmin()` from
`features/admin/server/auth.ts` and return `401` when it throws
`AdminAuthenticationError`.

Question mutations are Server Actions invoked from `/admin/questions`, not public
API routes. They are still reachable by direct POST, so each action calls
`requireAdmin()` independently.

## Environment variables

Configure these in `.env.local` (gitignored). `.env.example` contains safe
placeholders only.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon **dev** pooled connection string. Server-only. Never use the production branch locally. |
| `ADMIN_EMAIL` | The single administrator email. Compared case-insensitively after trimming. |
| `ADMIN_PASSWORD_HASH` | scrypt hash only. Never store the plaintext password in a tracked file. |
| `AUTH_SECRET` | At least 32 random bytes, used to sign the session cookie. Rotating it invalidates all sessions. |

Generate the values:

```sh
# AUTH_SECRET
openssl rand -base64 48

# ADMIN_PASSWORD_HASH — prompts without echoing, prints only the hash
printf 'New admin password: '
IFS= read -rs P
printf '\n'
printf '%s' "$P" | pnpm admin:password
unset P
```

The preferred hash format is colon-separated:

```text
scrypt:N=16384,r=8,p=1:<salt-base64url>:<hash-base64url>
```

Use the colon format in `.env.local`: Next.js expands `$VAR` sequences in env
files, so the older `$`-separated format can be corrupted unless it is escaped.
The verifier still accepts the legacy `$` format when it is passed literally.

The login route runs scrypt on every attempt, even when the email is wrong, so
the response timing does not reveal which field failed. Email comparison also
uses a fixed-length digest and `crypto.timingSafeEqual`.

A temporary local password was generated for first login and is stored only as a
comment in the gitignored `.env.local`. Rotate it with the command above before
sharing the machine or deploying. No plaintext password, actual hash, or secret is
committed to the repository.

## Session design

1. `POST /api/admin/login` validates `Origin`/`Sec-Fetch-Site`, parses JSON or form
   data, applies a basic per-IP rate limit, and verifies the credentials on the
   server.
2. On success it issues a stateless signed cookie named `qa3da_admin_session`:
   - Payload: `{ "sub": "admin", "iat": <unix>, "exp": <unix> }`
   - Encoding: `base64url(payload) + "." + base64url(HMAC-SHA256(AUTH_SECRET, payload))`
   - Flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production.
   - Expiry: 8 hours.
3. `proxy.ts` performs an optimistic redirect for unauthenticated `/admin/*`
   requests. The authoritative checks are the admin layout guard and the
   `requireAdmin()` call inside the database query helper.
4. The session verifier checks the HMAC with `crypto.timingSafeEqual`, validates
   the payload shape, rejects malformed/tampered cookies, and rejects expired or
   future-issued sessions. Invalid cookies are treated as unauthenticated without
   touching the database.
5. `POST /api/admin/logout` expires the cookie. A form post redirects to `/login`.
6. Redirects after login are restricted to the `/admin` subtree. Absolute URLs,
   protocol-relative URLs, backslashes, encoded separators, and traversal are
   rejected.

No database row is needed for the admin identity. If a second administrator is
ever required, add a dedicated table then — do not add one pre-emptively.

## Protection layers

- `proxy.ts`: optimistic page redirect for `/admin` and `/admin/*`, plus `401`
  responses for unauthenticated `/api/admin/*` requests (login/logout excluded).
- `app/(admin)/admin/layout.tsx`: server-side `requireAdminPage()` guard around the
  whole dashboard.
- `features/admin/server/queries.ts`: every SQL read calls `requireAdmin()` before
  `connection()`, so a page accidentally moved outside the admin layout still
  cannot read privileged data.
- `features/admin/server/question-actions.ts`: every question mutation action
  calls `requireAdmin()` before parsing input or touching the database.
- `features/admin/server/question-mutations.ts`: parameterized updates and
  soft deletes only; `external_id`, `position`, and `set_id` are not editable.
- `features/admin/server/db.ts`: the shared server-only Neon client.
- `features/admin/server/auth.ts`: the single module for session creation,
  destruction, page guards, and data guards.
- `features/admin/server/auth-core.ts`: pure Node auth primitives shared with the
  proxy (HMAC session token, scrypt verification, safe redirects).

## Rate limiting

`features/admin/server/login-rate-limit.ts` allows 10 failed attempts per IP per
10 minutes in the current server process. This is a basic local safeguard, not a
distributed production limiter. If the dashboard is deployed across multiple
instances, replace the in-memory map with a shared store (for example Redis or a
database-backed counter).

## Feedback and notes

Player feedback is now readable in `/admin/feedback` through a reviewed,
read-only query. The page lists type, message, rating, contact, set/question
reference, device info, and attachment count, with type/status/search filters and
20-per-page pagination. Screenshots are served through the authenticated
`/api/admin/feedback/attachments/[id]` proxy, which signs a short-lived Neon
Storage URL only after `requireAdmin()` passes — the private bucket is never
exposed directly.

`notes` remains hidden and still shows a "not enabled" state. Authentication
alone is not permission to expose internal notes; add a reviewed, read-only query
and consider data minimization before enabling it. See `docs/feedback.md` for the
full feedback design.

## Guardrails

- The dashboard and admin routes run on the server; `DATABASE_URL` never reaches
  client bundles.
- Use HTTPS in production so the `Secure` cookie is sent.
- There is no fallback password, default credential, or "dev bypass" flag. Missing
  configuration fails closed.
- Question writes are limited to updating the allowed fields and soft-deleting a
  row. Do not add question creation, hard deletes, restore UI, publish workflows,
  or full CRUD without validation and a reviewed UI.
- Never apply migrations or write data to the `production` Neon branch as part of
  normal development.

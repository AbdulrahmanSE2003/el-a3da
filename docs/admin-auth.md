# Admin authentication — design only (not implemented)

**Status: not implemented.** There is no login route, no session cookie, and no
server-side admin guard. `/admin` currently exposes **read-only public content**
only: content-set counts, question lists, and content health.

The `feedback` and `notes` pages are intentionally blocked. Both tables exist in
Neon, but they may contain player contact details or internal developer notes, so
they are not queried or rendered until authentication is implemented. There is
**one administrator**, so no `admin_users` table and no player accounts are
introduced.

## Current dashboard data access

| Item | Current state |
| --- | --- |
| `DATABASE_URL` | Required in `.env.local` (gitignored). Used only by `features/admin/server/queries.ts` with `import "server-only"`. |
| `AUTH_SECRET` | Not used yet. |
| `ADMIN_PASSWORD_HASH` | Not used yet. |
| Login route | Does not exist. |
| Session guard | Does not exist. |
| Writes from `/admin` | None. All queries are `SELECT` only. |
| Feedback / notes UI | Blocked with an explicit "authentication required" state. |

Do not bypass this by exposing feedback or notes through an unauthenticated
query. The smallest prerequisite for those sections and for any CRUD work is the
auth/session implementation described below.

## Required environment variables (when auth is implemented)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string. Server-only; never exposed to the client. |
| `AUTH_SECRET` | At least 32 random bytes, used to sign the admin session cookie. Rotating it invalidates all sessions. |
| `ADMIN_PASSWORD_HASH` | Password hash only. Never the plaintext password. |

Generate values:

```sh
# AUTH_SECRET
openssl rand -base64 48

# ADMIN_PASSWORD_HASH (Node, no extra dependency)
node -e 'const c=require("crypto");const s=c.randomBytes(16);const h=c.scryptSync(process.argv[1],s,64,{N:16384,r:8,p:1});console.log(`scrypt$N=16384,r=8,p=1$${s.toString("base64url")}$${h.toString("base64url")}`)' 'the-password'
```

The plaintext password must never be stored in the database, the repository, or an
environment file that is committed.

## Session design

1. `POST /api/admin/login` receives the password over HTTPS.
2. Recompute the scrypt hash with the stored salt/parameters and compare with
   `crypto.timingSafeEqual`. Reject on mismatch.
3. On success, issue a signed cookie:
   - Payload: `{ "sub": "admin", "iat": <unix>, "exp": <unix> }`
   - Encoding: `base64url(payload) + "." + base64url(HMAC-SHA256(AUTH_SECRET, payload))`
   - Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, TTL ~8 hours.
4. A server-side guard verifies the signature and expiry on every `/admin` request and
   every `/api/admin/*` handler. Reject invalid/expired cookies without touching the DB.
5. `POST /api/admin/logout` clears the cookie.
6. Rate-limit login attempts (per IP and globally) to slow brute force.

No database row is needed for the admin identity. If a second administrator is ever
required, add a dedicated table then — do not add one pre-emptively.

## Implementation checklist

1. Add the login/logout route handlers and the signed-cookie guard.
2. Gate the whole `/admin` subtree, including content pages, before adding any
   feedback/notes queries.
3. Connect `/admin/feedback` and `/admin/notes` only after the guard is active.
4. Add write operations (question editing, feedback review, notes) only after auth
   and CSRF/validation are in place. Until then, the dashboard stays read-only.

## Guardrails

- The dashboard and admin APIs must run on the server; `DATABASE_URL` never reaches
  client bundles.
- Use only HTTPS in production so the `Secure` cookie is sent.
- Do not add a fallback password or a "dev bypass" flag.
- Never apply migrations or write data to the `production` Neon branch as part of
  normal development.

# Qa3da · القعدة

A mobile-first, Arabic-first party platform for real gatherings. Qa3da turns a
phone into a shared hub for party games, conversation starters, challenges, and
reflective content — with no player accounts and no setup ceremony.

The app is installable as a PWA, keeps working offline after the first load, and
syncs content from Neon PostgreSQL without interrupting an active game session.

## Features

- **Three playable games**
  - **Amir El Zalam** — a social-deduction game with hidden roles and night/day
    rounds.
  - **Casino** — a host-led quiz game with teams, scoring, and a configurable
    winning score.
  - **Bomb** — a pass-and-play category game with a random timer, three bundled
    sound cues (round start, timer tick, explosion), and a mute control.
- **Content experiences** — topics, challenges, Sheikh El Hara, and Zad El Qa3da,
  plus managed content sets that are not yet linked to a dedicated page.
- **Offline-first content** — IndexedDB cache with bundled `contents/*.ts`
  fallbacks. A missing or failed sync never blocks the first render or an active
  session.
- **DB-driven content sets** — content sets and versions come from Neon. New
  sets are exposed by the public API and the admin dashboard without editing a
  hardcoded list of six names.
- **Admin dashboard** — authenticated question listing, search, filtering,
  creation, editing, soft deletion, content-health checks, and player-feedback
  triage.
- **Player feedback** — validated submissions with optional screenshots stored
  in a private Neon Object Storage bucket and served through authenticated,
  short-lived signed URLs.
- **Themes** — three themes (`cafe`, `original-green`, `night-blue`) applied
  before hydration to avoid a flash of the wrong theme.
- **Arabic-first UI** — RTL layout, focused visual identity, and mobile-first
  flows.

## Tech stack

| Layer          | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Framework      | Next.js `16.3.4` (App Router, Server Actions)                  |
| UI             | React `19.2.8`, TypeScript, Tailwind CSS v4, Radix UI          |
| Database       | Neon PostgreSQL via `@neondatabase/serverless`                 |
| Offline/PWA    | Serwist service worker, IndexedDB                              |
| Object storage | Neon Object Storage (S3-compatible) for feedback screenshots   |
| Data fetching  | Native `fetch` + a small client content-sync layer             |
| Testing        | Pure Node `tsx` scripts (no browser or test-runner dependency) |

## Requirements

- Node.js **20.9 or newer** (`engines` is enforced in `package.json`).
- **pnpm** (the repository includes `pnpm-lock.yaml`).
- A Neon **dev** branch for DB-backed content and the admin dashboard.
  Production must not be used for local development.

## Getting started

```sh
git clone https://github.com/AbdulrahmanSE2003/el-a3da.git
cd el-a3da
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

Without environment variables the public games still render from the bundled
content fallback. The admin dashboard, content-sync API, and feedback storage
require the variables below.

### Environment variables

| Variable                | Required             | Purpose                                                                                 |
| ----------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | For DB content/admin | Neon **dev** pooled connection string. Server-only.                                     |
| `ADMIN_EMAIL`           | For admin            | Single administrator email.                                                             |
| `ADMIN_PASSWORD_HASH`   | For admin            | scrypt hash, never a plaintext password.                                                |
| `AUTH_SECRET`           | For admin/feedback   | Random secret of at least 32 bytes. Rotating it invalidates sessions and upload tokens. |
| `AWS_ENDPOINT_URL_S3`   | For feedback images  | Neon Object Storage endpoint for the dev branch.                                        |
| `AWS_REGION`            | For feedback images  | Storage region, for example `eu-central-1`.                                             |
| `AWS_ACCESS_KEY_ID`     | For feedback images  | Branch-scoped storage credential.                                                       |
| `AWS_SECRET_ACCESS_KEY` | For feedback images  | Branch-scoped storage secret.                                                           |
| `FEEDBACK_BUCKET`       | For feedback images  | Private bucket name, default `feedbacks`.                                               |

Generate the admin credentials:

```sh
openssl rand -base64 48   # AUTH_SECRET

printf 'New admin password: '
IFS= read -rs P
printf '\n'
printf '%s' "$P" | pnpm admin:password
unset P
```

The full auth design and session format are documented in
[`docs/admin-auth.md`](docs/admin-auth.md).

### Database setup

The schema lives in `db/migrations/`. Apply the SQL files to a **fresh Neon dev
branch** and review them before running. Do not apply migrations or import
content into the production branch as part of normal development.

The historical bulk import for the original content sets was a one-off
operational step and is not committed as a reusable import command. The Bomb set
does have a safe, idempotent reconciliation script:

```sh
pnpm content:bomb            # read-only plan against the confirmed dev branch
pnpm content:bomb -- --apply # insert only missing Bomb rows
```

The script refuses to run outside the known dev branch, never updates or deletes
existing rows, and aborts on position collisions.

## Scripts

```sh
pnpm dev             # start the development server
pnpm build           # production build (webpack)
pnpm start           # start the production server
pnpm lint            # ESLint
pnpm typecheck       # TypeScript, no emit
pnpm format          # Prettier

pnpm test            # all pure Node test suites
pnpm test:bomb       # Bomb sounds + Bomb content wiring
pnpm test:casino     # Casino engine
pnpm test:registry   # Dynamic content sets and metadata fallbacks
pnpm content:test    # Content sync/cache lifecycle
pnpm content:verify:test # Content-verifier fixtures (no DB)
pnpm content:verify  # Read-only live check against Neon dev
pnpm content:ids     # Content ID helper
```

`content:verify` and `content:bomb` load `.env.local` and require a real Neon dev
connection. They are intentionally not part of the no-secret CI job.

## Architecture

```text
app/                  Next.js routes, public pages, API routes, admin routes
components/           Shared UI and layout components
features/             Domain modules (games, admin, feedback, marketing)
games/                Pure game engines and types
contents/             Bundled content used as the offline fallback
lib/content/          Client content provider, IndexedDB cache, sync, validation
lib/server/           Server-only Neon and storage access
db/migrations/        Schema and content-set metadata migrations
scripts/              Operational and test scripts
docs/                 Auth, content-sync, feedback, and schema documentation
```

### Content flow

1. A game page reads a **session snapshot** from `useContentSet(setId)`.
2. The snapshot initially uses the bundled `contents/*.ts` data, then resolves
   the IndexedDB cache once on mount before the game builds its deck.
3. In the background, the sync layer fetches `/api/content/versions` with
   `no-store`, downloads only changed or missing sets, validates each payload,
   and replaces cache records atomically.
4. Neon is authoritative. Admin changes bump `content_sets.version`; clients see
   the new snapshot in the next session.
5. The snapshot is immutable for the life of a session, so routine sync,
   network loss, or a failed payload never interrupts gameplay.

Adding a question, adding a content set, and adding a playable game are
deliberately different operations. Questions are created in
`/admin/questions`; a new set is a reviewed `content_sets` row plus its
questions and appears automatically in the API and dashboard; a new playable
game still requires an engine, route, and UI wiring. See
[`docs/admin-questions.md`](docs/admin-questions.md).

The full API and cache contract is documented in
[`docs/content-sync.md`](docs/content-sync.md).

### Bomb content

Bomb questions are stored in the `bomb` content set, with `category` constrained
to the engine's known categories. `contents/bomb.ts` remains the offline
fallback. The engine accepts an injected question snapshot, filters unknown
categories defensively, and keeps the existing timer, three-sound, mute,
duplicate-suppression, and cleanup behavior.

### Admin and feedback

- All `/admin/*` pages and reads require an authenticated admin session.
- Question mutations are Server Actions that call `requireAdmin()` before any
  read or write.
- Writes are parameterized; `external_id`, `position`, and `set_id` are not
  editable from the UI after creation.
- Deletion is soft delete (`deleted_at`), never `DELETE FROM questions`.
- Feedback status changes are protected server actions. Screenshots are never
  exposed directly from the private bucket.

See [`docs/admin-questions.md`](docs/admin-questions.md),
[`docs/admin-auth.md`](docs/admin-auth.md), and
[`docs/feedback.md`](docs/feedback.md) for the full rules.

## Quality checks

The repository has no browser E2E suite and no external test runner. The test
scripts are pure Node/`tsx` programs that assert game, cache, sync, verifier,
registry, and audio behavior. Run the same checks before opening a pull request:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

A GitHub Actions workflow is configured to run these no-secret checks on
pushes and pull requests. Database-backed checks (`content:verify`,
`content:bomb`) are manual because they require access to the Neon dev branch.

## Deployment

Qa3da is a standard Next.js application. Set the environment variables from
`.env.example` in your host, run `pnpm build`, and start the app with
`pnpm start`. Serve it over HTTPS in production so the admin session cookie is
sent with the `Secure` flag.

The repository does not include a provider-specific deployment configuration.
The PWA service worker is generated during the production build. Do not point a
deployment at the Neon production branch until the schema and content have been
reviewed and migrated deliberately.

## Limitations

- Players do not have accounts. The admin dashboard supports one administrator.
- Rate limiting for login and feedback is in-process. It is a basic safeguard,
  not a distributed limiter; replace it with a shared store for multi-instance
  deployments.
- The developer-notes page is intentionally disabled even though the `notes`
  table exists.
- There is no manual publish, rollback, restore, or hard-delete UI. Client content
  sync is automatic; soft-deleted questions disappear from new sessions after
  sync.
- The `punishments` content set is managed in Neon but is not linked to a
  dedicated game page yet.
- The original six content sets were imported by a one-off operational script
  that is not part of this repository. Only Bomb has a committed reconciliation
  script.
- The feedback set picker uses the known content-set metadata. A brand-new
  DB-only set is visible in the API and admin dashboard, but it does not appear
  in the feedback form until its metadata is added.
- README screenshots are intentionally omitted; no verified product screenshots
  are committed to `public/`.

## Contributing

1. Create a branch from `dev`.
2. Keep gameplay, sound, and theme behavior intact unless the change explicitly
   targets it.
3. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
4. Never commit secrets, `.env.local`, production connection strings, or
   generated storage credentials.
5. Do not run migrations, imports, or writes against the Neon production branch
   without explicit review and approval.
6. Open a pull request with the problem, the verified change, and the checks you
   ran. Do not claim a test, deployment, or release succeeded without evidence.

Use GitHub Issues for reproducible bugs and feature proposals.

## Changelog

Release notes and version history are in [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT — see [`LICENSE`](LICENSE). Copyright (c) 2026 Abdulrahman Saad.

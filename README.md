# Qa3da · القعدة

Qa3da is a mobile-first social entertainment platform built for real gatherings. It turns a phone into a shared hub for party games, conversation starters, quick challenges, and reflective content — with no accounts, no setup, and no friction.

## Why Qa3da

- **Ready in seconds.** Open the app, add players, and start. No sign-up and no complicated configuration.
- **Designed for groups.** Pass-and-play and shared-screen flows keep everyone involved instead of turning the gathering into a solo screen session.
- **Variety without complexity.** Party games, conversation prompts, challenges, and quieter reflective content live in one consistent experience.
- **Works when the connection does not.** The app is installable as a PWA and keeps content available locally after the first load.
- **Made for the room.** A mobile-first, Arabic-first interface with a focused visual identity and multiple themes.
- **Reliable content operations.** Local-first caching, controlled synchronization, and admin health tools keep the content fresh without making gameplay depend on the network.
- **Easy to extend.** Game engines, content, and interface concerns are separated so new experiences can be added without disturbing existing ones.

## The experience

Qa3da is designed around a simple idea: the best party app is the one that disappears into the gathering. Players can move from a competitive game to a conversation prompt or a quiet moment without changing apps or creating accounts. The content library is the product surface; the platform stays out of the way.

## Technology

| Area             | Stack                                               |
| ---------------- | --------------------------------------------------- |
| Application      | Next.js 16, React 19, TypeScript                    |
| Interface        | Tailwind CSS v4, custom theme system                |
| State            | Zustand with local persistence                      |
| Offline / PWA    | Serwist                                             |
| Content platform | Neon PostgreSQL with local-first synchronization    |
| Administration   | Protected admin dashboard and content health checks |

## Getting started

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional configuration

Database and admin features require a local `.env.local` file:

```bash
DATABASE_URL=postgresql://...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=scrypt:N=16384,r=8,p=1:<salt>:<hash>
AUTH_SECRET=<openssl rand -base64 48>
```

Generate an admin password hash:

```bash
printf 'New admin password: '
IFS= read -rs P
printf '\n'
printf '%s' "$P" | pnpm admin:password
unset P
```

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test:bomb
pnpm test:casino
pnpm content:test
pnpm content:verify:test
pnpm content:verify
pnpm build
```

## Documentation

- [`docs/content-sync.md`](docs/content-sync.md) — content synchronization and drift detection
- [`docs/admin-questions.md`](docs/admin-questions.md) — question administration
- [`docs/admin-auth.md`](docs/admin-auth.md) — admin authentication
- [`docs/feedback.md`](docs/feedback.md) — feedback workflow
- [`docs/neon-schema-plan.md`](docs/neon-schema-plan.md) — database schema plan

---

**Version 2.0.0** · Active development on the `dev` branch.

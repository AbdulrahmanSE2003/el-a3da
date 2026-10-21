# el-Qa3da

A social party game app in Arabic. Play with friends, host games, and start the fun — no accounts, no setup.

## Tech Stack

- **Framework**: Next.js 16.3.4
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS v4
- **State**: Zustand with persistence
- **PWA**: Serwist for offline support
- **Database**: Neon PostgreSQL (development branch), authenticated admin queries with question edit and soft delete

## Features

- **Players**: Add/remove players, persistent across sessions
- **Games**: 
  - *أمير الظلام* (Werewolf/Mafia) — deduction game with hidden roles
  - *كافيه الألعاب* (Casino) — quiz & challenge game, first to 10 points wins
  - *بكاسة* — coming soon
- **Topics**: Random conversation topics with shuffle
- **Challenges**: Quick prompts to spark discussion
- **Guides**: Detailed rules for each game mode
- **Admin console**: Single-admin login, content overview, server-paginated questions with edit/soft-delete, and content health checks

## Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The `/admin` pages read from Neon. Add the development branch connection string
to `.env.local` (gitignored, server-only):

```bash
DATABASE_URL=postgresql://...
```

Add the admin credentials and signing secret to the same file:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=scrypt:N=16384,r=8,p=1:<salt>:<hash>
AUTH_SECRET=<openssl rand -base64 48>
```

Generate the password hash without echoing the password:

```bash
printf 'New admin password: '
IFS= read -rs P
printf '\n'
printf '%s' "$P" | pnpm admin:password
unset P
```

Then open `/login`. Question edits are limited to text, category, and the
set-specific answer/badge fields; deletes are soft deletes. Creating questions,
publishing workflows, feedback, and developer notes remain hidden. The public
game pages still read from `contents/*.ts`, so admin changes affect Neon and
the dashboard until DB-backed content is wired. See `docs/admin-questions.md`,
`docs/neon-schema-plan.md`, and `docs/admin-auth.md`.

## PWA Install

The app is a Progressive Web App. Visit the site on Chrome/Android and click "Install" to add it to your home screen. Works offline thanks to Serwist.

## Changelog Summary

| Version | Changes |
|---------|---------|
| **1.0.0** | Initial commit — basic setup |
| **1.1.0** | Zad edition — added core features |
| **1.2.0** | El-Qa3da V1.1.0 — more pages |
| **1.3.0** | Finished Casino game + players system + topics + guides |
| **1.4.0** | Casino al-al3ab + download modal + about & download pages |
| **1.4.1** | Content ID cleanup, Neon dev import (3,181 records), read-only admin console |
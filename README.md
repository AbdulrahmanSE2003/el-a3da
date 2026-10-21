# el-Qa3da

A social party game app in Arabic. Play with friends, host games, and start the fun — no accounts, no setup.

## Tech Stack

- **Framework**: Next.js 16.3.4
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS v4
- **State**: Zustand with persistence
- **PWA**: Serwist for offline support
- **Database**: Neon PostgreSQL (development branch), read-only admin queries

## Features

- **Players**: Add/remove players, persistent across sessions
- **Games**: 
  - *أمير الظلام* (Werewolf/Mafia) — deduction game with hidden roles
  - *كافيه الألعاب* (Casino) — quiz & challenge game, first to 10 points wins
  - *بكاسة* — coming soon
- **Topics**: Random conversation topics with shuffle
- **Challenges**: Quick prompts to spark discussion
- **Guides**: Detailed rules for each game mode
- **Admin console**: Read-only content overview, server-paginated questions, and content health checks

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

Feedback and developer notes stay hidden until admin authentication is
implemented. See `docs/neon-schema-plan.md` and `docs/admin-auth.md`.

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
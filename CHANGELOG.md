# Changelog

All notable changes to Qa3da are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## [2.2.0] - Unreleased

### Added

- **Shared sound system** (`games/lib/audio/`) with a persisted sound-effects mute
  preference (`qa3da-sound-effects-muted`) and one-time migration from the legacy
  `qa3da-sound-muted` key.
- **Card flip sound** (`flipcard.wav`) on `Qa3daCard` reveal for Topics, Sheikh El
  Hara, and Challenges.
- **Casino victory sound** (`victory.ogg`) played once when a Casino game finishes.
- **Spinner sound** (`spin.wav`) played when the wheel spin starts and stopped when
  it finishes or the component unmounts.
- **Settings sound control** (`SoundSetting`) with a single "المؤثرات الصوتية"
  toggle, plus a `Switch` UI component.
- **Sound assets**: `flipcard.wav`, `victory.ogg`, `spin.wav`.

### Changed

- **Removed coffee ambience**: `ahwa_ambience.ogg`, `AmbienceSound` component, its
  layout mount, the ambience preference/localStorage key, and the ambience setting
  toggle.
- **Settings**: replaced the sound placeholder with a functional sound-effects toggle.
- **Header**: removed the ambiguous single sound quick-toggle button.

### Removed

- Coffee ambience feature (`ahwa_ambience.ogg`, `AmbienceSound`, ambience
  preference, Settings ambience toggle).

## [2.1.0] - 2026-10-23

### Added

- **Bomb game** with a random timer, pass-and-play category rounds, three bundled
  sound cues (round start, timer tick, explosion), mute control, duplicate-event
  suppression, and cleanup.
- **Bomb content set** stored in Neon and exposed through the public content API,
  with `contents/bomb.ts` kept as the offline fallback.
- **Safe Bomb reconciliation script** (`pnpm content:bomb`) that is dev-branch
  guarded, read-only by default, idempotent, and refuses to overwrite existing
  rows or collide with occupied positions.
- **Dynamic content-set registration**. Public APIs and the admin dashboard now
  discover content sets from Neon instead of a fixed six-ID allowlist. New sets
  receive safe fallback metadata, labels, and colors.
- **Content-registry tests** for dynamic identifiers, metadata fallbacks, Bomb
  category validation, and empty bundled snapshots.
- **CI workflow** for type checking, linting, pure Node test suites, and the
  no-secret production build.

### Changed

- Bomb now consumes the same immutable content snapshot as the other games. The
  engine accepts an injected question list, filters unknown categories
  defensively, and keeps active sessions stable during background sync.
- Admin question dialogs use a category datalist with existing categories and
  enforce the Bomb engine's category whitelist on both client and server.
- Admin content lists, health checks, versions, empty states, and set colors are
  DB-driven, with visible fallback rows for known sets that are missing from
  Neon.
- The admin overview now shows real open-feedback and notes-record counts instead
  of stale copy that implied those tables were unavailable.
- README and operational docs now describe the actual DB-driven architecture,
  setup, environment, scripts, limitations, and release checks.

### Fixed

- Creating a question no longer leaves the category empty when the old select
  showed a default value without updating the form state.
- Unknown content-set IDs no longer crash admin metadata lookups or produce
  misleading `casino` fallbacks in question rows.
- Missing bundled content for a DB-only set now resolves to a safe empty
  snapshot instead of throwing.

### Removed

- The obsolete Bomb warning sound asset and its event mapping. The three intended
  Bomb sounds remain.

## [2.0.0] - 2026

- New theme system with `cafe`, `original-green`, and `night-blue` palettes.
- Theme settings page with instant preview and pre-hydration application.
- Improved loading performance and Neon-backed content synchronization for
  offline play.

## [1.4.1] - 2025-10

- Content ID cleanup and development database synchronization.
- Read-only admin dashboard for system and content health.

## [1.4.0] - 2025-09-25

- Casino quiz game with teams, scoring, and a configurable winning score.

## [1.3.0] - 2025-09-20

- Party games and player management: Amir El Zalam, Sheikh El Hara, and Bekasa
  (in progress).

## [1.2.0] - 2025-09-17

- Usage guides and onboarding content.

## [1.1.0] - 2025-09-13

- Random rotation for topics and challenges on every gathering.

## [1.0.0] - 2025-09-10

- First Qa3da release: topics and challenges with no sign-up.

-- Qa3da — initial Neon/Postgres schema
-- Migration: 0001_init_schema
--
-- Forward-only and safe to re-run on an empty or already-migrated database.
-- Apply inside a transaction (psql --single-transaction, or the Neon MCP
-- run_sql_transaction tool). No BEGIN/COMMIT here so the caller owns the
-- transaction.
--
-- Design decisions:
--   * One unified `questions` table. Set-specific fields are nullable:
--     `correct_answer` (casino only), `badge_label` (zad only),
--     `category` (optional on zad, required by the other sets in source data).
--   * `external_id` is TEXT. Casino ids include suffixes like "1-2"; they must
--     never be cast to a numeric type.
--   * `position` preserves the exact source-file order (0-based). Display
--     order never uses `external_id`.
--   * Only soft deletion via `deleted_at`. There is intentionally no
--     `is_active` / `is_used` column.
--   * `content_sets.version` is a monotonic content token, bumped by a trigger
--     in the same transaction as any real question change.

create table if not exists content_sets (
  id         text primary key,
  name       text not null check (btrim(name) <> ''),
  version    bigint not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table content_sets is
  'One row per playable/administered content set (casino, topics, ...).';
comment on column content_sets.version is
  'Monotonic content version. Changes only inside the transaction that commits a real question change; clients compare equality, not order.';

create table if not exists questions (
  id             uuid primary key default gen_random_uuid(),
  set_id         text not null references content_sets (id) on delete restrict,
  external_id    text not null check (btrim(external_id) <> ''),
  position       integer not null check (position >= 0),
  text           text not null check (btrim(text) <> ''),
  category       text,
  correct_answer text,
  badge_label    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint questions_set_external_id_key unique (set_id, external_id),
  -- Deferred so a full reorder can update positions inside one transaction.
  constraint questions_set_position_key unique (set_id, position)
    deferrable initially deferred
);

comment on table questions is
  'All content items. Soft-deleted rows remain for traceability and id stability.';
comment on column questions.external_id is
  'Source id as written in contents/*.ts. TEXT, never numeric; may contain "-2" suffixes.';
comment on column questions.position is
  '0-based order inside the set, taken from the source file. Authoritative display order.';

create index if not exists questions_live_position_idx
  on questions (set_id, position)
  where deleted_at is null;

create index if not exists questions_category_idx
  on questions (set_id, category);

create index if not exists questions_deleted_at_idx
  on questions (deleted_at)
  where deleted_at is not null;

create table if not exists feedback (
  id                   uuid primary key default gen_random_uuid(),
  type                 text not null default 'general'
                         check (type in ('bug', 'suggestion', 'question_issue', 'general')),
  status               text not null default 'open'
                         check (status in ('open', 'reviewed', 'done')),
  priority             text check (priority in ('low', 'medium', 'high')),
  message              text not null check (btrim(message) <> ''),
  rating               smallint check (rating between 1 and 5),
  contact              text,
  set_id               text references content_sets (id) on delete set null,
  question_external_id text,
  app_version          text,
  device_info          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  reviewed_at          timestamptz,
  reviewed_by          text
);

comment on table feedback is
  'User feedback. set_id/question_external_id are optional loose references: feedback may point at a question that is soft-deleted or no longer present.';

create index if not exists feedback_status_created_idx
  on feedback (status, created_at desc);

create index if not exists feedback_set_id_idx
  on feedback (set_id);

-- Attachment metadata only. Files live in a PRIVATE object-storage bucket
-- (e.g. Cloudflare R2 / S3); this table stores the object key, never a URL.
create table if not exists feedback_attachments (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedback (id) on delete cascade,
  storage_key text not null unique check (btrim(storage_key) <> ''),
  mime_type   text not null
                check (mime_type in ('image/png', 'image/jpeg', 'image/webp')),
  size_bytes  bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  width       integer check (width > 0),
  height      integer check (height > 0),
  created_at  timestamptz not null default now()
);

comment on table feedback_attachments is
  'Metadata for private-bucket objects. Access is granted through short-lived signed URLs, never public URLs.';

create index if not exists feedback_attachments_feedback_id_idx
  on feedback_attachments (feedback_id);

create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (btrim(title) <> ''),
  body       text not null default '',
  type       text not null default 'task'
               check (type in ('task', 'bug', 'improvement', 'reminder')),
  priority   text not null default 'medium'
               check (priority in ('low', 'medium', 'high')),
  status     text not null default 'todo'
               check (status in ('todo', 'in_progress', 'done')),
  set_id     text references content_sets (id) on delete set null,
  due_date   date,
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_status_due_date_idx
  on notes (status, due_date);

create index if not exists notes_set_id_idx
  on notes (set_id);

-- --------------------------------------------------------------------------
-- updated_at maintenance
-- --------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_sets_set_updated_at on content_sets;
create trigger content_sets_set_updated_at
  before update on content_sets
  for each row execute function set_updated_at();

drop trigger if exists questions_set_updated_at on questions;
create trigger questions_set_updated_at
  before update on questions
  for each row execute function set_updated_at();

drop trigger if exists feedback_set_updated_at on feedback;
create trigger feedback_set_updated_at
  before update on feedback
  for each row execute function set_updated_at();

drop trigger if exists notes_set_updated_at on notes;
create trigger notes_set_updated_at
  before update on notes
  for each row execute function set_updated_at();

-- --------------------------------------------------------------------------
-- Content version coordination
--
-- Bumps content_sets.version exactly when a real question change is written.
-- AFTER + row-level means the bump is part of the same transaction: if the
-- content write rolls back, the version bump rolls back too. Updates that only
-- touch `updated_at` (or otherwise change no content field) do not bump.
--
-- The version is a monotonic token, not a count of publishes. Bulk imports may
-- jump it by more than one; clients only compare equality with their stored
-- version.
-- --------------------------------------------------------------------------

create or replace function bump_content_set_version()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    update content_sets
       set version = version + 1, updated_at = now()
     where id = old.set_id;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    -- Moving a question between sets changes both sets.
    if new.set_id is distinct from old.set_id then
      update content_sets
         set version = version + 1, updated_at = now()
       where id = old.set_id;
    end if;

    if new.set_id is not distinct from old.set_id
       and new.external_id is not distinct from old.external_id
       and new.position is not distinct from old.position
       and new.text is not distinct from old.text
       and new.category is not distinct from old.category
       and new.correct_answer is not distinct from old.correct_answer
       and new.badge_label is not distinct from old.badge_label
       and new.deleted_at is not distinct from old.deleted_at then
      return new;
    end if;
  end if;

  update content_sets
     set version = version + 1, updated_at = now()
   where id = new.set_id;

  return new;
end;
$$;

drop trigger if exists questions_bump_content_version on questions;
create trigger questions_bump_content_version
  after insert or update or delete on questions
  for each row execute function bump_content_set_version();

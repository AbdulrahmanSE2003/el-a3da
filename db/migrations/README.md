# Database migrations

Forward-only SQL migrations for the Qa3da Neon (PostgreSQL) database.

## Applied state

| Migration | Purpose | `dev` | `production` |
| --- | --- | --- | --- |
| `0001_init_schema.sql` | Tables, constraints, indexes, `updated_at` and content-version triggers | Applied 2026-10-21 | **Not applied** |
| `0002_seed_content_sets.sql` | Six content-set ids/names. Metadata only — no questions | Applied 2026-10-21 | **Not applied** |

`production` currently has **0 tables** and must remain untouched until a
separate, explicitly authorized release step exists.

The 3,181 content rows on `dev` were imported by a one-off operational script
outside this repository, in a single transaction. They are **not** part of a
migration file. Do not re-run the import or add content rows to a migration
without a separate review.

## Rules

1. Apply files in numeric order. Never edit an applied migration; add a new numbered file.
2. Keep each file safe to re-run where practical (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `CREATE OR REPLACE`, `DROP TRIGGER IF EXISTS`).
3. Apply each file inside a single transaction (`psql --single-transaction`, or the Neon MCP `run_sql_transaction` tool). The files do not contain `BEGIN`/`COMMIT` so the caller owns the transaction.
4. Never use `external_id` for ordering. `questions.position` is the authoritative 0-based order.
5. Never renumber `external_id`; casino values such as `1-2` are valid and must be stored as TEXT.
6. No content is hard-deleted: use `deleted_at` (soft delete).
7. Apply to `dev` first. Never apply to `production` as part of routine development.

## Content version semantics

`content_sets.version` is a monotonic token bumped by the `questions_bump_content_version`
trigger in the same transaction as a real question change (insert, content update,
soft delete/restore, set move). It is not a publish counter and may jump by more than
one during a bulk import. Clients compare equality with their stored version.

## Verification queries

```sql
select id, name, version from content_sets order by id;

select set_id,
       count(*) filter (where deleted_at is null)::int as live,
       count(*) filter (where deleted_at is not null)::int as deleted,
       min(position) as min_position,
       max(position) as max_position
from questions
group by set_id
order by set_id;

select set_id, count(*)::int as total
from questions
group by set_id
order by set_id;

select set_id, position, count(*)
from questions
group by set_id, position
having count(*) > 1;

select set_id, external_id, count(*)
from questions
group by set_id, external_id
having count(*) > 1;
```

Expected `dev` totals after the initial import:

| Set | Live | Deleted | Version |
| --- | ---: | ---: | ---: |
| `casino` | 1,094 | 0 | 1,095 |
| `topics` | 502 | 0 | 503 |
| `challenges` | 500 | 0 | 501 |
| `sheikh` | 500 | 0 | 501 |
| `zad` | 86 | 0 | 87 |
| `punishments` | 499 | 0 | 500 |
| **Total** | **3,181** | **0** | — |

`feedback` and `feedback_attachments` are now written by the public `/feedback`
page and read (read-only) in `/admin/feedback`; screenshots live in the private
Neon `feedbacks` bucket. `notes` exists but still contains **0 rows** and is not
exposed until its own reviewed query is added — see `docs/feedback.md` and
`docs/admin-auth.md`.

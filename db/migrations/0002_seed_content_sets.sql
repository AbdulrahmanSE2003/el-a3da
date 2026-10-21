-- Qa3da — seed content set identifiers
-- Migration: 0002_seed_content_sets
--
-- Metadata only: the six set ids/names already used by contents/*.ts and
-- features/admin/lib/content-sets.ts. No questions are imported here.
--
-- Safe to re-run: existing rows are left untouched (DO NOTHING), so a manual
-- rename or a later version bump is never overwritten by this seed.

insert into content_sets (id, name)
values
  ('casino',      'كافيه الألعاب'),
  ('topics',      'مواضيع'),
  ('challenges',  'تحديات'),
  ('sheikh',      'شيخ الحارة'),
  ('zad',         'زاد القعدة'),
  ('punishments', 'عقوبات')
on conflict (id) do nothing;

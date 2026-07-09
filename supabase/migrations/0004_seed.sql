-- ===========================================================================
-- Seed data — mirrors NS Policies & Procedures departments.
-- Safe to re-run (idempotent on slug).
-- ===========================================================================

insert into public.settings (key, value) values
  ('site', '{"name":"NS Knowledge Base","logo":null,"contact_email":"info@ns.example","social":{}}'),
  ('theme', '{"mode":"system","primary":"#6366f1","radius":"0.75rem"}'),
  ('homepage', '{"hero_title":"Everything your team needs to know","hero_subtitle":"Policies, procedures and know-how for NS — searchable, organized, always up to date.","layout":"default"}'),
  ('features', '{"allow_user_topics":true,"enable_likes":true,"enable_comments":false}')
on conflict (key) do nothing;

insert into public.categories (name, slug, description, icon, color, "order") values
  ('HR', 'hr', 'Human resources policies, onboarding and employee procedures.', 'users', '#6366f1', 1),
  ('Stock Control', 'stock-control', 'Inventory management, stock counts and reconciliation.', 'boxes', '#0ea5e9', 2),
  ('Warehouse Procedures', 'warehouse', 'Receiving, storage and dispatch procedures (اجراءات المخازن).', 'warehouse', '#f59e0b', 3),
  ('Manufacturing', 'manufacturing', 'Production and manufacturing standards (تصنيع).', 'factory', '#10b981', 4),
  ('Business Support', 'business-support', 'Cross-functional support, admin and operations.', 'briefcase', '#8b5cf6', 5),
  ('Quality Assurance', 'quality-assurance', 'QA tracking, audit plans and achievement reports.', 'shield-check', '#ef4444', 6)
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Onboarding','onboarding'), ('Audit','audit'), ('Inventory','inventory'),
  ('Safety','safety'), ('SOP','sop'), ('Compliance','compliance')
on conflict (slug) do nothing;

-- Example published articles
insert into public.articles (title, slug, summary, content_text, category_id, status, featured, pinned, difficulty, estimated_read_time, keywords, author, published_at)
select * from (
  values
  ('Employee Onboarding Checklist', 'employee-onboarding-checklist',
   'Step-by-step checklist for onboarding a new team member from offer to first week.',
   'Employee onboarding checklist covering documentation, IT setup, orientation and first-week goals.',
   (select id from public.categories where slug = 'hr'),
   'published'::article_status, true, true, 'beginner'::article_difficulty, 5,
   array['onboarding','hr','new hire'], 'HR Team', now()),
  ('Monthly Stock Count Procedure', 'monthly-stock-count-procedure',
   'How to perform and reconcile the monthly physical stock count.',
   'Monthly stock count procedure: freeze movements, count by location, reconcile variances, sign-off.',
   (select id from public.categories where slug = 'stock-control'),
   'published'::article_status, true, false, 'intermediate'::article_difficulty, 8,
   array['inventory','stock count','reconciliation'], 'Stock Control', now()),
  ('Warehouse Receiving Standard', 'warehouse-receiving-standard',
   'Standard operating procedure for receiving inbound shipments.',
   'Warehouse receiving SOP: verify PO, inspect goods, record quantities, put-away and label.',
   (select id from public.categories where slug = 'warehouse'),
   'published'::article_status, false, false, 'beginner'::article_difficulty, 6,
   array['warehouse','receiving','sop'], 'Warehouse Ops', now()),
  ('QA Audit Plan Overview', 'qa-audit-plan-overview',
   'Overview of the quarterly QA audit plan and tracking approach.',
   'QA audit plan overview: scope, schedule, tracking sheet usage and achievement reporting.',
   (select id from public.categories where slug = 'quality-assurance'),
   'published'::article_status, true, false, 'advanced'::article_difficulty, 10,
   array['audit','qa','compliance'], 'QA Team', now())
) as v
on conflict (slug) do nothing;

-- Promote a couple of articles to hot topics
insert into public.hot_topics (article_id, title, priority, icon, color)
select a.id, a.title, 10, 'flame', '#ef4444'
from public.articles a where a.slug = 'employee-onboarding-checklist'
on conflict do nothing;

insert into public.hot_topics (article_id, title, priority, icon, color)
select a.id, a.title, 8, 'trending-up', '#0ea5e9'
from public.articles a where a.slug = 'monthly-stock-count-procedure'
on conflict do nothing;

-- Seed a few trending searches
insert into public.trending_searches (keyword, search_count) values
  ('onboarding', 42), ('stock count', 31), ('audit plan', 27), ('safety', 19), ('leave policy', 12)
on conflict (keyword) do update set search_count = excluded.search_count;

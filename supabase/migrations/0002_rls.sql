-- ===========================================================================
-- Row Level Security  (No accounts model)
-- The anon key is used for public reads only. All writes are performed by the
-- server using the SERVICE ROLE key, which BYPASSES RLS. So we grant the anon
-- role read access to public content, plus insert on the few "engagement"
-- tables, and nothing else. Defense-in-depth behind the edge IP allowlist.
-- ===========================================================================

alter table public.categories            enable row level security;
alter table public.articles              enable row level security;
alter table public.tags                  enable row level security;
alter table public.article_tags          enable row level security;
alter table public.hot_topics            enable row level security;
alter table public.trending_searches     enable row level security;
alter table public.user_submitted_topics enable row level security;
alter table public.recent_views          enable row level security;
alter table public.settings              enable row level security;
alter table public.audit_log             enable row level security;
alter table public.article_versions      enable row level security;

-- categories ----------------------------------------------------------------
create policy "categories: public read" on public.categories
  for select using (active = true);

-- articles ------------------------------------------------------------------
create policy "articles: public read published" on public.articles
  for select using (status = 'published');

-- tags ----------------------------------------------------------------------
create policy "tags: public read"          on public.tags          for select using (true);
create policy "article_tags: public read"  on public.article_tags  for select using (true);

-- hot_topics ----------------------------------------------------------------
create policy "hot_topics: public read" on public.hot_topics
  for select using (active = true);

-- trending_searches ---------------------------------------------------------
create policy "trending: public read" on public.trending_searches for select using (true);

-- recent_views (read for the global "recently viewed" widget) ---------------
create policy "recent_views: public read" on public.recent_views for select using (true);

-- settings (public read of non-secret site config) --------------------------
create policy "settings: public read" on public.settings for select using (true);

-- user_submitted_topics: allow anonymous INSERT only (from allowlisted IPs).
-- Reading & moderation happen server-side via the service role.
create policy "topics: anon insert" on public.user_submitted_topics
  for insert with check (true);

-- NOTE: article_versions & audit_log have RLS enabled with no policies, so the
-- anon role has no access. They are only reachable via the service role.

-- ---------------------------------------------------------------------------
-- Engagement counters (views/likes/searches) are updated through
-- SECURITY DEFINER RPCs (0003_functions.sql), so the anon role does not need
-- direct UPDATE on articles.
-- ---------------------------------------------------------------------------

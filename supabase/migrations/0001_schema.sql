-- ===========================================================================
-- NS Knowledge Base — Core Schema  (No user accounts / no Supabase Auth)
-- Access control is enforced at the Next.js edge: an IP allowlist gates the
-- whole site, and a shared passcode gates the admin dashboard. Admin writes go
-- through the Supabase service-role key (server-only), which bypasses RLS.
-- Run order: 0001_schema.sql → 0002_rls.sql → 0003_functions.sql → 0004_seed.sql
-- ===========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";      -- fuzzy / trigram search
create extension if not exists "unaccent";     -- accent-insensitive search

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type article_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type article_difficulty as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- categories — supports nested/parent categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid primary key default uuid_generate_v4(),
  parent_id    uuid references public.categories(id) on delete set null,
  name         text not null,
  slug         text unique not null,
  description  text,
  icon         text default 'folder',           -- lucide icon name
  color        text default '#6366f1',
  image        text,
  "order"      integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_active_order_idx on public.categories(active, "order");

-- ---------------------------------------------------------------------------
-- articles — the core knowledge unit
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text unique not null,
  summary             text,
  content             jsonb,                     -- Tiptap/ProseMirror rich-text doc
  content_text        text,                      -- plain-text mirror for search
  category_id         uuid references public.categories(id) on delete set null,
  featured_image      text,
  gallery             jsonb default '[]'::jsonb, -- array of image URLs
  keywords            text[],
  difficulty          article_difficulty default 'beginner',
  estimated_read_time integer default 3,         -- minutes
  source              text,
  author              text,                      -- free-text byline (no accounts)
  status              article_status not null default 'draft',
  featured            boolean not null default false,
  pinned              boolean not null default false,
  views               integer not null default 0,
  likes               integer not null default 0,
  search_count        integer not null default 0,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Populated by a trigger (see below). A trigger is used instead of a
  -- GENERATED column because it can call unaccent() (which Postgres marks
  -- STABLE, not IMMUTABLE) — generated columns require immutable expressions.
  search_vector       tsvector
);
create index if not exists articles_category_idx on public.articles(category_id);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_featured_idx on public.articles(featured) where featured;
create index if not exists articles_pinned_idx on public.articles(pinned) where pinned;
create index if not exists articles_search_idx on public.articles using gin(search_vector);
create index if not exists articles_title_trgm_idx on public.articles using gin(title gin_trgm_ops);

-- Keep search_vector in sync on every insert/update.
create or replace function public.articles_search_vector_update()
returns trigger
language plpgsql
set search_path = public, extensions, pg_catalog
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.title, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.summary, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.content_text, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string(new.keywords, ' '), ''))), 'B');
  return new;
end $$;

drop trigger if exists trg_articles_search_vector on public.articles;
create trigger trg_articles_search_vector
  before insert or update of title, summary, content_text, keywords
  on public.articles
  for each row execute function public.articles_search_vector_update();

-- ---------------------------------------------------------------------------
-- tags + article_tags (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id     uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);
create index if not exists article_tags_tag_idx on public.article_tags(tag_id);

-- ---------------------------------------------------------------------------
-- hot_topics — admin-curated homepage highlights
-- ---------------------------------------------------------------------------
create table if not exists public.hot_topics (
  id         uuid primary key default uuid_generate_v4(),
  article_id uuid references public.articles(id) on delete cascade,
  title      text not null,
  priority   integer not null default 0,
  icon       text default 'flame',
  color      text default '#ef4444',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists hot_topics_active_priority_idx on public.hot_topics(active, priority desc);

-- ---------------------------------------------------------------------------
-- trending_searches — auto-aggregated search keywords
-- ---------------------------------------------------------------------------
create table if not exists public.trending_searches (
  id           uuid primary key default uuid_generate_v4(),
  keyword      text unique not null,
  search_count integer not null default 1,
  last_search  timestamptz not null default now()
);
create index if not exists trending_searches_count_idx on public.trending_searches(search_count desc);

-- ---------------------------------------------------------------------------
-- user_submitted_topics — anonymous topic requests (from trusted internal IPs)
-- ---------------------------------------------------------------------------
create table if not exists public.user_submitted_topics (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  requester    text,                        -- optional free-text name/email
  status       submission_status not null default 'pending',
  admin_note   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists submitted_topics_status_idx on public.user_submitted_topics(status);

-- ---------------------------------------------------------------------------
-- recent_views — global "recently viewed" feed (no user identity)
-- ---------------------------------------------------------------------------
create table if not exists public.recent_views (
  id         uuid primary key default uuid_generate_v4(),
  article_id uuid references public.articles(id) on delete cascade,
  viewed_at  timestamptz not null default now()
);
create index if not exists recent_views_time_idx on public.recent_views(viewed_at desc);

-- ---------------------------------------------------------------------------
-- settings — global key/value site configuration
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audit_log — activity / audit history (actor is free-text, e.g. 'admin')
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  actor       text default 'admin',
  action      text not null,            -- e.g. 'article.publish'
  entity_type text,
  entity_id   uuid,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- article_versions — version history / autosave snapshots
-- ---------------------------------------------------------------------------
create table if not exists public.article_versions (
  id         uuid primary key default uuid_generate_v4(),
  article_id uuid references public.articles(id) on delete cascade,
  title      text,
  summary    text,
  content    jsonb,
  editor     text,
  created_at timestamptz not null default now()
);
create index if not exists article_versions_article_idx on public.article_versions(article_id, created_at desc);

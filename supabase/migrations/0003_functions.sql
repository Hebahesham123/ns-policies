-- ===========================================================================
-- Functions, triggers & RPCs  (No accounts model)
-- Engagement RPCs are SECURITY DEFINER so the anon role can bump counters
-- without direct table UPDATE grants.
-- ===========================================================================

-- Auto-update updated_at ----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['categories','articles','user_submitted_topics'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on public.%1$s;
       create trigger trg_touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- Atomic view increment + global recent-views feed --------------------------
create or replace function public.increment_article_view(p_article_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.articles set views = views + 1 where id = p_article_id;
  insert into public.recent_views (article_id) values (p_article_id);
  -- keep the feed bounded to the latest 500 rows
  delete from public.recent_views
   where id in (
     select id from public.recent_views order by viewed_at desc offset 500
   );
end $$;

-- Record / aggregate a search term -----------------------------------------
create or replace function public.record_search(p_keyword text)
returns void language plpgsql security definer set search_path = public, extensions, pg_catalog as $$
declare k text := lower(trim(p_keyword));
begin
  if k = '' or k is null then return; end if;
  insert into public.trending_searches (keyword, search_count, last_search)
  values (k, 1, now())
  on conflict (keyword)
  do update set search_count = trending_searches.search_count + 1, last_search = now();

  update public.articles
     set search_count = search_count + 1
   where search_vector @@ plainto_tsquery('simple', unaccent(k));
end $$;

-- Like / unlike a counter (double-count is guarded client-side per device) ---
create or replace function public.bump_like(p_article_id uuid, p_delta int)
returns int language plpgsql security definer set search_path = public as $$
declare new_likes int;
begin
  update public.articles
     set likes = greatest(0, likes + case when p_delta >= 0 then 1 else -1 end)
   where id = p_article_id
  returning likes into new_likes;
  return coalesce(new_likes, 0);
end $$;

-- Full-text search with ranking --------------------------------------------
create or replace function public.search_articles(
  p_query text,
  p_category uuid default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid, title text, slug text, summary text, featured_image text,
  category_id uuid, views int, likes int, estimated_read_time int,
  published_at timestamptz, rank real
)
language sql stable security definer set search_path = public, extensions, pg_catalog as $$
  select a.id, a.title, a.slug, a.summary, a.featured_image,
         a.category_id, a.views, a.likes, a.estimated_read_time, a.published_at,
         ts_rank(a.search_vector, plainto_tsquery('simple', unaccent(coalesce(p_query,'')))) as rank
  from public.articles a
  where a.status = 'published'
    and (p_category is null or a.category_id = p_category)
    and (
      coalesce(p_query, '') = ''
      or a.search_vector @@ plainto_tsquery('simple', unaccent(p_query))
      or a.title ilike '%' || p_query || '%'
    )
  order by rank desc nulls last, a.views desc
  limit greatest(1, least(p_limit, 100)) offset greatest(0, p_offset);
$$;

-- Instant search suggestions -----------------------------------------------
create or replace function public.search_suggestions(p_query text, p_limit int default 6)
returns table (title text, slug text)
language sql stable security definer set search_path = public as $$
  select a.title, a.slug
  from public.articles a
  where a.status = 'published' and a.title ilike '%' || p_query || '%'
  order by a.views desc
  limit least(p_limit, 10);
$$;

-- Aggregate dashboard stats -------------------------------------------------
create or replace function public.dashboard_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total_articles',  (select count(*) from public.articles),
    'published',       (select count(*) from public.articles where status = 'published'),
    'drafts',          (select count(*) from public.articles where status = 'draft'),
    'categories',      (select count(*) from public.categories),
    'total_views',     (select coalesce(sum(views), 0) from public.articles),
    'total_likes',     (select coalesce(sum(likes), 0) from public.articles),
    'total_searches',  (select coalesce(sum(search_count), 0) from public.trending_searches),
    'hot_topics',      (select count(*) from public.hot_topics where active),
    'pending_topics',  (select count(*) from public.user_submitted_topics where status = 'pending')
  );
$$;

-- Expose the engagement RPCs to the anon role (SECURITY DEFINER = safe) ------
grant execute on function public.increment_article_view(uuid) to anon;
grant execute on function public.record_search(text)          to anon;
grant execute on function public.bump_like(uuid, int)         to anon;
grant execute on function public.search_articles(text, uuid, int, int) to anon;
grant execute on function public.search_suggestions(text, int) to anon;

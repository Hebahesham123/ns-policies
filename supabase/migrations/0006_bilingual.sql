-- ===========================================================================
-- 0006_bilingual.sql — store both Arabic & English versions of content.
-- `lang` = the ORIGINAL language of the row; the `*_alt` columns hold the
-- machine translation into the other language. The app shows whichever matches
-- the chosen UI language (default Arabic), falling back to the original.
-- Run AFTER 0001–0004 and after importing content; then run:
--   npm run translate:content
-- ===========================================================================

alter table public.articles
  add column if not exists lang              text,
  add column if not exists title_alt         text,
  add column if not exists summary_alt       text,
  add column if not exists content_alt       jsonb,
  add column if not exists content_text_alt  text;

alter table public.categories
  add column if not exists lang              text,
  add column if not exists name_alt          text,
  add column if not exists description_alt   text;

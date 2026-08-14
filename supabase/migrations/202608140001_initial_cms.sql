-- Today's Manual CMS: database, admin authorization, newsletter, and media storage.
-- Run this migration in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

revoke all on function private.is_cms_admin() from public;
grant execute on function private.is_cms_admin() to anon, authenticated;

create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  color text not null default '#071a38',
  image_url text not null default '',
  image_alt text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  excerpt text not null default '',
  body text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  read_time text not null default '5 min read',
  author text not null default 'Today''s Manual',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_order_idx on public.articles(status, sort_order);
create index if not exists articles_category_idx on public.articles(category_slug, status, sort_order);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and length(email) <= 254),
  source text not null default 'website',
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx on public.subscribers(created_at desc);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  operation text not null,
  changed_by uuid references auth.users(id) on delete set null,
  old_record jsonb,
  new_record jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_changed_by_idx on public.audit_log(changed_by);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.record_cms_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log(table_name, record_id, operation, changed_by, old_record, new_record)
  values (
    tg_table_name,
    coalesce(to_jsonb(new)->>'id', to_jsonb(new)->>'slug', to_jsonb(new)->>'key', to_jsonb(old)->>'id', to_jsonb(old)->>'slug', to_jsonb(old)->>'key', 'unknown'),
    tg_op,
    (select auth.uid()),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.record_cms_change() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();
drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at before update on public.subscribers for each row execute function public.set_updated_at();

drop trigger if exists categories_audit on public.categories;
create trigger categories_audit after insert or update or delete on public.categories for each row execute function public.record_cms_change();
drop trigger if exists articles_audit on public.articles;
create trigger articles_audit after insert or update or delete on public.articles for each row execute function public.record_cms_change();
drop trigger if exists site_settings_audit on public.site_settings;
create trigger site_settings_audit after insert or update or delete on public.site_settings for each row execute function public.record_cms_change();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;
alter table public.subscribers enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "Users can read their own CMS profile" on public.profiles;
create policy "Users can read their own CMS profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id or private.is_cms_admin());
drop policy if exists "Admins insert CMS profiles" on public.profiles;
create policy "Admins insert CMS profiles" on public.profiles for insert to authenticated with check (private.is_cms_admin());
drop policy if exists "Admins update CMS profiles" on public.profiles;
create policy "Admins update CMS profiles" on public.profiles for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
drop policy if exists "Admins delete CMS profiles" on public.profiles;
create policy "Admins delete CMS profiles" on public.profiles for delete to authenticated using (private.is_cms_admin());

drop policy if exists "Public reads published categories" on public.categories;
create policy "Public reads published categories" on public.categories for select to anon, authenticated
using (published or private.is_cms_admin());
drop policy if exists "CMS team inserts categories" on public.categories;
create policy "CMS team inserts categories" on public.categories for insert to authenticated with check (private.is_cms_admin());
drop policy if exists "CMS team updates categories" on public.categories;
create policy "CMS team updates categories" on public.categories for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
drop policy if exists "CMS team deletes categories" on public.categories;
create policy "CMS team deletes categories" on public.categories for delete to authenticated using (private.is_cms_admin());

drop policy if exists "Public reads published articles" on public.articles;
create policy "Public reads published articles" on public.articles for select to anon, authenticated
using (status = 'published' or private.is_cms_admin());
drop policy if exists "CMS team inserts articles" on public.articles;
create policy "CMS team inserts articles" on public.articles for insert to authenticated with check (private.is_cms_admin());
drop policy if exists "CMS team updates articles" on public.articles;
create policy "CMS team updates articles" on public.articles for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
drop policy if exists "CMS team deletes articles" on public.articles;
create policy "CMS team deletes articles" on public.articles for delete to authenticated using (private.is_cms_admin());

drop policy if exists "Public reads site configuration" on public.site_settings;
create policy "Public reads site configuration" on public.site_settings for select to anon, authenticated
using (key = 'site_config' or private.is_cms_admin());
drop policy if exists "CMS team inserts site configuration" on public.site_settings;
create policy "CMS team inserts site configuration" on public.site_settings for insert to authenticated with check (private.is_cms_admin());
drop policy if exists "CMS team updates site configuration" on public.site_settings;
create policy "CMS team updates site configuration" on public.site_settings for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
drop policy if exists "CMS team deletes site configuration" on public.site_settings;
create policy "CMS team deletes site configuration" on public.site_settings for delete to authenticated using (private.is_cms_admin());

drop policy if exists "Anyone can join the newsletter" on public.subscribers;
create policy "Anyone can join the newsletter" on public.subscribers for insert to anon, authenticated
with check (status = 'active' and source = 'website');
drop policy if exists "CMS team reads subscribers" on public.subscribers;
create policy "CMS team reads subscribers" on public.subscribers for select to authenticated using (private.is_cms_admin());
drop policy if exists "CMS team updates subscribers" on public.subscribers;
create policy "CMS team updates subscribers" on public.subscribers for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
drop policy if exists "CMS team deletes subscribers" on public.subscribers;
create policy "CMS team deletes subscribers" on public.subscribers for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team reads audit log" on public.audit_log;
create policy "CMS team reads audit log" on public.audit_log for select to authenticated
using (private.is_cms_admin());

grant select on public.categories, public.articles, public.site_settings to anon, authenticated;
grant insert on public.subscribers to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.categories, public.articles, public.site_settings, public.subscribers, public.audit_log to authenticated;
grant usage, select on sequence public.audit_log_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "CMS team uploads site media" on storage.objects;
create policy "CMS team uploads site media" on storage.objects for insert to authenticated
with check (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team updates site media" on storage.objects;
create policy "CMS team updates site media" on storage.objects for update to authenticated
using (bucket_id = 'site-media' and private.is_cms_admin())
with check (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team deletes site media" on storage.objects;
create policy "CMS team deletes site media" on storage.objects for delete to authenticated
using (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team lists site media" on storage.objects;
create policy "CMS team lists site media" on storage.objects for select to authenticated
using (bucket_id = 'site-media' and private.is_cms_admin());

insert into public.categories (slug, title, description, color, image_url, image_alt, sort_order, published) values
('work', 'Work', 'Careers, workplace culture and growth.', '#f15a24', '/editorial/work.jpg', 'Ghanaian professionals and students collaborating around laptops at a workshop', 0, true),
('money', 'Money', 'Make, manage and multiply your money.', '#3d652f', '/editorial/money.jpg', 'A Ghanaian market trader serving customers at her stall in northern Ghana', 1, true),
('skills', 'Skills', 'The skills that build value and freedom.', '#1b4b78', '/editorial/skills.jpg', 'Young Ghanaian women participating in a laptop-based technology workshop', 2, true),
('life', 'Life', 'Mindset, health, relationships and becoming your best.', '#8063a8', '/editorial/life.jpg', 'A Ghanaian environmental initiative team gathered around a work table', 3, true),
('opportunity', 'Opportunity', 'Jobs, scholarships, fellowships and more.', '#d59620', '/editorial/opportunity.jpg', 'A diverse group of young Ghanaian adults outside the University of Ghana', 4, true)
on conflict (slug) do nothing;

insert into public.articles (id, slug, title, category_slug, excerpt, body, image_url, image_alt, read_time, author, status, featured, sort_order, published_at) values
('hero-01', 'what-happens-after-university', 'Nobody Told Us What Happens After University.', 'work', 'The real world looks nothing like the classroom. Here’s what actually changes — and how to prepare for it.', E'## The useful version is on its way\n\nWe’re building this story with the context, examples and practical next steps it deserves.\n\nIn the meantime, explore Today’s Manual for more useful guidance.', '/editorial/hero-laptop.jpg', 'Young man working on a laptop while carrying a colourful patterned shoulder bag', '8 min read', 'Today''s Manual', 'published', true, 0, now()),
('story-02', 'salary-is-not-net-worth', 'Your Salary Isn’t Your Net Worth.', 'money', 'A practical guide from Today’s Manual.', E'## Start with what you control\n\nYour income matters, but what you keep, build and own matters too.', '/editorial/money.jpg', 'A Ghanaian market trader serving customers at her stall in northern Ghana', '5 min read', 'Today''s Manual', 'published', false, 1, now()),
('story-03', 'skills-that-will-pay-in-2030', 'The Skills That Will Pay You in 2030.', 'skills', 'A practical guide from Today’s Manual.', E'## Build durable skills\n\nFocus on skills that combine judgment, communication and technical leverage.', '/editorial/skills.jpg', 'Young Ghanaian women participating in a laptop-based technology workshop', '6 min read', 'Today''s Manual', 'published', false, 2, now()),
('01', 'five-things-about-your-first-job', '5 things nobody tells you about your first job.', 'work', 'A practical guide from Today’s Manual.', E'## Your first job is a classroom\n\nPay attention to how decisions get made and how useful work gets recognized.', '/editorial/student.jpg', 'Young Ghanaian adults working together on laptops at a University of Ghana workshop', '3 min read', 'Today''s Manual', 'published', false, 3, now()),
('02', 'your-first-1000-ghs', 'Your first 1000 GHS is different.', 'money', 'A practical guide from Today’s Manual.', E'## Give your money a job\n\nA simple plan beats vague good intentions.', '/editorial/cash.jpg', 'Front and back of a Ghana 50 cedi banknote', '4 min read', 'Today''s Manual', 'published', false, 4, now()),
('03', 'high-income-skills-six-months', '7 high-income skills you can learn in 6 months.', 'skills', 'A practical guide from Today’s Manual.', E'## Learn by building\n\nChoose one useful skill, practise in public and create evidence of your ability.', '/editorial/desk.jpg', 'Ghanaian students learning together with a laptop in a classroom', '5 min read', 'Today''s Manual', 'published', false, 5, now()),
('04', 'corporate-phrases-explained', 'Corporate phrases (and what they mean).', 'work', 'A practical guide from Today’s Manual.', E'## Decode the workplace\n\nClear language helps you act with confidence.', '/editorial/office.jpg', 'Attendees preparing for a Young Entrepreneurs Summit in Ghana', '3 min read', 'Today''s Manual', 'published', false, 6, now()),
('05', 'why-side-hustles-do-not-make-money', 'Why most side hustles never make money.', 'money', 'A practical guide from Today’s Manual.', E'## A hustle still needs a customer\n\nStart with a painful problem and a person willing to pay to solve it.', '/editorial/buildings.jpg', 'People walking past small businesses on a busy market street in Accra', '4 min read', 'Today''s Manual', 'published', false, 7, now())
on conflict (id) do nothing;

insert into public.site_settings (key, value)
values (
  'site_config',
  $json${
    "siteTitle": "Today’s Manual",
    "siteDescription": "Practical guidance for young Africans navigating work, money, skills, life and opportunity.",
    "contactEmail": "todaysmanual@gmail.com",
    "logoUrl": "/todaysmanual1.png",
    "ogImageUrl": "/og.png",
    "issueLabel": "Issue 001",
    "headerLabel": "Today in the Manual",
    "headerTopics": ["AI", "Careers", "Money", "Ghana", "Business"],
    "popularTopics": ["Career Change", "AI", "Salary", "CV", "Masters", "Entrepreneurship", "Remote Work", "Money", "Productivity"],
    "socialLinks": [
      {"label":"Facebook","href":"https://www.facebook.com/profile.php?id=61593445161962","icon":"facebook"},
      {"label":"Instagram","href":"https://www.instagram.com/todaysmanual/","icon":"instagram"},
      {"label":"TikTok","href":"https://www.tiktok.com/@todaysmanualofficial","icon":"tiktok"},
      {"label":"LinkedIn","href":"https://www.linkedin.com/in/todaysmanual-undefined-538a70429/","icon":"linkedin"},
      {"label":"YouTube","href":"https://www.youtube.com/@todaysmanual","icon":"play"}
    ],
    "heroArticleSlug": "what-happens-after-university",
    "secondaryArticleSlugs": ["salary-is-not-net-worth", "skills-that-will-pay-in-2030"],
    "quickReadSlugs": ["five-things-about-your-first-job", "your-first-1000-ghs", "high-income-skills-six-months", "corporate-phrases-explained", "why-side-hustles-do-not-make-money"],
    "startHereEyebrow": "Start here",
    "startHereTitle": "Where are you right now?",
    "startHereItems": [
      {"title":"I’m still in school","description":"What should I be doing before graduating?","icon":"school","color":"#f6ae2d","href":"/article/prepare-before-graduating"},
      {"title":"I just graduated","description":"How do I actually start my career?","icon":"briefcase","color":"#f47b4a","href":"/article/start-your-career"},
      {"title":"I’m working","description":"How do I move up and grow faster?","icon":"growth","color":"#22b879","href":"/article/grow-faster-at-work"},
      {"title":"I want to build something","description":"Business, freelancing and entrepreneurship.","icon":"idea","color":"#8f75bd","href":"/article/build-something-of-your-own"},
      {"title":"I feel lost","description":"Where do I even begin?","icon":"compass","color":"#275fb4","href":"/article/find-your-next-step"}
    ],
    "manualsEyebrow": "The five manuals",
    "manualsTitle": "Explore what matters.",
    "manualsDescription": "Everything you need to build a meaningful and successful life in today’s world.",
    "quickReadsTitle": "You should know this.",
    "quickReadsDescription": "Quick reads to help you make smarter decisions.",
    "dailyBriefsTitle": "3 things you should know today",
    "dailyBriefs": [
      {"id":"01","title":"MTN Ghana launches 5G in Accra and Kumasi.","meta":"2 min read"},
      {"id":"02","title":"The World Bank predicts 3.3% growth for Ghana in 2026.","meta":"2 min read"},
      {"id":"03","title":"Flutterwave is hiring across multiple roles.","meta":"View opportunity"}
    ],
    "voice": {"eyebrow":"Voices","description":"Real stories from young Africans.","quote":"I thought getting a degree was enough.","attribution":"Kofi, 26, Accra","imageUrl":"/editorial/voice.jpg","imageAlt":"A young Ghanaian man speaking during a University of Ghana workshop","href":"/article/voices"},
    "featuredManual": {"eyebrow":"The Manual","description":"Definitive guides for every stage of your journey.","title":"The Interview Manual","summary":"Everything you need before, during and after an interview.","readTime":"12 min read","imageUrl":"/editorial/interview.jpg","imageAlt":"Ghanaian broadcaster Anita Erskine taking part in a television interview","href":"/article/the-interview-manual"},
    "newsletter": {"title":"The Morning Manual","description":"Three useful things. Five minutes. Every morning.","buttonLabel":"Get the Manual","successTitle":"You’re on the Morning Manual list.","successDescription":"Watch your inbox for the next edition."},
    "footerDescription": "A guide for the generation building tomorrow. Practical knowledge, honest conversations and useful direction for navigating careers, business and life in modern Africa.",
    "footerColumns": [
      {"title":"Explore","links":[{"label":"Work Manual","href":"/work"},{"label":"Money Manual","href":"/money"},{"label":"Skills Manual","href":"/skills"},{"label":"Life Manual","href":"/life"},{"label":"Opportunity Manual","href":"/opportunity"}]},
      {"title":"About","links":[{"label":"About Us","href":"/article/about-us"},{"label":"Our Mission","href":"/article/our-mission"},{"label":"Editorial Principles","href":"/article/editorial-principles"},{"label":"Write for Us","href":"/article/write-for-us"},{"label":"Contributors","href":"/article/contributors"}]},
      {"title":"Resources","links":[{"label":"The Manual","href":"/article/the-manual"},{"label":"Opportunities","href":"/article/opportunities"},{"label":"Newsletter","href":"/#newsletter"},{"label":"Podcast","href":"/article/podcast"},{"label":"Videos","href":"/article/videos"},{"label":"Image Credits","href":"/image-credits"}]},
      {"title":"Support","links":[{"label":"Contact Us","href":"mailto:todaysmanual@gmail.com"},{"label":"Advertise","href":"/article/advertise"},{"label":"Partner With Us","href":"/article/partner-with-us"},{"label":"Privacy Policy","href":"/article/privacy-policy"},{"label":"Terms of Use","href":"/article/terms-of-use"}]}
    ],
    "footerSignoff": "Made in Africa for the world we live in."
  }$json$::jsonb
)
on conflict (key) do nothing;

-- After creating your owner in Authentication > Users, run this once in SQL Editor:
-- insert into public.profiles (id, display_name, role)
-- select id, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
-- from auth.users where email = 'YOUR-EMAIL@example.com'
-- on conflict (id) do update set role = 'admin';

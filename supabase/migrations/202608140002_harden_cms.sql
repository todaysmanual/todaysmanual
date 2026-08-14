-- Move authorization helpers outside the exposed API schema and streamline RLS.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

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
revoke all on function public.record_cms_change() from public, anon, authenticated;

create index if not exists audit_log_changed_by_idx on public.audit_log(changed_by);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);

drop policy if exists "Admins manage CMS profiles" on public.profiles;
drop policy if exists "Users can read their own CMS profile" on public.profiles;
drop policy if exists "Admins insert CMS profiles" on public.profiles;
drop policy if exists "Admins update CMS profiles" on public.profiles;
drop policy if exists "Admins delete CMS profiles" on public.profiles;
create policy "Users can read their own CMS profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id or private.is_cms_admin());
create policy "Admins insert CMS profiles" on public.profiles for insert to authenticated with check (private.is_cms_admin());
create policy "Admins update CMS profiles" on public.profiles for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
create policy "Admins delete CMS profiles" on public.profiles for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team manages categories" on public.categories;
drop policy if exists "Public reads published categories" on public.categories;
drop policy if exists "CMS team inserts categories" on public.categories;
drop policy if exists "CMS team updates categories" on public.categories;
drop policy if exists "CMS team deletes categories" on public.categories;
create policy "Public reads published categories" on public.categories for select to anon, authenticated using (published or private.is_cms_admin());
create policy "CMS team inserts categories" on public.categories for insert to authenticated with check (private.is_cms_admin());
create policy "CMS team updates categories" on public.categories for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
create policy "CMS team deletes categories" on public.categories for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team manages articles" on public.articles;
drop policy if exists "Public reads published articles" on public.articles;
drop policy if exists "CMS team inserts articles" on public.articles;
drop policy if exists "CMS team updates articles" on public.articles;
drop policy if exists "CMS team deletes articles" on public.articles;
create policy "Public reads published articles" on public.articles for select to anon, authenticated using (status = 'published' or private.is_cms_admin());
create policy "CMS team inserts articles" on public.articles for insert to authenticated with check (private.is_cms_admin());
create policy "CMS team updates articles" on public.articles for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
create policy "CMS team deletes articles" on public.articles for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team manages site configuration" on public.site_settings;
drop policy if exists "Public reads site configuration" on public.site_settings;
drop policy if exists "CMS team inserts site configuration" on public.site_settings;
drop policy if exists "CMS team updates site configuration" on public.site_settings;
drop policy if exists "CMS team deletes site configuration" on public.site_settings;
create policy "Public reads site configuration" on public.site_settings for select to anon, authenticated using (key = 'site_config' or private.is_cms_admin());
create policy "CMS team inserts site configuration" on public.site_settings for insert to authenticated with check (private.is_cms_admin());
create policy "CMS team updates site configuration" on public.site_settings for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
create policy "CMS team deletes site configuration" on public.site_settings for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team manages subscribers" on public.subscribers;
drop policy if exists "CMS team reads subscribers" on public.subscribers;
drop policy if exists "CMS team updates subscribers" on public.subscribers;
drop policy if exists "CMS team deletes subscribers" on public.subscribers;
create policy "CMS team reads subscribers" on public.subscribers for select to authenticated using (private.is_cms_admin());
create policy "CMS team updates subscribers" on public.subscribers for update to authenticated using (private.is_cms_admin()) with check (private.is_cms_admin());
create policy "CMS team deletes subscribers" on public.subscribers for delete to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team reads audit log" on public.audit_log;
create policy "CMS team reads audit log" on public.audit_log for select to authenticated using (private.is_cms_admin());

drop policy if exists "CMS team uploads site media" on storage.objects;
create policy "CMS team uploads site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team updates site media" on storage.objects;
create policy "CMS team updates site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and private.is_cms_admin()) with check (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team deletes site media" on storage.objects;
create policy "CMS team deletes site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and private.is_cms_admin());
drop policy if exists "CMS team lists site media" on storage.objects;
create policy "CMS team lists site media" on storage.objects for select to authenticated using (bucket_id = 'site-media' and private.is_cms_admin());

drop function if exists public.is_cms_admin();

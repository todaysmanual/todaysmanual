# Today’s Manual backend setup

The website now includes a complete Supabase CMS at `/admin`. The public site
continues to use its bundled content until the Supabase connection is present,
so configuration can be completed without downtime.

## 1. Create or connect Supabase

Create a Supabase project, then open **SQL Editor** and run the complete file:

`supabase/migrations/202608140001_initial_cms.sql`

That migration creates and seeds:

- articles and publication categories;
- all editable homepage and site settings;
- newsletter subscribers;
- editor profiles and an audit trail;
- the public `site-media` image bucket;
- Row Level Security policies that give visitors read-only access to published
  content and give approved editors the only write access.

## 2. Add the owner account

In Supabase, open **Authentication → Users → Add user**. Create the owner with
an email and password, then run this in SQL Editor after replacing the email:

```sql
insert into public.profiles (id, display_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
from auth.users
where email = 'YOUR-EMAIL@example.com'
on conflict (id) do update set role = 'admin';
```

There is deliberately no public owner signup. This prevents a visitor from
claiming control of the CMS before the real owner does.

## 3. Add environment variables

Copy the project URL and publishable key from **Supabase → Project Settings →
API**. Add them locally in `.env.local` and in Vercel for Production, Preview,
and Development:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
```

The publishable key is safe to expose in the browser; database and Storage
access are enforced by the included RLS policies. Never add a Supabase
`service_role` key to a `NEXT_PUBLIC_` variable.

Resend remains optional. If `RESEND_API_KEY` is configured, each newsletter
signup also sends an owner notification. Subscribers are stored in Supabase
whether or not Resend is enabled.

## 4. Use the owner studio

Visit `/admin` and sign in with the owner account. From there you can:

- create, edit, draft, publish, order, and delete articles;
- edit each Manual, its image, colour, description, and visibility;
- choose homepage story placement and edit every homepage section;
- change the logo, social preview, contact details, navigation, social links,
  newsletter copy, footer, and image credits;
- upload, replace, copy, and remove images in Supabase Storage;
- view, export, unsubscribe, and reactivate newsletter subscribers.

Public pages read only published records. Drafts and all editing operations are
protected by Supabase Auth and database-level policies.

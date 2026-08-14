-- Contact inbox plus the published pages linked from the homepage and footer.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email = lower(email) and char_length(email) <= 254),
  subject text not null check (char_length(subject) between 2 and 160),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "CMS team reads contact messages" on public.contact_messages;
create policy "CMS team reads contact messages"
  on public.contact_messages for select to authenticated
  using (private.is_cms_admin());

drop policy if exists "CMS team updates contact messages" on public.contact_messages;
create policy "CMS team updates contact messages"
  on public.contact_messages for update to authenticated
  using (private.is_cms_admin()) with check (private.is_cms_admin());

drop policy if exists "CMS team deletes contact messages" on public.contact_messages;
create policy "CMS team deletes contact messages"
  on public.contact_messages for delete to authenticated
  using (private.is_cms_admin());

revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;

insert into public.articles
  (slug, title, category_slug, excerpt, body, image_url, image_alt, read_time, author, status, featured, sort_order, published_at)
values
  ('the-interview-manual', 'The Interview Manual', 'work',
   'Everything you need before, during and after an interview — from preparation to the follow-up.',
   $body$## Before the interview

Start with the job description. Highlight the outcomes the employer wants, then prepare one example that proves you can deliver each important outcome. Research the organisation, its customers and its recent work. Your goal is not to memorise facts; it is to understand the problems the team is trying to solve.

### Build your evidence bank

Prepare five short stories from school, work, volunteering or personal projects. Use a simple structure: situation, responsibility, action and result. Put numbers on the result whenever you can.

- A problem you solved
- A time you worked with a difficult person
- A mistake and what you changed
- A moment you showed initiative
- A result you are proud of

### Practise the essentials

Be ready to answer: Tell me about yourself, Why this role, Why this organisation, and What are you learning right now? Keep each answer clear and specific. Record yourself once; you will notice filler words and long detours immediately.

## During the interview

Listen to the whole question before answering. It is fine to pause for a few seconds. If a question is unclear, ask the interviewer to clarify it. Strong candidates do not rush; they make their thinking easy to follow.

### Make the conversation useful

Connect your examples to the role. Instead of saying you are hardworking, describe the deadline, the action you took and the outcome. If you do not know an answer, explain how you would find it rather than inventing one.

### Ask better questions

Ask what success looks like after 90 days, what the team is trying to improve, and what separates people who thrive in the role from those who struggle.

## After the interview

Send a brief thank-you message within 24 hours. Mention one useful point from the conversation and confirm your interest. If the employer gave a decision date, wait until that date passes before following up.

### Your final checklist

- Confirm the time, format and location
- Test your connection, camera and audio
- Carry copies of your CV and a notebook
- Prepare five evidence stories and three questions
- Send a short follow-up

An interview is not a test of whether you are perfect. It is a structured conversation about whether your evidence, judgement and goals fit the work.$body$,
   '/editorial/interview.jpg', 'Ghanaian broadcaster Anita Erskine taking part in a television interview', '12 min read', 'Today''s Manual', 'published', false, 100, now()),

  ('prepare-before-graduating', 'What to Do Before You Graduate', 'skills',
   'A practical final-year plan for leaving school with evidence, relationships and direction.',
   $body$## Build proof, not just potential

Choose one useful skill and complete two small projects that show what you can do. A portfolio, case study or documented result gives an employer more to trust than a list of interests.

## Get close to real work

Talk to people doing roles you may want. Use internships, volunteering and student projects to practise working with deadlines and other people.

## Leave with a system

Create a clear CV, a professional email address and a list of organisations to follow. Apply consistently, track every application and keep improving your evidence while you wait.$body$,
   '/editorial/student.jpg', 'Young Ghanaian adults working together on laptops at a University of Ghana workshop', '5 min read', 'Today''s Manual', 'published', false, 101, now()),

  ('start-your-career', 'How to Actually Start Your Career', 'work',
   'Your first role does not need to be perfect. It needs to teach you, expose you and move you forward.',
   $body$## Pick a direction for the next season

You do not need a lifelong plan. Choose a role family you can explore for six months, learn its basic tools and study the language employers use.

## Make applications specific

Connect your evidence to the employer’s needs. Rewrite the top third of your CV for the role and explain the result of your work.

## Treat the search like work

Set weekly targets for conversations, applications and portfolio improvements. Prioritise learning, good management and real responsibility.$body$,
   '/editorial/hero-laptop.jpg', 'Young man working on a laptop', '6 min read', 'Today''s Manual', 'published', false, 102, now()),

  ('grow-faster-at-work', 'How to Grow Faster at Work', 'work',
   'Become easier to trust, easier to work with and more valuable on the problems that matter.',
   $body$## Learn what good means

Ask your manager what success looks like in measurable terms. Confirm priorities, deadlines and the standard expected before you start.

## Close loops

Give short updates before people have to chase you. Raise risks early, bring possible solutions and document decisions.

## Build leverage

Improve one skill that makes your whole team faster. Keep a private record of outcomes so your next performance conversation is based on evidence.$body$,
   '/editorial/office.jpg', 'Attendees preparing for a Young Entrepreneurs Summit in Ghana', '5 min read', 'Today''s Manual', 'published', false, 103, now()),

  ('build-something-of-your-own', 'Build Something of Your Own', 'opportunity',
   'A grounded way to begin freelancing or business without waiting for the perfect idea.',
   $body$## Start with a painful problem

Look for a specific group of people who already spend time or money solving a recurring problem. Speak to them before building.

## Sell the smallest useful result

Define one customer, one problem, one promise and one price. Deliver manually at first so early work teaches you what customers value.

## Protect the basics

Separate business money, record every expense, agree scope in writing and ask for a deposit.$body$,
   '/editorial/buildings.jpg', 'People walking past small businesses on a busy market street in Accra', '6 min read', 'Today''s Manual', 'published', false, 104, now()),

  ('find-your-next-step', 'How to Find Your Next Step When You Feel Lost', 'life',
   'You do not need to solve your whole life today. You need a smaller, testable next move.',
   $body$## Reduce the size of the question

Replace “What should I do with my life?” with “What can I test in the next two weeks?” Clarity usually follows action.

## Use three lists

Write what gives you energy, what you can already do and which problems people need solved. Look for small overlaps.

## Run a low-risk experiment

Take a short course, shadow someone, volunteer or complete a project. Decide whether to continue, change direction or stop.$body$,
   '/editorial/desk.jpg', 'Ghanaian students learning together with a laptop in a classroom', '5 min read', 'Today''s Manual', 'published', false, 105, now()),

  ('voices', 'Voices', 'life',
   'Honest stories from young Africans building careers, businesses and lives in changing times.',
   $body$## Real experience is useful knowledge

Voices is where people tell the part of the story that polished profiles leave out: the uncertainty, wrong turns, money decisions and quiet work behind progress.

## Share your story

We welcome thoughtful first-person accounts with a clear lesson for other readers. Use the Contact page to introduce yourself and your idea.$body$,
   '/editorial/voice.jpg', 'A young Ghanaian man speaking during a University of Ghana workshop', '3 min read', 'Today''s Manual', 'published', false, 106, now()),

  ('about-us', 'About Today’s Manual', 'life',
   'Practical knowledge, honest conversations and useful direction for modern African life.',
   $body$## A guide for the generation building tomorrow

Today’s Manual is an independent publication for young Africans navigating work, money, skills, life and opportunity.

## What we publish

Our work includes practical manuals, explainers, interviews and first-person stories. We care about context, honest trade-offs and actions a reader can take today.

## Made in Africa

We begin with African realities and remain open to useful ideas from everywhere.$body$,
   '/editorial/life.jpg', 'A Ghanaian environmental initiative team gathered around a work table', '3 min read', 'Today''s Manual', 'published', false, 107, now()),

  ('our-mission', 'Our Mission', 'life',
   'To make practical knowledge easier to find, understand and use across Africa.',
   $body$## Useful knowledge should be accessible

Too much important guidance is vague, imported without context or locked behind networks. Today’s Manual exists to close that gap.

## Our promise

We explain the real options, name the trade-offs and give readers a useful next step.$body$,
   '/editorial/opportunity.jpg', 'A diverse group of young Ghanaian adults outside the University of Ghana', '2 min read', 'Today''s Manual', 'published', false, 108, now()),

  ('editorial-principles', 'Editorial Principles', 'skills',
   'The standards we use to make Today’s Manual accurate, useful and worthy of trust.',
   $body$## Accuracy before speed

We verify factual claims, distinguish reporting from opinion and correct material errors clearly.

## Usefulness before noise

Every story should help the reader understand a decision, see an opportunity or take a practical next step.

## Context matters

We name uncertainty, costs and relevant local conditions. Commercial relationships do not buy editorial conclusions.$body$,
   '/editorial/skills.jpg', 'Young Ghanaian women participating in a laptop-based technology workshop', '3 min read', 'Today''s Manual', 'published', false, 109, now()),

  ('write-for-us', 'Write for Us', 'opportunity',
   'Pitch practical, original stories that help young Africans make better decisions.',
   $body$## What we want

We look for reported guides, sharp explainers and honest first-person stories about work, money, skills, life and opportunity.

## How to pitch

Send a short summary, the intended reader, why the story matters now, your reporting plan and links to previous work. Use the Contact page and choose Writing or contribution.$body$,
   '/editorial/desk.jpg', 'Ghanaian students learning together with a laptop in a classroom', '3 min read', 'Today''s Manual', 'published', false, 110, now()),

  ('contributors', 'Contributors', 'life',
   'The writers, editors, photographers and specialists helping build Today’s Manual.',
   $body$## Built with people who know the work

Today’s Manual collaborates with writers, practitioners and subject specialists across Africa.

## Join the network

If you have a useful perspective or area of expertise, introduce yourself through the Contact page and include links to your work.$body$,
   '/editorial/voice.jpg', 'A young Ghanaian man speaking during a University of Ghana workshop', '2 min read', 'Today''s Manual', 'published', false, 111, now()),

  ('the-manual', 'The Manual', 'skills',
   'Deep, practical guides for the decisions that shape work, money and life.',
   $body$## Built to be used

Manuals organise a difficult topic into preparation, action and follow-through. They include checklists, examples and questions you can return to.

## Start here

Begin with The Interview Manual, then explore the Work, Money, Skills, Life and Opportunity sections.$body$,
   '/editorial/interview.jpg', 'Ghanaian broadcaster Anita Erskine taking part in a television interview', '3 min read', 'Today''s Manual', 'published', false, 112, now()),

  ('opportunities', 'Opportunities', 'opportunity',
   'Jobs, scholarships, fellowships, grants and programmes worth your attention.',
   $body$## Opportunity with context

We explain who an opportunity is for, what it requires, the deadline and the cost of applying.

## Check before you apply

Always confirm details on the organiser’s official website. Never pay an unofficial agent for access to a scholarship or job.$body$,
   '/editorial/opportunity.jpg', 'A diverse group of young Ghanaian adults outside the University of Ghana', '3 min read', 'Today''s Manual', 'published', false, 113, now()),

  ('podcast', 'The Today’s Manual Podcast', 'life',
   'Practical conversations about the decisions nobody teaches clearly.',
   $body$## Conversations you can use

The Today’s Manual Podcast is in development. It will bring together practitioners and honest personal stories across work, money, skills, life and opportunity.

Use the Contact page to suggest a guest, a question or a partnership.$body$,
   '/editorial/voice.jpg', 'A young Ghanaian man speaking during a University of Ghana workshop', '2 min read', 'Today''s Manual', 'published', false, 114, now()),

  ('videos', 'Today’s Manual Videos', 'skills',
   'Clear visual explainers and practical conversations, made for the way people learn now.',
   $body$## Watch, understand, act

Our video library is in development. New explainers and interviews will turn the most useful parts of Today’s Manual into concise visual lessons.

Follow our official social channels for the first releases.$body$,
   '/editorial/interview.jpg', 'Ghanaian broadcaster Anita Erskine taking part in a television interview', '2 min read', 'Today''s Manual', 'published', false, 115, now()),

  ('advertise', 'Advertise with Today’s Manual', 'opportunity',
   'Reach an ambitious audience with useful, clearly labelled commercial work.',
   $body$## Work that respects the reader

We consider advertising and sponsorship from organisations relevant to our audience. Paid placements are clearly labelled and do not determine independent editorial conclusions.

## Start a conversation

Use the Contact page and choose Advertising or commercial enquiry.$body$,
   '/editorial/buildings.jpg', 'People walking past small businesses on a busy market street in Accra', '2 min read', 'Today''s Manual', 'published', false, 116, now()),

  ('partner-with-us', 'Partner with Us', 'opportunity',
   'Build useful programmes, research and stories for the generation shaping Africa’s future.',
   $body$## What partnership can look like

We are open to editorial series, research, events, learning resources and distribution partnerships that create clear value for readers.

## Tell us what you want to build

Use the Contact page with your organisation, the problem you want to solve and the outcome you want to create.$body$,
   '/editorial/work.jpg', 'Ghanaian professionals and students collaborating around laptops at a workshop', '2 min read', 'Today''s Manual', 'published', false, 117, now()),

  ('privacy-policy', 'Privacy Policy', 'life',
   'How Today’s Manual collects, uses and protects information you choose to share.',
   $body$## Information we collect

When you subscribe or contact us, we collect the information you submit. Our providers may process basic technical logs needed to operate and protect the website.

## How we use it

We use information to deliver requested updates, answer enquiries, operate the publication and prevent abuse. We do not sell personal information.

## Your choices

You may unsubscribe or contact us to ask about correction or deletion of information you submitted. This policy was last updated on 14 August 2026.$body$,
   '/editorial/life.jpg', 'A Ghanaian environmental initiative team gathered around a work table', '4 min read', 'Today''s Manual', 'published', false, 118, now()),

  ('terms-of-use', 'Terms of Use', 'life',
   'The basic terms for accessing and using Today’s Manual.',
   $body$## Using the publication

Today’s Manual provides general educational and editorial information, not personal legal, medical or financial advice.

## Our work

You may share links and short attributed excerpts. Republishing substantial original material requires written permission.

## Availability and conduct

We may update, correct or remove material. Do not misuse the website or submit unlawful, abusive or deceptive content. These terms were last updated on 14 August 2026.$body$,
   '/editorial/life.jpg', 'A Ghanaian environmental initiative team gathered around a work table', '4 min read', 'Today''s Manual', 'published', false, 119, now())
on conflict (slug) do nothing;

update public.site_settings
set value = jsonb_set(
  value,
  '{footerColumns}',
  (
    select jsonb_agg(
      case
        when footer_column->>'title' = 'Support' then
          jsonb_set(
            footer_column,
            '{links}',
            (
              select jsonb_agg(
                case
                  when footer_link->>'label' = 'Contact Us' then jsonb_set(footer_link, '{href}', to_jsonb('/contact'::text))
                  else footer_link
                end
              )
              from jsonb_array_elements(footer_column->'links') as footer_link
            )
          )
        else footer_column
      end
    )
    from jsonb_array_elements(value->'footerColumns') as footer_column
  )
), updated_at = now()
where key = 'site_config';

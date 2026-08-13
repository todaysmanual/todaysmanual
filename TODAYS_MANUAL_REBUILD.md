# Today’s Manual homepage rebuild

## Project outcome

The former single-screen “Coming Soon” experience was rebuilt as the complete editorial homepage shown in the supplied reference. The implementation stays inside the existing Next.js/Vinext project, keeps the original logo assets and newsletter endpoint, and uses the project’s existing Geist and Geist Mono typefaces.

The new homepage is a data-driven publication interface for Work, Money, Skills, Life and Opportunity. It includes the complete page from the issue bar and navigation through the footer, plus reusable category and article destinations so cards do not point to broken pages.

## Design system implemented

- Warm paper background: `#f7f3ec`
- Primary dark navy: `#071a38`
- Orange editorial accent: `#ff5c2b`
- Fine navy borders with low opacity for the magazine grid
- Bold Geist headlines with tight editorial spacing
- Geist Mono for issue information, labels, read times and section metadata
- Mostly square or lightly rounded cards, minimal shadows and no glass-card treatment
- High-contrast orange and navy calls to action
- Restrained image zoom, arrow movement and overlay transitions
- A reduced-motion rule that disables transitions for users who request it

The layout uses one capped page shell so desktop whitespace stays controlled on wide screens. The primary desktop hero uses a three-column editorial grid, while smaller screens are deliberately recomposed rather than proportionally shrunk.

## Header and navigation

`app/components/Header.tsx` now provides:

- A narrow issue bar with “Today in the Manual,” AI, Careers, Money, Ghana and Business topics
- A dynamic Accra-time date and Issue 001 label
- The existing Today’s Manual logo asset
- Desktop links for Work, Money, Skills, Life and Opportunity
- Search, The Manual and Subscribe controls
- A sticky header with a subtle backdrop blur
- A mobile drawer with numbered category links and a Morning Manual call to action
- Escape-key support for closing the mobile menu and search
- Page scroll locking while either overlay is open
- Automatic focus on the search input when search opens

The search control opens a full-screen editorial search overlay. It includes the requested question, a large search field and the requested popular topics. Topic chips are filtered on the client as the user types. Every result leads to the reusable article route, where a graceful preview is shown if a full article does not exist yet.

## Homepage sections

### Editorial hero

`app/components/HeroStory.tsx` implements:

- The Work / Career category label
- The exact “Nobody Told Us What Happens After University.” headline with orange period
- The supplied supporting paragraph
- Today’s Manual byline, read time and Featured metadata
- A working “Read the story” link
- A large central editorial image with an overlaid Featured label
- Money and Skills side stories with image overlays, read times and working links
- `object-fit: cover` image behavior and crop control

At mobile widths, CSS `display: contents` is used only for composition: category and headline come first, the image comes next, then supporting copy and action, followed by the two secondary stories.

### Start Here

`app/components/StartHere.tsx` provides five data-driven cards for school, graduation, work, building something and feeling lost. Each card includes a coloured circular SVG icon, heading, description and arrow. A restrained SVG route graphic sits behind the cards, using a dashed line and waypoint circles rather than a decorative bitmap.

### The Five Manuals

`app/components/Manuals.tsx` renders the five vertical manual cards from data. The implemented colours are orange, dark green, deep blue, muted purple and ochre. Each card includes a title, local image, description and Explore link. On tablet and mobile, the cards become a deliberately sized horizontal editorial rail with scroll snapping.

### Quick Reads

`app/components/QuickReads.tsx` creates the five-card numbered magazine strip. Every card has a local image, large index, title, read time and hover treatment. The strip becomes horizontally scrollable at tablet and mobile widths while keeping readable fixed card widths.

### Lower editorial grid

`app/components/LowerEditorial.tsx` contains three independent sections:

- “3 things you should know today” with numbered data objects
- Voices, with portrait treatment, quote card and a five-position carousel indicator prepared for future carousel state
- The Manual, with a dimensional handbook cover for “The Interview Manual” and an adjacent editorial photograph

### Newsletter

`app/components/Newsletter.tsx` wraps the existing newsletter implementation in the requested dark navy conversion bar. It uses the existing `/api/waitlist` endpoint rather than creating a fake submission. The form validates email addresses, handles loading and error states, keeps the honeypot field, and shows an SVG mail confirmation mark on success.

### Footer

`app/components/SiteFooter.tsx` implements the full dark editorial footer with:

- The existing Today’s Manual wordmark, rendered in white through CSS
- The complete publication description
- SVG icons for Instagram, X, TikTok, LinkedIn and YouTube
- Explore, About, Resources and Support columns
- Current-year copyright text
- “Made in Africa for the world we live in.” and the orange square accent

## Content architecture

`app/data/homepage.ts` contains the homepage content separately from presentation. It defines and exports reusable types and collections for:

- `Article`
- `StartHereItem`
- `Manual`
- `DailyBriefItem`
- Hero and secondary stories
- Start Here cards
- The five manuals
- Quick reads
- Daily briefs
- Popular search topics
- Valid category names

All temporary image paths are centralized in this layer where the content is data-driven. This makes a future CMS connection possible without rewriting the visual components.

## SVG and emoji policy

No emoji are used anywhere in the interface. `app/components/Icon.tsx` contains the shared stroke-based SVG icon system used for:

- Navigation and close controls
- Search
- Arrows and dropdowns
- School, briefcase, growth, idea and compass states
- Newsletter mail
- Instagram, X, TikTok, LinkedIn and YouTube

All decorative SVG elements are marked as hidden from assistive technology. All icon-only buttons and links have readable accessible labels.

## Routing added

### Category route

`app/[category]/page.tsx` validates the route against Work, Money, Skills, Life and Opportunity and uses `app/components/CategoryPage.tsx` as the single shared category template. The resulting routes are:

- `/work`
- `/money`
- `/skills`
- `/life`
- `/opportunity`

### Article route

`app/article/[slug]/page.tsx` is a shared future-ready article template. Known homepage stories use their existing title, category, image, description and read time. Unknown topic slugs receive a clean, human-readable title and an intentional “article preview” state instead of a 404 or broken destination.

## Responsive behavior

The stylesheet includes specific structural changes for the requested viewport range:

- 1920px and wider: wider capped publication shell, larger hero image and more generous card heights
- 1280px–1440px: full three-column hero and five-column editorial card rows
- 1024px: compact navigation spacing and adjusted hero proportions
- 768px: two-column hero with secondary stories below; horizontal Start Here, Manuals and Quick Reads rails; two-column lower editorial grid
- 430px, 390px, 375px and 320px: compact issue bar, logo/search/menu navigation, reordered single-column hero, full-width actions, scroll-snapped card rails, stacked lower editorial grid and two-column or single-column footer based on available width

Global horizontal overflow is prevented. Images have explicit intrinsic dimensions and controlled aspect ratios. Buttons and icon controls retain touch-friendly sizes, and page padding never collapses against the viewport edge.

## Image assets

The existing logo files remain unchanged:

- `public/todaysmanual1.png`
- `public/todaysmanuallogo.png`

Editorial images are stored locally in `public/editorial/` so components do not contain scattered remote image URLs. Temporary editorial photography was downloaded from Unsplash image delivery URLs and is intentionally isolated for easy CMS replacement:

- `student.jpg`
- `money.jpg`
- `skills.jpg`
- `work.jpg`
- `life.jpg`
- `opportunity.jpg`
- `cash.jpg`
- `desk.jpg`
- `office.jpg`
- `buildings.jpg`
- `interview.jpg`
- `voice.jpg`

The direct source IDs used were `photo-1694175271713-a6e2cc378980`, `photo-1579621970563-ebec7560ff3e`, `photo-1515879218367-8466d910aaa4`, `photo-1573164574397-dd250bc8a598`, `photo-1500534314209-a25ddb2bd429`, `photo-1519999482648-25049ddd37b1`, `photo-1561414927-6d86591d0c4f`, `photo-1455390582262-044cdead277a`, `photo-1497366754035-f200968a6e72`, `photo-1486406146926-c627a92ad1ab`, `photo-1521791055366-0d553872125f` and `photo-1519085360753-af0119f7cbe7`.

## Social preview

`public/og.png` is a bespoke Today’s Manual social preview created for this finished visual direction. It reuses the cream, navy and orange palette, editorial grid, publication name, category system and “The guide for what comes next” positioning. The asset is connected to Open Graph and X metadata in `app/layout.tsx`.

Image generation method: built-in image generation, using the supplied homepage image as a design reference. The final prompt requested a 1200 × 630 premium editorial social card for an African youth publication, with a warm paper background, dark navy magazine rules, orange registration marks, a young Black African professional in Accra, and the exact Today’s Manual headline and category text. It explicitly excluded gradients, glassmorphism, emoji, watermarks and invented logos.

## Metadata and accessibility

`app/layout.tsx` now includes:

- Finished homepage title and description
- `metadataBase` for absolute production URLs
- Open Graph title, description, site name and social image
- X large-image card metadata
- Existing logo-based favicon and touch icon
- Cream browser theme colour

Semantic landmarks include header, nav, main, article, section and footer. Images have descriptive alt text. Buttons use button elements, navigation destinations use links, icon-only controls have `aria-label` text, search has an explicit label, focus indicators are visible, overlays close with Escape and motion respects `prefers-reduced-motion`.

## Removed and cleaned up

- Removed the former `Hero.tsx` coming-soon component
- Removed the former `RouteBackground.tsx` route illustration
- Replaced the old coming-soon CSS with the complete editorial design system
- Removed the unused `framer-motion` dependency after the previous animated hero was deleted
- Removed three unused temporary image downloads created during image selection
- Updated stale coming-soon tests to cover the completed homepage
- Kept the existing Resend newsletter endpoint and did not create a competing or fake API

## Verification completed

- `npm run lint`: passes with no errors or warnings
- `npm test`: passes both server-rendering and production-style checks
- `npm run build`: completes successfully for the homepage, category route, article route and waitlist API
- HTTP route checks returned 200 for `/`, all five category routes, a known article and a fallback topic article
- Automated tests confirm the main homepage sections, logo assets, local editorial image, Open Graph image, responsive breakpoints, reduced-motion handling, search styling and removal of the old coming-soon content

The in-app browser connection was unavailable during the final run, so screenshot-based browser comparison and live click automation could not be completed in that environment. Functional overlay logic, responsive recomposition and interaction states were verified through the implementation, build, server rendering and route checks. No browser-only result is claimed in this document.


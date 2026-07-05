
# Learn Hub — Add-on Plan (no pivot, only additions)

Existing tree-sales + marketplace model stays exactly as-is. We add a **free learning layer** on top to bring organic traffic and repeat visits. Monetization unchanged — every learn page ends with a soft "Plant a tree ₹269" CTA.

---

## What we add

### 1. `/learn` — new hub page
Single entry point linking four sub-sections below. Added as a new navbar item ("Learn"). Homepage untouched except one small "Explore Learn Hub" strip near the FAQ section.

### 2. Tree Species Encyclopedia (expand existing `/trees/:slug`)
Already have basic species pages. Upgrade each with:
- Care guide (watering, soil, spacing, pruning)
- Climate fit (altitude, rainfall, best season)
- Ecological benefits (CO₂ estimate, wildlife, soil)
- "Plant this species" CTA → checkout
- Related species carousel

New index page `/learn/trees` browsable by climate/use-case.

### 3. Short Lessons — `/learn/lessons`
5–10 min read+quiz lessons. Seed with 10:
- Composting at home, Rainwater harvesting, Kitchen garden basics, Reading a carbon footprint, Monsoon planting guide, Native vs exotic trees, Soil health 101, Zero-waste kitchen, Plastic-free swaps, Climate change basics (India lens)

Each lesson: markdown-style content + 3-question quiz + completion badge (stored per user). Anonymous users can read; badge requires login.

**DB:** `lessons` (slug, title, body, category, read_minutes, quiz_json), `lesson_completions` (user_id, lesson_id, score, completed_at). Admin tab to add/edit lessons.

### 4. Daily Eco-Tip + Streak — `/learn/daily`
- One tip per day (deterministic by date from a pool of 100+ tips)
- Logged-in users get a streak counter (consecutive days visited)
- Share-as-image card (reuse ShareButtons)
- Streak of 7 → auto-credit ₹10 wallet bonus (drives retention → tree purchase)

**DB:** `eco_tips` (id, title, body, category, image_url), `user_streaks` (user_id, current_streak, longest_streak, last_visit_date).

### 5. Reels/Videos — `/learn/videos`
Vertical video grid (YouTube Shorts / hosted mp4 embeds). Admin curates.
- Farmer stories, plantation site walkthroughs, DIY sustainability
- Each video: title, description, embed_url, category
- No upload infra — admins paste YouTube/Vimeo URLs

**DB:** `videos` (id, title, description, embed_url, thumbnail_url, category, order).

---

## Small connective changes

- **Navbar:** add "Learn" dropdown (Trees Wiki, Lessons, Daily Tip, Videos)
- **Homepage:** one lightweight strip after FAQ — "New: Learn Hub" card grid (4 tiles). No hero/section rewrite.
- **Profile page:** new "My Learning" tab — badges earned, streak, quiz scores
- **SEO:** each lesson + tip + video page gets its own metadata, JSON-LD `Article`/`VideoObject`; add to sitemap generator
- **llms.txt:** add `/learn/*` routes

---

## What we do NOT touch
- Auth, payments, wallet logic (except the streak-bonus wallet credit which reuses existing wallet infra)
- Homepage hero, existing sections, existing pricing
- Marketplace, gift cards, campaigns, farmer/vendor flows
- RBAC (admin edits new tables via existing admin panel pattern)

---

## Delivery order (sprints)

**Sprint 1 — Foundation (build first)**
- `/learn` hub page + navbar entry + homepage strip
- Migration for `lessons`, `lesson_completions`, `eco_tips`, `user_streaks`, `videos` tables with RLS + GRANTs
- Admin tabs for Lessons, Eco-Tips, Videos (reuse existing admin pattern)

**Sprint 2 — Lessons + Daily Tip**
- `/learn/lessons`, `/learn/lessons/:slug` with quiz + completion badge
- `/learn/daily` with streak tracker + 7-day wallet bonus
- Seed 10 lessons + 30 tips

**Sprint 3 — Trees Wiki upgrade + Videos**
- Expand `/trees/:slug` sections (care, climate, benefits)
- `/learn/trees` index with filters
- `/learn/videos` grid + admin curation

**Sprint 4 — Polish**
- Profile "My Learning" tab
- SEO metadata + sitemap + llms.txt
- Share cards for daily tip + badge earned

---

## Technical notes
- All new tables in `public` schema with `service_role` ALL + `authenticated` SELECT (public reads via `anon` SELECT for lessons/tips/videos content; completions/streaks scoped to `auth.uid()`)
- Streak calc via edge function `update-streak` called on `/learn/daily` visit for logged-in users
- Wallet bonus at 7-day streak reuses existing wallet transaction pattern with source `streak_bonus`
- Content edited via existing TipTap RichTextEditor in admin
- Language toggle (EN/HI) supported via existing `useLanguage` pattern — content fields have `_hi` variants

---

## Confirm before I build
Tell me which sprint to start (default: **Sprint 1**), or if you want to reorder / drop any of the four learn modules (Encyclopedia / Lessons / Daily Tip / Videos).

# Cinematic Learn Page — Sustainability Best Practices (Individual Level)

Ek naya scrollytelling page: **`/learn/sustainability-habits`** — same cinematic language jaisa `/learn/why-trees-matter` aur `/learn/how-we-plant`, but **zero AI images**. Sirf framer-motion + CSS gradients + SVG + emoji/lucide icons se stunning visual experience.

## Concept

7 chapters of daily-life sustainability habits — har chapter ka apna colour mood (water=blue, energy=amber, food=green, waste=stone, transport=sky, consumption=rose, community=emerald). Har section me ek "hero stat" + 3-4 actionable habits + ek visual metaphor (pure CSS/SVG animated).

Tone: emotional, honest, action-oriented. No greenwashing, no false claims. Sab numbers "estimate" label ke saath.

## Page Structure (7 chapters)

1. **Intro — "Choti aadatein, badi lehar"**
   - Full-viewport dark gradient hero, kinetic typography reveal
   - Animated SVG ripple (concentric circles expanding) as the sensory metaphor
   - Scroll cue

2. **Paani — Water habits** (blue mood)
   - Big animated stat: "1 dripping tap = ~15 L/day" (count-up)
   - 4 habit cards: shorter showers, bucket-not-hose, RO reject-water reuse, fix leaks
   - Visual: SVG water drop that fills/empties on scroll (useScroll)

3. **Bijli — Energy habits** (amber/warm mood)
   - Stat: fan vs AC, LED vs bulb, standby-power drain — animated bar comparison
   - 4 habits: unplug chargers, AC at 24°C, natural light, star-rated appliances
   - Visual: animated sun→bulb→lightning SVG morph

4. **Khaana — Food habits** (green mood)
   - Stat: food waste per household (est.), meat vs plant footprint
   - 4 habits: local/seasonal, meatless days, compost kitchen scraps, portion planning
   - Visual: plate SVG that fills with veggie icons on stagger

5. **Kachra — Waste & plastic** (stone/neutral mood)
   - Stat: single-use plastic per person/year (est.)
   - 4 habits: cloth bag, steel bottle, refuse straws, segregate wet/dry
   - Visual: SVG bin with items sorting animation

6. **Aana-Jaana — Transport** (sky mood)
   - Stat: 1 km walk saved vs car (CO2 estimate)
   - 4 habits: walk <2km, carpool, public transport, combine errands
   - Visual: horizontal parallax road with animated cycle/bus/car icons

7. **Kharidari — Mindful consumption** (rose mood)
   - Stat: fast fashion footprint
   - 4 habits: repair-before-replace, second-hand, quality > quantity, digital declutter
   - Visual: closet/cart SVG with hover reveal

8. **Finale — "Aaj se ek aadat"**
   - Interactive: user picks ONE habit from a grid → confetti + share card
   - CTA: `/learn` (more lessons) + `/climate-impact-pack` (compound the habit with a tree)

## Visual/Tech Approach

- **No AI-generated images.** Backgrounds = layered CSS radial/linear gradients + noise texture + blurred coloured blobs (motion `useTransform` for parallax feel).
- **Icons** = lucide-react (already in project) + inline SVGs for water drop, ripple, bin, road.
- **Animations** = framer-motion: `useScroll`, `useTransform`, `useInView`, stagger children, count-up numbers.
- **Kinetic typography** = word-by-word reveal, oversized display headings, mixed English/Hindi (via `useLanguage`).
- **Interactive finale** = local `useState` grid + emoji burst; no DB writes.
- **Perf**: single page component, no external image fetches, `prefers-reduced-motion` respected.
- **SEO**: `<SEO>` component with title/desc, Article JSON-LD, sitemap entry.

## Files (technical section)

Create:
- `src/pages/LearnSustainabilityHabits.tsx` (~650 lines, 8 internal section components + shared count-up hook inline)

Edit:
- `src/App.tsx` — lazy import + route `/learn/sustainability-habits`
- `src/pages/Learn.tsx` — add featured tile linking to it
- `src/components/home/LearnHubStripSection.tsx` — optional 6th tile (or swap in place of one)
- `public/sitemap.xml` — add URL
- `public/llms.txt` — one-line mention

No DB changes, no edge functions, no new packages (framer-motion + lucide already installed).

## Guardrails

- All stats labelled `(estimate)` — sourced qualitatively, not fabricated authorities.
- No pilot-cohort / farmer claims on this page — pure education, no product pitch until the finale CTA.
- Bilingual copy via existing `useLanguage` hook.

## Out of scope

- No new tables, no user tracking of picked habit (client-only state).
- No new AI image generation.
- No changes to homepage hero or other learn pages.

Bata do — build mode me switch karo to main ek shot me sab bana dunga.

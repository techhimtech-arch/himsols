# Stunning Visual Sustainability Page — Plan

Ek naya immersive scroll-experience page banayenge: **`/learn/why-trees-matter`** (ya `/experience`) — 100% static content, but cinematic visuals + framer-motion animations. Mobile pe bhi buttery smooth chalega.

## Concept
Ek "scrollytelling" journey — jaise Apple product page ya Stripe landing. User scroll karta jaayega, aur har section pe visuals reveal honge, numbers count-up honge, images parallax karengi, trees "grow" honge. End pe CTA: "Plant your first tree — ₹269".

## Page Structure (7 scroll chapters)

1. **Hero — "Ek ped, ek zindagi"**
   - Fullscreen dark forest gradient bg + floating leaf particles (framer-motion)
   - Massive kinetic typography: word-by-word reveal
   - Subtle scroll indicator

2. **The Crisis — India ka carbon footprint**
   - Animated counter: "2.9 billion tonnes CO₂/year"
   - Bar chart bars grow on scroll (framer-motion `useInView`)
   - Split-screen: dry land → green land (image reveal on scroll)

3. **What one tree does — "22 kg CO₂/year"**
   - Circular progress ring animates as you scroll
   - Icon grid: oxygen, shade, soil, wildlife, water — each icon springs in with stagger
   - Sensory metaphor: tree silhouette that "grows" from sapling to full canopy as user scrolls

4. **The Himachal advantage**
   - Parallax mountain layers (3-4 image layers moving at different speeds)
   - Map of HP with pin drops animating one by one (Shimla, Manali, Dharamshala…)
   - Native species cards horizontal scroll with hover tilt

5. **Your impact multiplied**
   - Interactive slider: "Plant [10] trees" → live updates CO₂ offset, oxygen, years of impact
   - Confetti burst when slider crosses milestones

6. **Real stories — before/after**
   - Image comparison sliders (drag to reveal barren → forested)
   - Farmer quote cards fading in with photos

7. **CTA finale**
   - Fullscreen: "Ab tumhari baari"
   - Animated tree that fully blooms
   - Two CTAs: "Plant a Tree ₹269" · "Corporate CSR"

## Tech Approach

- **framer-motion** already available — use `motion`, `useScroll`, `useTransform`, `useInView`, `AnimatePresence`, stagger children
- **All static** — no DB calls, no auth checks, super fast
- **Assets needed**:
  - 6–8 hero-quality images (forest, mountains, sapling, farmer, before/after pairs) — I'll generate via imagegen (premium tier for the hero)
  - 1 tree SVG that can morph sapling → tree (custom crafted)
- **Performance**: lazy-load images, `will-change` on animated elements, `prefers-reduced-motion` respected
- **Bilingual**: English + Hindi via existing `useLanguage` hook
- **SEO**: full JSON-LD Article schema, `/learn/why-trees-matter` in sitemap, meta tags, added to Learn Hub tiles

## Routing & Integration

- New route `/learn/why-trees-matter` in `App.tsx`
- Add tile in `Learn.tsx` and `LearnHubStripSection.tsx`
- Add to `public/sitemap.xml` + `llms.txt`
- Homepage: subtle "Experience the story →" link near LearnHubStrip

## Deliverables

1. New page `src/pages/LearnWhyTreesMatter.tsx` (~700 lines, one file, all sections as internal components)
2. 6–8 generated images stored via `lovable-assets`
3. Custom SVG components for tree-growth + leaf particles
4. Route + nav + sitemap wiring

## What I need from you (before I build)

Bhai bas 2 chhote decisions:

1. **Page ka focus** — pure inspirational/emotional ("why trees matter"), ya educational ("how our plantation works, step by step with visuals")? Ya dono mila ke?
2. **Length** — ek lambi cinematic page (7 chapters, ~3 min scroll), ya chhoti 3-section stunner (~1 min)?

Bata do, phir main build mode me sab kuch banata hoon — images generate, animations code, sab.

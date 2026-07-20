## Goal
Homepage ko top-notch 3D-feel destination banao — hero pe ek real WebGL scene (floating low-poly tree + orbiting stat cards), aur baaki sections layered parallax + tilt cards + kinetic type. Brand-locked: Forest Green (#2e8b57), honest pilot-phase copy, ₹269 tree pack CTA intact. Motion register 3/5 — cinematic but not seizure-y.

## What the user sees

```text
┌─────────────────────────────────────────────────┐
│  NAVBAR (unchanged)                             │
├─────────────────────────────────────────────────┤
│  HERO (WebGL canvas, ~92vh)                     │
│                                                 │
│    "Verified plantation           ╭─────────╮   │
│     in Himachal."                 │ 🌲 3D   │   │
│    Pilot cohort · Monsoon 2026    │  tree   │   │
│                                   │ rotates │   │
│    [Plant a tree · ₹269]          ╰────┬────╯   │
│    [CSR partnership]              orbit stats   │
│                                   ₹269 / 50 /7  │
├─────────────────────────────────────────────────┤
│  SCROLL SCENES (faux-3D, sticky parallax)       │
│   1. "Where your tree lives" — HP valley SVG    │
│      layered mountains, drifting clouds         │
│   2. "How we verify" — 4 tilt cards, mouse-3D   │
│   3. Impact counters (existing, kept)           │
│   4. Trust / testimonials (existing, kept)      │
│   5. CSR band + FAQ (existing, kept)            │
└─────────────────────────────────────────────────┘
```

## Scope

**Rebuild:** `src/components/home/HeroSection.tsx` (WebGL hero replaces current parallax hero).
**New:** `src/components/home/WhereTreeLivesScene.tsx` (faux-3D valley scrollytelling), `src/components/home/HowWeVerifyTilt.tsx` (mouse-tilt cards).
**Edit:** `src/pages/Index.tsx` to slot the two new sections above the existing impact/testimonial/FAQ blocks.
**Untouched:** all business logic, routes, DB, auth, pricing, CTAs, existing impact/testimonial/CSR/FAQ sections, footer, navbar.

## Technical notes

- Stack: `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0` + `three@^0.160` (versions per project constraints, React 18 compatible). Existing `framer-motion` reused.
- Hero canvas is lazy-loaded via `React.lazy` + `<Suspense fallback={<StaticHeroFallback/>}>`; fallback is a static gradient + headline so LCP stays fast and no-WebGL devices still convert.
- Tree = low-poly procedural mesh (cone trunk + 3 icosahedron foliage clusters) — no external GLB, zero asset weight beyond the three.js bundle. Slow y-rotation + subtle float (sin-wave). `dpr={[1, 1.5]}`, `frameloop="demand"` on idle, `powerPreference: "high-performance"`.
- Orbit stats = 3 HTML cards positioned with `@react-three/drei` `<Html>` on invisible orbit points, so text stays crisp and accessible.
- Mobile: canvas renders at reduced dpr; if `matchMedia('(max-width: 640px)')` or `prefers-reduced-motion`, fall back to a static styled hero (no canvas mount at all) — protects low-end phones.
- Faux-3D sections: pure CSS 3D transforms + `framer-motion` `useScroll` / `useTransform`. No new deps.
- Copy: keep every honest pilot line as-is — "Pilot cohort · Monsoon 2026", "50 farmer partners", "7 districts", ₹269. No new claims.
- SEO: hero `<h1>` stays a real DOM element behind/around the canvas (canvas is `aria-hidden`), so crawlers and screen readers get the same headline.
- Perf budget: hero JS chunk ≤ ~180KB gzipped (three+r3f+drei tree-shaken). Verified after build.

## Verification

1. `bun add three@^0.160 @react-three/fiber@^8.18 @react-three/drei@^9.122.0` — build must pass.
2. Playwright at 1280×900 desktop + 390×844 mobile: screenshot hero, confirm tree renders on desktop and static fallback renders on mobile; zero console errors; LCP element still the headline.
3. Manually confirm `prefers-reduced-motion` path renders static hero.
4. Confirm CTAs (`/checkout?pack=single-tree`, CSR link) still fire.

## Out of scope
Homepage business logic, pricing, auth, DB, CSR proposal PDF, other Learn pages. Sirf homepage visual layer.

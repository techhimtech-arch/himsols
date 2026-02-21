

# Himsols Website x Pitch Alignment Plan

## Goal
Update the website to reflect the pitch narrative so that when jury/investors visit the site, they see the same story. Focus on content alignment and adding missing narrative sections.

## Changes Overview

### 1. About Us Page Overhaul
Replace current generic About Us content with the pitch's powerful narrative structure:
- **Problem Statement section**: "India plants millions of trees but most don't survive"
- **Solution section**: The 4-pillar Himsols model (farmers + CSR + tracking + employment)
- **How It Works**: Village campaign registration flow (4 steps from pitch)
- **Impact Numbers section**: Use milestone items from database but add pitch framing
- **Vision section**: "Every village should have a digital green identity"

This will use the existing `homepage_sections` and `homepage_items` database tables with new section keys.

### 2. Homepage Hero & Trust Section Updates
- Update `HeroSection.tsx` tagline to include "plant survival" language from pitch
- Update `WhyTrustSection.tsx` trust points to match pitch claims:
  - "No middlemen" stays
  - Add "Focus on survival, not just planting"
  - Add "Rural employment generation"
  - Add "Village-level structured programs"

### 3. New "Impact Dashboard" Section on Homepage
Create a public-facing impact summary section showing:
- Trees planted (from live_stats table)
- Villages covered
- Farmers supported  
- Survival rate percentage
This data already exists in the `live_stats` table - just needs better presentation matching the pitch.

### 4. Services Page Update
Add "Village Greening Programs" as a new service card in `Services.tsx` to match the pitch's core offering of structured village campaigns.

---

## Technical Details

### Files to Modify
1. **`src/pages/AboutUs.tsx`** - Major rewrite with pitch narrative sections (Problem, Solution, How It Works, Market, Impact, Vision). Will still fetch from `homepage_sections` table but add hardcoded pitch content as fallback.

2. **`src/components/home/HeroSection.tsx`** - Minor text updates:
   - Subtitle: Add "with verified survival tracking" 
   - Trust line: "Focused on tree survival, not just plantation"

3. **`src/components/home/WhyTrustSection.tsx`** - Update trust points array to match pitch claims

4. **`src/pages/Services.tsx`** - Add 5th service card for "Village Greening Programs"

5. **`src/components/home/LiveStatsSection.tsx`** - Add "Survival Rate" and "Villages Covered" if available in live_stats

### Database Changes
- No schema changes needed - existing `homepage_sections`, `homepage_items`, and `live_stats` tables can support all content
- New section_key values may need to be inserted via admin panel for About Us sections

### No Breaking Changes
- All updates are content/text changes
- Existing functionality remains untouched
- Admin panel can still manage all dynamic content


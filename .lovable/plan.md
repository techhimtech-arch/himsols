# Plan: Dynamic Scrap Pricing + School Partnership Program

## 1. Remove hardcoded prices in Scrap → Wallet section

**File:** `src/components/home/ScrapToWalletSection.tsx`

- Currently `treesPossible = Math.floor(credit / 299)` and step 3 shows "Starting at ₹299" — both hardcoded.
- Fetch the live minimum tree price from `trees` table (same pattern as `HeroSection`) via a small `useMinTreePrice` query.
- Use it for:
  - `treesPossible` calculation (`credit / minPrice`)
  - "Starting at ₹{minPrice}" label in step 3 of the flow
- Scrap rates per kg already come from `scrap_types` DB — no change there.

## 2. New: School & Education Partnership Program (functional, not just a contact link)

Goal: schools, colleges, NGOs can apply to partner with Himsols for plantation drives + kids' sustainability workshops, and admin can manage the leads.

### 2a. Database (migration)
New table `school_partnerships`:
- `institution_name`, `institution_type` (school / college / NGO / other)
- `contact_person`, `email`, `phone`
- `city`, `state`, `student_count` (int)
- `program_interest` (text[] — plantation drive, sustainability workshop, scrap drive, eco-club setup)
- `preferred_date` (date, nullable), `message` (text)
- `status` enum: new, contacted, scheduled, completed, cancelled (default `new`)
- standard `id`, `created_at`, `updated_at`

RLS:
- Public can `INSERT` (so anyone can submit the form)
- Only `super_admin` / `limited_admin` can `SELECT` / `UPDATE` / `DELETE` (use existing `has_role`)

### 2b. Public page `/schools` (`src/pages/SchoolProgram.tsx`)
Sections:
- Hero: "Bring sustainability into your classroom" + bilingual (en/hi)
- 3-program cards: Plantation Drive · Sustainability Workshop · Eco-Club Setup
- "How it works" 4-step strip (Apply → Visit → Plant/Teach → Report)
- Impact strip (live counts: schools onboarded, kids reached, trees planted via schools — sourced from `school_partnerships` count + completed status; if empty show "Be the first")
- Application form (the table above) with validation, success toast, redirects to track-request style confirmation
- SEO meta + JSON-LD `EducationalOrganization` schema

### 2c. Homepage integration
- Update `ActionableServicesSection.tsx`: change "Conservation Training" card to **"Schools & Education"** with link `/schools` (keeps grid intact).
- Add a compact `SchoolProgramSection.tsx` between Partner Farmer and Testimonials on `Index.tsx` with photo + 3 bullets + "Apply for your school" CTA → `/schools`.

### 2d. Admin
New tab `SchoolPartnershipsTab.tsx` under existing Admin shell:
- List view (table on desktop, MobileCard on mobile)
- Filter by status, search by institution
- Status update dropdown, view full message in dialog
- Register tab in `src/pages/Admin.tsx` alongside other lead tabs

### 2e. Routing
Add `/schools` route in `src/App.tsx` (lazy loaded, matching existing pattern).

## 3. Navigation
- Add "Schools" link to Navbar's primary menu (via existing dynamic navigation if managed there, otherwise the static fallback list) and the Footer's "Programs" column.

## 4. Out of scope
- No payment flow for schools (free program; lead-gen only).
- No changes to scrap rates logic (already DB-driven).
- No changes to auth.

## Technical notes
- Reuse `useMinTreePrice` pattern, `useAuthSafe`, `useLanguage`, `useToast`, shadcn Form/Input/Textarea/Select/Card components.
- Bilingual strings inline (en + hi) per existing convention.
- Form does not require login — public insert with RLS allowing anon insert, similar to `contact_messages`.
- Live impact counts on `/schools` use a single supabase count query, cached 5 min.

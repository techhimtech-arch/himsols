

# Sab Features Ek Saath - Complete Green Infrastructure System

## Kya Banana Hai

Website pe jo bhi claim kiya hai pitch mein - Village Onboarding, CSR Partner Onboarding, Survival Tracking, Nursery Partnerships - sab ko real working features banana hai. Abhi sirf content hai, functionality nahi hai.

## 4 Major Systems Banenge

### 1. Village Onboarding System
- Ek naya "villages" table banega database mein
- Public form jahan village/panchayat register kar sake (village name, district, state, contact person, phone, trees needed)
- Admin panel mein "Villages" tab add hoga jahan admin approve/reject/manage kare
- Village ka status track hoga: registered -> approved -> active -> campaign_linked

### 2. CSR Partner Onboarding System  
- "csr_partners" table banega
- Public "/partner-with-us" page banega jahan companies/NGOs sign up kare (company name, type, contact person, email, phone, CSR budget range, interest area)
- Admin mein "CSR Partners" tab add hoga
- Partner status: inquiry -> contacted -> onboarded -> active

### 3. Tree Survival Tracking System
- "survival_updates" table banega jo existing plantation_photos + tree_plantation_requests se link hoga
- Admin panel mein jab order fulfill ho, toh uske baad periodic survival updates add kar sake (photo, health status: healthy/weak/dead, height, notes)
- Public "Track Your Tree" page pe survival history dikhe with photos
- Automatic survival rate calculation based on updates

### 4. Nursery Partnership Management
- "nurseries" table banega (name, location, contact, specialization, verified status)
- Admin mein "Nurseries" tab add hoga
- Villages aur campaigns ko nurseries se link kar sake

## New Pages (Public)
1. **`/partner-with-us`** - CSR/NGO/Institution onboarding form
2. **`/village-register`** - Village/Panchayat registration form  
3. Update existing **`/track`** page to show survival updates

## Admin Panel New Tabs
1. **Villages Tab** - Manage registered villages
2. **CSR Partners Tab** - Manage partner inquiries
3. **Nurseries Tab** - Manage nursery partnerships
4. **Survival Updates** - Add tree health updates to fulfilled orders

## Live Stats Auto-Update
- About page aur homepage pe stats database se automatically calculate honge (total villages, total partners, survival rate %)

---

## Technical Details

### Database Tables (New)

**villages**
- id, name, district, state, block, contact_person, phone, email
- population (approx), current_tree_count, trees_requested
- status (registered/approved/active/inactive)
- registered_at, approved_at, notes
- RLS: Anyone can INSERT (register), admins can SELECT/UPDATE/DELETE

**csr_partners**
- id, company_name, company_type (CSR/NGO/Educational/Panchayat/Other)
- contact_person, email, phone, website
- interest_area, budget_range, message
- status (inquiry/contacted/onboarded/active)
- RLS: Anyone can INSERT (register), admins can SELECT/UPDATE/DELETE

**nurseries**
- id, name, location, district, state
- contact_person, phone, specialization
- is_verified, is_active
- RLS: Admins only for all operations, public SELECT for active ones

**survival_updates**
- id, order_id (links to orders table), request_id (links to tree_plantation_requests)
- photo_url, health_status (healthy/weak/dead), height_cm
- notes, update_date, uploaded_by
- RLS: Admins can manage, users can view their own order's updates, public can view by tracking_id

### Files to Create
1. `src/pages/PartnerWithUs.tsx` - CSR partner registration form
2. `src/pages/VillageRegister.tsx` - Village registration form
3. `src/components/admin/VillagesTab.tsx` - Admin village management
4. `src/components/admin/CSRPartnersTab.tsx` - Admin CSR partner management
5. `src/components/admin/NurseriesTab.tsx` - Admin nursery management

### Files to Modify
1. `src/App.tsx` - Add new routes (/partner-with-us, /village-register)
2. `src/pages/Admin.tsx` - Add new admin tabs (Villages, CSR Partners, Nurseries)
3. `src/pages/TrackRequest.tsx` - Add survival update history display
4. `src/components/admin/OrdersTab.tsx` - Add "Add Survival Update" button on fulfilled orders

### No Breaking Changes
- All existing functionality stays as is
- New tables with proper RLS
- New pages are additive
- Existing admin tabs remain unchanged


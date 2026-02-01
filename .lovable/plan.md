
# Welcome Bonus + Referral Program Implementation Plan

## Overview
Is plan mein hum dono user incentive systems implement karenge:
1. **Welcome Bonus**: Signup pe instant ₹10 wallet credit
2. **Referral Program**: Unique referral code, refer karo aur dono ko bonus

---

## Part 1: Welcome Bonus System

### How It Works
- Jab bhi koi naya user signup karta hai, uske wallet mein automatically ₹10 credit ho jayega
- Ye database trigger level pe hoga (already wallet create ho raha hai, usme bonus add karenge)

### Database Changes
1. **Site Settings mein new keys add karenge:**
   - `welcome_bonus_amount`: ₹10 (admin configurable)
   - `referral_bonus_referrer`: ₹25 (jo refer kare usko)
   - `referral_bonus_referee`: ₹15 (jo signup kare usko)

2. **`create_wallet_for_user()` function update:**
   - Wallet create karne ke baad, welcome bonus transaction insert karna

---

## Part 2: Referral Program System

### How It Works
```text
+------------------+                    +------------------+
|   User A         |                    |   User B         |
|   (Referrer)     |   Shares Link      |   (New User)     |
+------------------+  ------------->    +------------------+
        |                                       |
        |  ?ref=ABC123                          |  Signs up with
        |                                       |  referral code
        v                                       v
+------------------+                    +------------------+
|  Gets ₹25        |   <-------------   |  Gets ₹15        |
|  Wallet Credit   |   After signup     |  + Welcome ₹10   |
+------------------+                    +------------------+
```

### Database Schema
**New Table: `referrals`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| referrer_id | UUID | Jo user ne refer kiya |
| referee_id | UUID | Jo naya signup hua |
| referrer_bonus | NUMERIC | Referrer ko mila (₹25) |
| referee_bonus | NUMERIC | New user ko mila (₹15) |
| status | TEXT | pending/completed |
| created_at | TIMESTAMPTZ | Timestamp |

**Profile Table Update:**
- Add `referral_code` column: Unique 8-character code (e.g., "HIM-ABCD")
- Auto-generate on profile creation

### URL Flow
1. Existing user shares: `https://himsols.com/auth?ref=HIM-ABCD`
2. New user lands on Auth page with referral code in URL
3. Referral code shown in signup form (optional field, can also paste manually)
4. On successful signup, both users get credited

---

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE;

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referrer_bonus NUMERIC NOT NULL DEFAULT 25,
  referee_bonus NUMERIC NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add site settings for bonus amounts
INSERT INTO site_settings (key, value) VALUES 
  ('welcome_bonus_amount', '10'),
  ('referral_bonus_referrer', '25'),
  ('referral_bonus_referee', '15'),
  ('referral_enabled', 'true');
```

### Step 2: Generate Referral Code Function
```sql
-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
  LOOP
    new_code := 'HIM-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
```

### Step 3: Edge Function - `process-signup-bonus`
New edge function jo signup ke baad call hoga:
- Welcome bonus credit kare
- Agar referral code hai, toh referral bonuses process kare
- Wallet transactions create kare

```text
Input: { user_id, referral_code? }
Output: { welcome_bonus, referral_bonus }
```

### Step 4: Update Auth Flow
**`src/pages/Auth.tsx`:**
- URL se `?ref=CODE` param read karo
- Signup form mein referral code field add karo (pre-filled from URL)
- Signup success ke baad edge function call karo

**`src/hooks/useAuth.tsx`:**
- `signUp` function mein referral_code parameter add karo

### Step 5: Referral Sharing UI
**`src/components/profile/ReferralTab.tsx` (New):**
- User ka unique referral code display
- Share buttons (WhatsApp, Copy Link)
- Referral statistics (kitne log refer kiye, total earnings)

**Profile page mein new tab add karo**

### Step 6: Admin Settings
**`src/components/admin/SettingsTab.tsx`:**
- Welcome bonus amount input
- Referral bonus amounts inputs
- Enable/disable referral program toggle

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/process-signup-bonus/index.ts` | Edge function for bonus processing |
| `src/components/profile/ReferralTab.tsx` | Referral sharing UI |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add referral code field, read URL param |
| `src/hooks/useAuth.tsx` | Add referral_code to signUp function |
| `src/pages/Profile.tsx` | Add Referral tab |
| `src/components/admin/SettingsTab.tsx` | Add bonus configuration |
| `src/hooks/useSiteSettings.tsx` | Add bonus-related settings |

---

## User Journey

### New User with Referral
1. Friend shares link: `himsols.com/auth?ref=HIM-ABCD`
2. User lands on signup page, sees referral code pre-filled
3. User signs up
4. System credits:
   - ₹10 Welcome Bonus to new user
   - ₹15 Referral Bonus to new user
   - ₹25 Referral Bonus to referrer
5. New user sees ₹25 in wallet (10+15)

### New User without Referral
1. User signs up normally
2. System credits ₹10 Welcome Bonus
3. User sees ₹10 in wallet

### Existing User Sharing
1. User goes to Profile → Referrals tab
2. Sees unique code: "HIM-ABCD"
3. Clicks "Share on WhatsApp" or "Copy Link"
4. Shares with friends
5. Sees referral count and total earnings

---

## Security Considerations
- Referral codes validated server-side
- Self-referral blocked (same email/phone check)
- One referral per new user
- Bonus amounts configurable only by admin

---

## Technical Summary

| Component | Technology |
|-----------|------------|
| Bonus Processing | Edge Function (atomic transactions) |
| Referral Code Generation | PostgreSQL Function |
| URL Parameter Handling | React Router (useSearchParams) |
| Sharing | WhatsApp API, Clipboard API |
| Admin Control | Site Settings table |



# Resend.com Custom Email Setup Plan for Himsols

## Overview
Himsols ke liye branded emails setup karenge (`noreply@himsols.com` se) using Resend.com. Isse verification emails professional lagenge aur users ko trust milega.

---

## Step 1: Resend Account Setup (Aapko karna hai)

### 1.1 Account Create Karein
1. Go to **https://resend.com** 
2. "Get Started" click karein
3. Email se signup karein (Google/GitHub bhi use kar sakte ho)

### 1.2 Domain Verify Karein
1. Resend dashboard mein **Domains** section mein jaayein
2. **"Add Domain"** click karein
3. `himsols.com` enter karein
4. Resend aapko **3 DNS records** dega add karne ke liye:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT) 
   - **DMARC Record** (TXT - optional but recommended)

5. Apne domain registrar (GoDaddy/Hostinger/Namecheap etc.) mein jaake ye records add karein
6. Records add karne ke baad Resend mein **"Verify"** click karein
7. Verification mein 5 minutes se 24 hours lag sakte hain

### 1.3 API Key Generate Karein
1. Resend dashboard mein **API Keys** section jaayein
2. **"Create API Key"** click karein
3. Name dein: `himsols-production`
4. Permission: **Full Access** select karein
5. API Key copy karein (ye sirf ek baar dikhega!)

---

## Step 2: Lovable Cloud Configuration (Main karunga)

### 2.1 Secret Add Karna
- **RESEND_API_KEY** secret add karunga Lovable Cloud mein
- Aapko ek input box dikhega jahan API key paste karni hogi

### 2.2 Email Edge Function Create Karna
Naya edge function banaunga: `send-verification-email`

```text
File: supabase/functions/send-verification-email/index.ts

Features:
- Resend API se email bhejega
- Himsols branding ke saath template
- noreply@himsols.com se jaayegi
```

---

## Step 3: Email Template Design

### Welcome/Verification Email Template
```text
+------------------------------------------+
|         🌱 HIMSOLS LOGO                  |
+------------------------------------------+
|                                          |
|   Namaste [User Name]!                   |
|                                          |
|   Himsols mein aapka swagat hai!         |
|   Apna account verify karne ke liye      |
|   neeche button par click karein.        |
|                                          |
|   [✓ Verify My Email]                    |
|                                          |
|   Ya ye link copy karein:                |
|   https://himsols.com/verify?token=...   |
|                                          |
+------------------------------------------+
|   🌳 Together, let's plant a greener     |
|      future!                             |
|                                          |
|   © 2025 Himsols | Privacy Policy        |
+------------------------------------------+
```

---

## Step 4: Auth Hook Integration

### Supabase Auth Webhook Setup
Jab bhi naya user signup kare, automatically email bhejne ke liye:

```text
Signup Flow:
1. User signs up
2. Supabase creates user (unverified)
3. Edge function triggered
4. Resend sends branded verification email
5. User clicks link → verified!
```

---

## Technical Implementation Details

### Files to Create/Modify:

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/send-verification-email/index.ts` | Create | Resend API integration |
| `src/hooks/useAuth.tsx` | Modify | Call email function after signup |

### Edge Function Code Structure:
```text
send-verification-email/
├── index.ts          # Main handler
└── templates/
    └── verification.ts  # HTML email template
```

### Security Considerations:
- API Key stored as encrypted secret
- Rate limiting on email sending
- Email validation before sending
- Proper error handling

---

## Cost Estimate

| Usage Level | Emails/Month | Cost |
|------------|--------------|------|
| Free Tier | 0-3,000 | ₹0 |
| Startup | 3,001-50,000 | ~₹1,600/month |
| Growth | 50,001-100,000 | ~₹6,500/month |

*Himsols ke liye shuru mein Free tier kaafi hoga!*

---

## Timeline

| Step | Time Required |
|------|---------------|
| Resend account + Domain verify | 15-30 min (+ DNS propagation) |
| API Key setup in Lovable | 2 min |
| Edge function deployment | 5 min |
| Testing | 10 min |

**Total: ~30-45 minutes** (excluding DNS propagation wait)

---

## Next Steps After Approval

1. **Aap karein**: Resend pe account banayein aur domain verify karein
2. **Main karunga**: 
   - RESEND_API_KEY secret add karne ka prompt dunga
   - Edge function create karunga
   - Auth hook update karunga
3. **Testing**: Test email bhej ke verify karenge


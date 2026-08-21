# App health review — aur agla step

Maine app ko live chala kar dekha (home, /corporate, /learn, /tree-plantation, /my-contributions). Positioning, hero, learn pages sab theek lag rahe hain — lekin **ek serious bug hai jo poori public site ka data tod raha hai**. Pehle wahi fix hona chahiye.

## 1. Critical: public pages ka data load hi nahi ho raha

Logged-out visitor ke liye har database read **401 permission denied** de raha hai:

```text
navigation_items  -> 401  permission denied for function has_role
footer_links      -> 401
live_stats        -> 401
testimonials      -> 401
corporate_*       -> 401 (packages, stats, testimonials, benefits, solutions)
```

Kaaran: security hardening ke dauraan `has_role` par se anonymous EXECUTE hata diya gaya tha. In public tables ki RLS policies andar-andar `has_role` call karti hain, isliye anon ki har read fail ho rahi hai.

Asar (screenshot se confirmed): navbar ke menu links gayab, footer khaali, live impact stats gayab, testimonials gayab, `/corporate` page ke packages/proof blocks khaali — yaani Google aur naye visitor ko adhoora page dikh raha hai.

Fix:
- `has_role` par `anon` + `authenticated` ko EXECUTE wapas dena (function `SECURITY DEFINER` + `search_path` fixed hai, yeh safe hai — yeh sirf boolean batata hai, data expose nahi karta).
- Uske baad har public table (navigation_items, footer_links, live_stats, testimonials, corporate_*) ko logged-out state me dobara verify karna.
- Security memory update karna: "public-readable tables ki policies has_role use karti hain → anon ka EXECUTE mat hatao".

## 2. Homepage ke chhote visual bugs

- Hero se pehle ek bada khaali kaala gap hai (fold par kuch nahi dikhta) — spacing/height fix.
- Navbar "Plant trees" button me ek broken character (tofu box) dikh raha hai — emoji ki jagah icon use karna.
- Cart icon abhi bhi navbar me hai, jabki marketplace band hai — hata dena.

## 3. Entry friction: /tree-plantation login-gated hai

Abhi `/tree-plantation` seedha `/auth?redirect=...` par bhej deta hai. Naya user pehle form dekhna chahta hai, login baad me. Suggestion: form khulne do, aur **submit ke waqt** login maango (redirect ke saath), taaki drop-off kam ho.

## 4. Console noise

34 console errors hain — inme se zyada wahi 401 wale hain, plus ek React prop warning. 401 fix hone ke baad bacha hua clean karna.

## Kaam ka order

1. `has_role` grant fix + poore public site ka logged-out verification (highest priority).
2. Homepage gap, cart icon, broken glyph.
3. `/tree-plantation` ko view-first + submit par login.
4. Console warning cleanup + Playwright se ek logged-out smoke test.

## Technical notes

- Fix ek migration se: `GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;`
- Verification: logged-out Playwright run jo `>=400` responses count kare — target 0.
- Baaki security fixes (land_partner triggers, storage ownership, definer functions) waise hi rahenge; sirf `has_role` ka grant wapas.

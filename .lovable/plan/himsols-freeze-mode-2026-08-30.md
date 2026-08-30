# Himsols — freeze mode

Naya feature nahi banega. Sirf ek baar check karke confirm karna hai ki jo cheezein leads laati hain wo chal rahi hain, aur uske baad app ko as-is chhod dena hai.

## Kya check hoga (no new features)

1. **Lead path** — homepage, `/corporate`, city/use-case pages par lead form submit hota hai ya nahi (ek test submit karke DB row confirm).
2. **Contact** — footer ke dono email, WhatsApp button aur contact form kaam kar rahe hain.
3. **Public pages** — logged-out user ko koi 401/5xx ya blank page na mile (existing `tests/e2e/public_rbac.py` chala ke).
4. **SEO basics** — `himsols.online` par title/description/canonical, robots.txt aur sitemap reachable hain.
5. **Admin** — leads dikhne wala tab khulta hai, taaki jab enquiry aaye to aap dekh sako.

## Report

Ek chhoti list milegi: kya theek hai, kya toota hai. Jo toota ho aur leads ko rokta ho, sirf wahi minimal fix karunga — baaki kuch nahi chhedunga.

## Freeze rules (aage ke liye)

- Naye features, naye pages, naye tables nahi.
- Sirf tab kaam jab kuch actually toot jaye ya real enquiry aaye.
- Content/blog aap khud add kar sakte ho admin se, code change ki zaroorat nahi.

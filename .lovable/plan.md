# PWA Auto-Update Notification

Installed users ko nayi deployment turant milegi, aur agar service worker pending hai to ek toast dikhega "Update available — Reload now".

## Changes

### 1. `vite.config.ts` — Workbox tighten
- `cleanupOutdatedCaches: true` add karna (purane cache auto-delete)
- `skipWaiting: true` + `clientsClaim: true` (naya SW turant active)
- HTML navigations ke liye `NetworkFirst` runtime caching rule add karna taaki HTML kabhi stale na ho
- Keep `registerType: "autoUpdate"` as-is

### 2. `src/components/PWAUpdatePrompt.tsx` (new)
- `virtual:pwa-register/react` se `useRegisterSW` hook use karega
- Jab `needRefresh = true` ho, sonner toast dikhayega with "Update Now" action button
- Click pe `updateServiceWorker(true)` call → page reload → nayi version
- Lovable preview/dev me silent rahega (PWA already disabled vahan)

### 3. `src/App.tsx`
- `<PWAUpdatePrompt />` mount karna (BrowserRouter ke andar, Toaster ke saath)

### 4. `src/vite-env.d.ts`
- `virtual:pwa-register/react` ka type reference add karna

## User-facing behavior

- **Naye visitor**: kuch nahi change, normal load
- **Returning installed user**: app open karte hi background me naya SW download hota hai, ready hone pe toast aata hai → 1 click me update
- **Worst case** (jinke paas already purana SW hai bina update-prompt ke): 1 baar app band-khol karna padega taaki ye nayi mechanism install ho. Uske baad har deployment seamless.

## Caveat
Ye changes sirf **published** site pe effective hain (Lovable preview/dev me service worker register hi nahi hota by design — ye intentional hai).

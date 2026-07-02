
## Goal
Users ko login screen se apna password reset karne ka option de. Google Sign-In skip, current email/phone auth flow untouched.

## User Flow
1. Login tab pe "Forgot password?" link (email/phone input ke neeche).
2. Click → `/forgot-password` page. User email daale → "Send reset link" button.
3. Branded email inbox mein aata hai (Himsols template) with reset link.
4. Link click → `/reset-password` page. Naya password + confirm password fields.
5. Submit → password update → success toast → auto-redirect to login.

## Scope

### New files
- `src/pages/ForgotPassword.tsx` — email input form, calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`. Success message: "Reset link sent, check your inbox."
- `src/pages/ResetPassword.tsx` — detects `type=recovery` in URL hash, shows new-password form, calls `supabase.auth.updateUser({ password })`. Validates min 6 chars + confirm match. On success → toast + navigate to `/auth`.
- `supabase/functions/send-password-reset-email/index.ts` — branded reset email via Resend (mirrors existing `send-verification-email` pattern) so the reset mail comes from `noreply@himsols.com` with Himsols branding instead of the default Supabase template.

### Edits
- `src/pages/Auth.tsx` — add "Forgot password?" link inside Login tab, right-aligned below password field, routing to `/forgot-password`. Only UI addition; existing login/signup logic untouched.
- `src/App.tsx` — register two new public routes (`/forgot-password`, `/reset-password`) outside any auth guard.
- `src/hooks/useAuth.tsx` — add helper `sendPasswordResetEmail(email)` that calls the new edge function (keeps pattern consistent with `resendVerificationEmail`).

### Not changing
- Existing email/password + phone auth flows.
- Verification email flow.
- Google Sign-In (skipping per user choice).
- Any RLS / DB schema.

## Technical Notes
- `/reset-password` must be a public route (no auth guard), because Supabase logs the user in with a recovery session when they click the email link — the page then calls `updateUser({ password })`.
- Phone-only users (accounts using `@phone.himsols.local` placeholder emails) can't use email reset. `ForgotPassword.tsx` will show a helpful message: "Phone-registered users, please contact support" (or ignore silently — Supabase won't send mail to that fake domain anyway). No SMS OTP infra added.
- Edge function uses existing `RESEND_API_KEY` secret — no new secret needed.
- Reset email template will match the Himsols brand (Forest Green #2e8b57, same styling as verification email).

## Deliverables
1. Working "Forgot password?" link on `/auth`.
2. `/forgot-password` and `/reset-password` pages.
3. Branded reset email sent from `noreply@himsols.com`.
4. Deployed edge function.

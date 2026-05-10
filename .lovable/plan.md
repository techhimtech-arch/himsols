## Plan: Vendor flow test

Abhi sirf user-side test (`src/test/scrap-flow.e2e.test.tsx`) hai. Vendor flow ka test nahi likha gaya — VendorDashboard aur `credit_scrap_to_wallet` RPC untested hai.

### Kya add karunga

Naya file: `src/test/vendor-flow.e2e.test.tsx`

Scenario:
1. Mock auth user ke pass `scrap_vendor` role hai (`has_role` RPC → true)
2. `waste_management_requests` se 1 pending request load hota hai (Ramesh, 12kg Iron)
3. Vendor "Credit Wallet" button dabaata hai → dialog khulta hai
4. Amount field me `264` daalta hai (12kg × ₹22), note likhta hai
5. "Confirm & Credit" click
6. Assert:
   - `credit_scrap_to_wallet` RPC sahi params ke saath call hua (`p_request_id`, `p_amount: 264`, `p_note`)
   - Status auto-update `completed` ke saath `waste_management_requests` pe call hua
   - Toast "Wallet Credited" dikha
   - Request list refresh hui

### Mocks needed
- `supabase.auth.getSession` → vendor user session
- `supabase.rpc("has_role", ...)` → `true` for `scrap_vendor`
- `supabase.from("waste_management_requests")` → select returns 1 pending request, update returns ok
- `supabase.rpc("credit_scrap_to_wallet", ...)` → returns `[{ new_balance: 264 }]`
- Navbar/Footer mocked (light)

### Run
`bunx vitest run src/test/vendor-flow.e2e.test.tsx`

Koi feature/code change nahi — sirf test file. Agar test pass hua to vendor flow confirmed working. Fail hua to bataunga kya tootha.

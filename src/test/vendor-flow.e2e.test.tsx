import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const hoisted = vi.hoisted(() => ({
  rpcCalls: [] as Array<{ fn: string; args: any }>,
  updateCalls: [] as Array<{ table: string; payload: any; id: string }>,
  toastCalls: [] as any[],
  REQUEST_ID: "req-vendor-1",
  TRACKING_ID: "WMS-2026-0099",
  USER_ID: "vendor-user-1",
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = vi.fn((table: string) => {
    if (table === "waste_management_requests") {
      return {
        select: () => ({
          order: () => ({
            limit: async () => ({
              data: [
                {
                  id: hoisted.REQUEST_ID,
                  tracking_id: hoisted.TRACKING_ID,
                  user_id: "customer-1",
                  name: "Ramesh Test",
                  phone: "9876543210",
                  address: "Mall Road, Shimla",
                  pickup_date: new Date().toISOString().slice(0, 10),
                  waste_type: "Iron/Steel",
                  estimated_quantity: "12",
                  status: "pending",
                  state: "Himachal Pradesh",
                  district: "Shimla",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          }),
        }),
        update: (payload: any) => ({
          eq: async (_col: string, id: string) => {
            hoisted.updateCalls.push({ table, payload, id });
            return { error: null };
          },
        }),
      };
    }
    return { select: () => ({}), update: () => ({}) };
  });

  return {
    supabase: {
      from,
      rpc: vi.fn(async (fn: string, args: any) => {
        hoisted.rpcCalls.push({ fn, args });
        if (fn === "has_role" && args?._role === "scrap_vendor") {
          return { data: true, error: null };
        }
        if (fn === "has_role") return { data: false, error: null };
        if (fn === "credit_scrap_to_wallet") {
          return { data: [{ new_balance: 264, transaction_id: "tx-1" }], error: null };
        }
        return { data: null, error: null };
      }),
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    },
  };
});

vi.mock("@/hooks/useAuth", () => {
  const fakeUser = { id: hoisted.USER_ID, email: "vendor@example.com" };
  return {
    useAuthSafe: () => ({ user: fakeUser, loading: false }),
    useAuth: () => ({ user: fakeUser, loading: false, signOut: vi.fn() }),
    AuthProvider: ({ children }: any) => children,
  };
});

vi.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({ language: "en", setLanguage: vi.fn() }),
  LanguageProvider: ({ children }: any) => children,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (opts: any) => {
      hoisted.toastCalls.push(opts);
    },
  }),
  toast: (opts: any) => hoisted.toastCalls.push(opts),
}));

vi.mock("@/components/Navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer data-testid="footer" /> }));

import VendorDashboard from "@/pages/VendorDashboard";

const renderApp = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/vendor"]}>
        <Routes>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/auth" element={<div>Auth page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Vendor flow E2E: enter actual values → credit wallet", () => {
  beforeEach(() => {
    hoisted.rpcCalls.length = 0;
    hoisted.updateCalls.length = 0;
    hoisted.toastCalls.length = 0;
  });

  it("vendor opens dashboard, credits wallet, request marked completed", async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for request list to load
    await waitFor(() => {
      expect(screen.getByText(hoisted.TRACKING_ID)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText(/Ramesh Test/)).toBeInTheDocument();

    // Click "Credit Wallet" button
    await user.click(screen.getByRole("button", { name: /Credit Wallet/i }));

    // Dialog opens
    await waitFor(() => {
      expect(screen.getByText(/Credit Amount/i)).toBeInTheDocument();
    });

    // Enter kg and rate in the calculator (12kg × ₹22 = ₹264)
    await user.type(screen.getByPlaceholderText(/e\.g\. 12/), "12");
    await user.type(screen.getByPlaceholderText(/e\.g\. 22/), "22");

    // Note field
    await user.type(
      screen.getByPlaceholderText(/Collected 12kg iron/),
      "Collected 12kg iron @ ₹22/kg"
    );

    // Open confirmation dialog
    await user.click(screen.getByRole("button", { name: /Confirm & Credit/i }));

    // Confirmation dialog should show summary
    await waitFor(() => {
      expect(screen.getByText(/Confirm Scrap Credit/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Total Credit/i)).toBeInTheDocument();
    expect(screen.getByText(/₹264\.00/)).toBeInTheDocument();

    // Confirm from alert dialog
    await user.click(screen.getByRole("button", { name: /Yes, Credit Wallet/i }));

    // Assert RPC called correctly
    await waitFor(() => {
      const creditCall = hoisted.rpcCalls.find(
        (c) => c.fn === "credit_scrap_to_wallet"
      );
      expect(creditCall).toBeTruthy();
      expect(creditCall!.args.p_request_id).toBe(hoisted.REQUEST_ID);
      expect(creditCall!.args.p_amount).toBe(264);
      expect(creditCall!.args.p_note).toBe("Collected 12kg iron @ ₹22/kg");
    });

    // Assert request auto-marked completed
    await waitFor(() => {
      const completedCall = hoisted.updateCalls.find(
        (u) =>
          u.table === "waste_management_requests" &&
          u.payload?.status === "completed" &&
          u.id === hoisted.REQUEST_ID
      );
      expect(completedCall).toBeTruthy();
    });

    // Assert success toast fired with new balance
    const successToast = hoisted.toastCalls.find((t) =>
      String(t.title || "").includes("Wallet Credited")
    );
    expect(successToast).toBeTruthy();
    expect(String(successToast.description)).toContain("264");
  });
});

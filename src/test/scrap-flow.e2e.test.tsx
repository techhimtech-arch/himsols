import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---- Mocks ----
const hoisted = vi.hoisted(() => ({
  insertedRequests: [] as any[],
  insertedItems: [] as any[],
  TRACKING_ID: "WMS-2026-0042",
}));
const { insertedRequests, insertedItems, TRACKING_ID } = hoisted;

vi.mock("@/integrations/supabase/client", () => {
  const select = vi.fn().mockResolvedValue({
    data: [
      { id: "scrap-iron", name: "Iron/Steel", name_hi: "लोहा", rate_per_kg: 22, unit: "kg" },
      { id: "scrap-copper", name: "Copper", name_hi: "तांबा", rate_per_kg: 450, unit: "kg" },
    ],
    error: null,
  });

  const from = vi.fn((table: string) => {
    if (table === "scrap_types") {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => select(),
            }),
          }),
        }),
      };
    }
    if (table === "waste_management_requests") {
      return {
        insert: (row: any) => {
          insertedRequests.push(row);
          return {
            select: () => ({
              single: async () => ({ data: { id: "req-1" }, error: null }),
            }),
          };
        },
        select: () => ({
          eq: () => ({
            order: async () => ({
              data: [
                {
                  tracking_id: TRACKING_ID,
                  status: "pending",
                  address: "Test Address, Shimla",
                  waste_type: "Iron/Steel",
                  pickup_date: new Date().toISOString().slice(0, 10),
                  created_at: new Date().toISOString(),
                },
              ],
            }),
          }),
        }),
      };
    }
    if (table === "scrap_request_items") {
      return {
        insert: (row: any) => {
          insertedItems.push(row);
          return Promise.resolve({ error: null });
        },
      };
    }
    if (table === "tree_plantation_requests") {
      return {
        select: () => ({ eq: () => ({ order: async () => ({ data: [] }) }) }),
      };
    }
    return { select: () => ({}), insert: () => ({}) };
  });

  return {
    supabase: {
      from,
      rpc: vi.fn().mockResolvedValue({ data: TRACKING_ID, error: null }),
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    },
  };
});

vi.mock("@/hooks/useAuth", async () => {
  const fakeUser = { id: "user-1", email: "test@example.com" };
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
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Avoid Footer / Navbar internal supabase calls keeping it light
vi.mock("@/components/Navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer data-testid="footer" /> }));

// Imports AFTER mocks
import { ScrapToWalletSection } from "@/components/home/ScrapToWalletSection";
import TrackRequest from "@/pages/TrackRequest";

const renderApp = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ScrapToWalletSection />} />
          <Route path="/track-request" element={<TrackRequest />} />
          <Route path="/track-request/:trackingId" element={<TrackRequest />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Scrap pickup → Track request E2E flow", () => {
  beforeEach(() => {
    insertedRequests.length = 0;
    insertedItems.length = 0;
  });

  it("submits pickup form and shows tracking ID on the page", async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for scrap types to load
    await waitFor(() => {
      expect(screen.getByText(/Iron\/Steel/i)).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/Your name/i), "Ramesh Test");
    await user.type(screen.getByLabelText(/Phone/i), "9876543210");
    await user.type(
      screen.getByLabelText(/Pickup address/i),
      "House 12, Mall Road, Shimla, HP, 171001"
    );

    // Submit
    await user.click(screen.getByRole("button", { name: /Request Free Pickup/i }));

    // Insert was called with tracking ID
    await waitFor(() => {
      expect(insertedRequests.length).toBe(1);
    });
    expect(insertedRequests[0].tracking_id).toBe(TRACKING_ID);
    expect(insertedRequests[0].user_id).toBe("user-1");
    expect(insertedRequests[0].name).toBe("Ramesh Test");
    expect(insertedItems.length).toBe(1);

    // Confirmation card shows tracking ID
    await waitFor(() => {
      expect(screen.getByText(TRACKING_ID)).toBeInTheDocument();
    });

    // Click "Track your request" link → navigates to /track-request
    await user.click(screen.getByRole("link", { name: /Track your request/i }));

    // Tracking page renders with the request from history
    await waitFor(() => {
      expect(screen.getAllByText(TRACKING_ID).length).toBeGreaterThan(0);
    });
  });
});

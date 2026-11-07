// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IssuePage from "@/app/issue/page";
import { coerceFieldValue } from "@/lib/coercion";
import { ToastProvider } from "@/components/toast";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "schema" ? "seed-schema-1" : null),
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock wallet
const mockAttest = vi.fn();
const mockGetSchema = vi.fn().mockResolvedValue({
  name: "KYC Level 1",
  definition: "string name,u32 tier,bool verified",
  authority: "GAUTHORITY",
  revocable: true,
});

let mockWalletState: {
  connected: boolean;
  address: string | null;
  writeClient: any;
  readClient: any;
} = {
  connected: true,
  address: "GISSUER123",
  writeClient: {
    attest: mockAttest,
  },
  readClient: {
    getSchema: mockGetSchema,
  },
};

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({
    ...mockWalletState,
    config: {
      seedSchemas: {
        "KYC Level 1": "seed-schema-1",
        Membership: "seed-schema-2",
      },
    },
  }),
}));

describe("Issue Page & Coerce Helper", () => {
  it("coerces raw string values according to schema field type", () => {
    expect(coerceFieldValue({ type: "bool", name: "v" }, "true")).toBe(true);
    expect(coerceFieldValue({ type: "bool", name: "v" }, "false")).toBe(false);
    expect(coerceFieldValue({ type: "u32", name: "v" }, "123")).toBe(123);
    expect(coerceFieldValue({ type: "i32", name: "v" }, "-5")).toBe(-5);
    expect(
      coerceFieldValue({ type: "u64", name: "v" }, "9007199254740993"),
    ).toBe(BigInt("9007199254740993"));
    expect(coerceFieldValue({ type: "string", name: "v" }, "hello")).toBe(
      "hello",
    );
    expect(coerceFieldValue({ type: "bytes", name: "v" }, "deadbeef")).toBe(
      "deadbeef",
    );
  });

  it("renders empty state when wallet is not connected", () => {
    mockWalletState = {
      connected: false,
      address: null,
      writeClient: null,
      readClient: { getSchema: mockGetSchema },
    };

    render(
      <ToastProvider>
        <IssuePage />
      </ToastProvider>,
    );

    expect(
      screen.getByText(/Connect a wallet to issue an attestation on Testnet/i),
    ).toBeDefined();
  });

  it("renders form fields when wallet is connected", async () => {
    mockWalletState = {
      connected: true,
      address: "GISSUER123",
      writeClient: { attest: mockAttest },
      readClient: { getSchema: mockGetSchema },
    };

    render(
      <ToastProvider>
        <IssuePage />
      </ToastProvider>,
    );

    expect(screen.getByText("Issue an attestation")).toBeDefined();
    expect(screen.getByText("Subject address (G…)")).toBeDefined();
    expect(screen.getByText("Expiration Date (Optional)")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("name (string)")).toBeDefined();
      expect(screen.getByText("tier (u32)")).toBeDefined();
      expect(screen.getByText("verified (bool)")).toBeDefined();
    });
  });

  it("shows error when expiration date is in the past", async () => {
    mockWalletState = {
      connected: true,
      address: "GISSUER123",
      writeClient: { attest: mockAttest },
      readClient: { getSchema: mockGetSchema },
    };

    render(
      <ToastProvider>
        <IssuePage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("name (string)")).toBeDefined();
    });

    const subjectInput = screen.getByPlaceholderText("GABC…");
    fireEvent.change(subjectInput, { target: { value: "GSUBJECT123" } });

    // Set past date
    const dateInput = document.querySelector('input[type="datetime-local"]')!;
    fireEvent.change(dateInput, { target: { value: "2020-01-01T12:00" } });

    const submitBtn = screen.getByRole("button", { name: "Attest" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getAllByText("Expiration date must be in the future.").length,
      ).toBeGreaterThan(0);
    });

    expect(mockAttest).not.toHaveBeenCalled();
  });
});

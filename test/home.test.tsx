// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";

const push = vi.fn();
const mockGetSchema = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({
    readClient: {
      getSchema: mockGetSchema,
    },
    config: {
      seedSchemas: {
        "KYC Level 1": "uid-kyc-1",
        "Legacy Badge": "uid-legacy",
      },
    },
  }),
}));

describe("HomePage", () => {
  beforeEach(() => {
    push.mockClear();
    mockGetSchema.mockReset();
  });

  it("renders seed schemas with their definitions and statuses", async () => {
    mockGetSchema.mockImplementation((uid: string) => {
      if (uid === "uid-kyc-1") {
        return Promise.resolve({
          name: "KYC Level 1",
          definition: "string name,bool verified",
          authority: "GAUTHORITY",
          revocable: true,
        });
      }
      return Promise.reject(new Error("Schema not found"));
    });

    render(<HomePage />);

    expect(screen.getByText("Schemas")).toBeDefined();
    expect(
      screen.getByText(/The registry does not enumerate schemas/),
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("KYC Level 1")).toBeDefined();
      expect(screen.getByText("string name,bool verified")).toBeDefined();
      expect(screen.getByText("revocable")).toBeDefined();
      // Missing schema fallback badge
      expect(screen.getByText("missing")).toBeDefined();
    });
  });

  it("navigates to subject page on form submission", () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText("GABC…");
    fireEvent.change(input, { target: { value: "GSUBJECT123" } });

    const submitBtn = screen.getByRole("button", { name: "View attestations" });
    fireEvent.click(submitBtn);

    expect(push).toHaveBeenCalledWith("/subject/GSUBJECT123");
  });
});

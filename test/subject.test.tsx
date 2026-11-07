// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SubjectPage from "@/app/subject/[address]/page";
import { ToastProvider } from "@/components/toast";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({
    address: "GSUBJECT_TEST_ADDRESS_123",
  }),
}));

const mockRevoke = vi.fn().mockResolvedValue(undefined);
const mockAttestationsForSubject = vi.fn().mockResolvedValue(["uid1", "uid2"]);

const mockGetAttestation = vi.fn().mockImplementation((uid: string) => {
  if (uid === "uid1") {
    return Promise.resolve({
      issuer: "GISSUER_ME",
      schema_uid: new Uint8Array([1, 2, 3]),
      revoked: false,
      expiration: 1893456000, // Year 2030
      data: new Uint8Array([0, 1]),
    });
  }
  return Promise.resolve({
    issuer: "GISSUER_OTHER",
    schema_uid: new Uint8Array([4, 5, 6]),
    revoked: true,
    expiration: undefined,
    data: new Uint8Array([]),
  });
});

const mockIsValid = vi.fn().mockImplementation((uid: string) => {
  return Promise.resolve(uid === "uid1");
});

const mockGetSchema = vi.fn().mockResolvedValue({
  name: "Sample KYC Schema",
  definition: "string name",
  authority: "GAUTHORITY",
  revocable: true,
});

const mockReadClient = {
  attestationsForSubject: mockAttestationsForSubject,
  getAttestation: mockGetAttestation,
  isValid: mockIsValid,
  getSchema: mockGetSchema,
};

const mockWriteClient = {
  revoke: mockRevoke,
};

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({
    connected: true,
    address: "GISSUER_ME",
    writeClient: mockWriteClient,
    readClient: mockReadClient,
  }),
}));

describe("Subject Page", () => {
  it("renders subject details, uids, validity badges, and decoded schema", async () => {
    render(
      <ToastProvider>
        <SubjectPage />
      </ToastProvider>,
    );

    expect(screen.getByText("Subject")).toBeDefined();
    expect(screen.getByText("GSUBJECT_TEST_ADDRESS_123")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("uid1")).toBeDefined();
      expect(screen.getByText("uid2")).toBeDefined();
      expect(screen.getByText("valid")).toBeDefined();
      expect(screen.getByText("invalid")).toBeDefined();
    });
  });

  it("allows revoking when connected wallet is the issuer", async () => {
    render(
      <ToastProvider>
        <SubjectPage />
      </ToastProvider>,
    );

    const revokeBtn = await screen.findByRole(
      "button",
      { name: "Revoke" },
      { timeout: 4000 },
    );
    await new Promise((r) => setTimeout(r, 50));
    fireEvent.click(revokeBtn);

    await waitFor(
      () => {
        expect(mockRevoke).toHaveBeenCalledWith("GISSUER_ME", "uid1");
      },
      { timeout: 4000 },
    );
  });
});

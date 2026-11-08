// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SchemaPage from "@/app/schema/[uid]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ uid: "01020304" }),
}));

vi.mock("@/components/recent-attestations", () => ({
  RecentAttestations: ({ schemaUid }: { schemaUid: string }) => (
    <div data-testid="recent-attestations">Recent for {schemaUid}</div>
  ),
}));

const mockGetSchema = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({
    readClient: {
      getSchema: mockGetSchema,
      schemaAttestationCount: mockCount,
    },
  }),
}));

describe("SchemaPage", () => {
  beforeEach(() => {
    mockGetSchema.mockReset();
    mockCount.mockReset();
  });

  it("renders schema details, parsed fields, count, and action button", async () => {
    mockGetSchema.mockResolvedValue({
      name: "Identity KYC",
      definition: "string name,u32 tier,bool active",
      authority: "GAUTHORITY123",
      revocable: false,
    });
    mockCount.mockResolvedValue(BigInt(42));

    render(<SchemaPage />);

    expect(screen.getByText("Loading schema…")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("Identity KYC")).toBeDefined();
      expect(screen.getByText("irrevocable")).toBeDefined();
      expect(screen.getByText("01020304")).toBeDefined();
      expect(screen.getByText("GAUTHORITY123")).toBeDefined();
      expect(screen.getByText("42")).toBeDefined();
      expect(screen.getByText("name")).toBeDefined();
      expect(screen.getByText("string")).toBeDefined();
      expect(screen.getByText("tier")).toBeDefined();
      expect(screen.getByText("u32")).toBeDefined();
      expect(screen.getByText("active")).toBeDefined();
      expect(screen.getByText("bool")).toBeDefined();
      expect(
        screen.getByRole("button", { name: "Issue Attestation" }),
      ).toBeDefined();
    });
  });

  it("handles schema not found state gracefully", async () => {
    mockGetSchema.mockResolvedValue(null);
    mockCount.mockResolvedValue(null);

    render(<SchemaPage />);

    await waitFor(() => {
      expect(screen.getByText("Schema not found for this uid.")).toBeDefined();
    });
  });
});

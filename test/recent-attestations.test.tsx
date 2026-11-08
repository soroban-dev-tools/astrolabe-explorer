// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecentAttestations } from "@/components/recent-attestations";

const fetchMock = vi.fn();
const urlMock = vi.fn();

vi.mock("@/lib/indexer", () => ({
  fetchSchemaAttestations: (...args: unknown[]) => fetchMock(...args),
  indexerUrl: () => urlMock(),
}));

describe("RecentAttestations", () => {
  it("explains the reduced mode when no indexer is configured", async () => {
    urlMock.mockReturnValue(null);
    render(<RecentAttestations schemaUid="s1" />);
    expect(await screen.findByText(/indexer is not available/i)).toBeDefined();
  });

  it("renders rows and loads the next page", async () => {
    urlMock.mockReturnValue("https://idx.example");
    fetchMock
      .mockResolvedValueOnce({
        items: [{ uid: "uid-one", subject: "GSUBJECTONE", issuer: "GI" }],
        nextCursor: "c2",
      })
      .mockResolvedValueOnce({
        items: [{ uid: "uid-two", subject: "GSUBJECTTWO", issuer: "GI" }],
        nextCursor: null,
      });

    render(<RecentAttestations schemaUid="s1" />);
    expect(await screen.findByText("uid-one")).toBeDefined();

    fireEvent.click(await screen.findByRole("button", { name: "Load more" }));
    expect(await screen.findByText("uid-two")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("shows the empty state for a schema with no rows", async () => {
    urlMock.mockReturnValue("https://idx.example");
    fetchMock.mockResolvedValueOnce({ items: [], nextCursor: null });
    render(<RecentAttestations schemaUid="s1" />);
    expect(
      await screen.findByText(/No attestations have been indexed/),
    ).toBeDefined();
  });
});

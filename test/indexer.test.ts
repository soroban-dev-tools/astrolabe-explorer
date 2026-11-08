// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSchemaAttestations, indexerUrl } from "@/lib/indexer";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("indexer client", () => {
  it("is disabled when no url is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXER_URL", "");
    expect(indexerUrl()).toBeNull();
    expect(await fetchSchemaAttestations("abc")).toBeNull();
  });

  it("strips trailing slashes from the base url", () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXER_URL", "https://idx.example///");
    expect(indexerUrl()).toBe("https://idx.example");
  });

  it("maps a page and drops malformed rows", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXER_URL", "https://idx.example");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          { uid: "u1", subject: "GS", issuer: "GI", created_at: "2026-01-01" },
          { uid: "broken" },
        ],
        next_cursor: "c2",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchSchemaAttestations("s1", {
      cursor: "c1",
      limit: 5,
    });

    expect(page).toEqual({
      items: [
        { uid: "u1", subject: "GS", issuer: "GI", createdAt: "2026-01-01" },
      ],
      nextCursor: "c2",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://idx.example/schemas/s1/attestations?limit=5&cursor=c1",
    );
  });

  it("returns null on http errors and network failures", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXER_URL", "https://idx.example");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchSchemaAttestations("s1")).toBeNull();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await fetchSchemaAttestations("s1")).toBeNull();
  });
});

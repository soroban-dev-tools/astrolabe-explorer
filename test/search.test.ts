// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { describe, expect, it } from "vitest";
import { resolveSearch } from "@/lib/search";

const seeds = { "KYC Level 1": "a".repeat(64), Membership: "b".repeat(64) };
const address = "G" + "A".repeat(55);
const contract = "C" + "B".repeat(55);

describe("resolveSearch", () => {
  it("returns none for blank input", () => {
    expect(resolveSearch("   ", seeds)).toEqual({ kind: "none" });
  });

  it("routes account and contract addresses to the subject page", () => {
    expect(resolveSearch(address, seeds)).toEqual({
      kind: "subject",
      href: `/subject/${address}`,
    });
    expect(resolveSearch(` ${contract} `, seeds).kind).toBe("subject");
  });

  it("routes a hex uid to the schema page, normalising prefix and case", () => {
    const upper = "0x" + "AB".repeat(32);
    expect(resolveSearch(upper, seeds)).toEqual({
      kind: "schema",
      href: `/schema/${"ab".repeat(32)}`,
      label: "ab".repeat(32),
    });
  });

  it("matches seed schema names case-insensitively", () => {
    expect(resolveSearch("kyc", seeds)).toEqual({
      kind: "schema",
      href: `/schema/${"a".repeat(64)}`,
      label: "KYC Level 1",
    });
  });

  it("returns none when nothing matches", () => {
    expect(resolveSearch("zzz", seeds)).toEqual({ kind: "none" });
    expect(resolveSearch("G123", seeds)).toEqual({ kind: "none" });
  });
});

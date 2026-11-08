// Copyright 2026 The Astrolabe Authors. Apache-2.0.

export type SearchTarget =
  | { kind: "subject"; href: string }
  | { kind: "schema"; href: string; label: string }
  | { kind: "none" };

const ADDRESS = /^[GC][A-Z2-7]{55}$/;
const SCHEMA_UID = /^(0x)?[0-9a-fA-F]{64}$/;

/**
 * Resolve free-form search input to a route. Stellar addresses go to the
 * subject page, 32-byte hex ids to the schema page, and anything else is
 * matched against the seed schema names (case-insensitive substring).
 */
export function resolveSearch(
  input: string,
  seedSchemas: Record<string, string>,
): SearchTarget {
  const query = input.trim();
  if (!query) return { kind: "none" };

  if (ADDRESS.test(query)) {
    return { kind: "subject", href: `/subject/${encodeURIComponent(query)}` };
  }
  if (SCHEMA_UID.test(query)) {
    const uid = query.replace(/^0x/, "").toLowerCase();
    return { kind: "schema", href: `/schema/${uid}`, label: uid };
  }

  const needle = query.toLowerCase();
  const match = Object.entries(seedSchemas).find(([name]) =>
    name.toLowerCase().includes(needle),
  );
  return match
    ? { kind: "schema", href: `/schema/${match[1]}`, label: match[0] }
    : { kind: "none" };
}

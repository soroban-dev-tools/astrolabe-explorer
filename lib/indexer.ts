// Copyright 2026 The Astrolabe Authors. Apache-2.0.
//
// Optional read client for an off-chain indexer. The chain cannot enumerate
// attestations by schema, so listings depend on it. When no indexer is
// configured every call resolves to `null` and the UI degrades to direct
// lookups instead of failing.

export interface IndexedAttestation {
  uid: string;
  subject: string;
  issuer: string;
  createdAt?: string;
}

export interface AttestationPage {
  items: IndexedAttestation[];
  nextCursor: string | null;
}

export function indexerUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_INDEXER_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

interface RawPage {
  items?: {
    uid?: string;
    subject?: string;
    issuer?: string;
    created_at?: string;
  }[];
  next_cursor?: string | null;
}

export async function fetchSchemaAttestations(
  schemaUid: string,
  options: { cursor?: string; limit?: number; signal?: AbortSignal } = {},
): Promise<AttestationPage | null> {
  const base = indexerUrl();
  if (!base) return null;

  const query = new URLSearchParams({ limit: String(options.limit ?? 10) });
  if (options.cursor) query.set("cursor", options.cursor);

  try {
    const res = await fetch(
      `${base}/schemas/${encodeURIComponent(schemaUid)}/attestations?${query}`,
      { signal: options.signal },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as RawPage;
    const items = (body.items ?? []).flatMap((i) =>
      i.uid && i.subject && i.issuer
        ? [
            {
              uid: i.uid,
              subject: i.subject,
              issuer: i.issuer,
              createdAt: i.created_at,
            },
          ]
        : [],
    );
    return { items, nextCursor: body.next_cursor ?? null };
  } catch {
    return null;
  }
}

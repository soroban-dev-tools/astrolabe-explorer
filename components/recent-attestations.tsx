"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Empty, Mono, shorten } from "@/components/ui";
import {
  fetchSchemaAttestations,
  indexerUrl,
  type IndexedAttestation,
} from "@/lib/indexer";

const PAGE_SIZE = 10;

export function RecentAttestations({ schemaUid }: { schemaUid: string }) {
  const [items, setItems] = useState<IndexedAttestation[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(
    async (next?: string) => {
      setLoading(true);
      const page = await fetchSchemaAttestations(schemaUid, {
        cursor: next,
        limit: PAGE_SIZE,
      });
      if (!page) {
        setUnavailable(true);
      } else {
        setItems((prev) => (next ? [...prev, ...page.items] : page.items));
        setCursor(page.nextCursor);
      }
      setLoading(false);
    },
    [schemaUid],
  );

  useEffect(() => {
    setItems([]);
    setUnavailable(false);
    if (!indexerUrl()) {
      setUnavailable(true);
      setLoading(false);
      return;
    }
    void load();
  }, [load]);

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Recent attestations</h2>
      {unavailable && (
        <Empty>
          The indexer is not available, so recent attestations cannot be listed.
          Use subject lookup to browse a specific address.
        </Empty>
      )}
      {!unavailable && !loading && items.length === 0 && (
        <Empty>No attestations have been indexed for this schema yet.</Empty>
      )}
      {items.length > 0 && (
        <Card>
          <ul className="divide-y divide-border/40 text-sm">
            {items.map((a) => (
              <li
                key={a.uid}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <Mono>{shorten(a.uid)}</Mono>
                <Link href={`/subject/${encodeURIComponent(a.subject)}`}>
                  {shorten(a.subject)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {loading && !unavailable && <Empty>Loading attestations…</Empty>}
      {cursor && !loading && (
        <Button variant="ghost" onClick={() => void load(cursor)}>
          Load more
        </Button>
      )}
    </section>
  );
}

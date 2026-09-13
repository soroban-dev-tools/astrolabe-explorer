"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Schema } from "@astrolabe/sdk";
import { parseDefinition } from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import { Badge, Card, Empty, Mono } from "@/components/ui";

export default function SchemaPage() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;
  const { readClient } = useWallet();
  const [schema, setSchema] = useState<Schema | null | undefined>(undefined);
  const [count, setCount] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    readClient
      .getSchema(uid)
      .then((s) => !cancelled && setSchema(s))
      .catch((e) => !cancelled && setError(String(e)));
    readClient
      .schemaAttestationCount(uid)
      .then((c) => !cancelled && setCount(c))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, [readClient, uid]);

  if (error) return <Card className="text-sm text-red-400">Failed: {error}</Card>;
  if (schema === undefined) return <Empty>Loading schema…</Empty>;
  if (schema === null) return <Empty>Schema not found for this uid.</Empty>;

  let fields: { type: string; name: string }[] = [];
  try {
    fields = parseDefinition(schema.definition);
  } catch {
    fields = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{schema.name}</h1>
        <Badge tone={schema.revocable ? "green" : "muted"}>
          {schema.revocable ? "revocable" : "irrevocable"}
        </Badge>
      </div>

      <Card className="space-y-3">
        <div>
          <div className="text-sm text-muted">Schema uid</div>
          <Mono>{uid}</Mono>
        </div>
        <div>
          <div className="text-sm text-muted">Authority</div>
          <Mono>{schema.authority}</Mono>
        </div>
        <div>
          <div className="text-sm text-muted">Attestations issued</div>
          <div className="text-fg">{count === null ? "—" : count.toString()}</div>
        </div>
      </Card>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Fields</h2>
        <Card>
          <ul className="space-y-1 text-sm">
            {fields.map((f) => (
              <li key={f.name} className="flex justify-between">
                <span className="text-fg">{f.name}</span>
                <span className="text-muted">{f.type}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <p className="text-sm text-muted">
        The per-schema list of attestations lives off chain in the indexer, which
        is out of scope for this release. Use{" "}
        <Link href="/">subject lookup</Link> to browse a specific address, or{" "}
        <Link href="/issue">issue an attestation</Link> under this schema.
      </p>
    </div>
  );
}

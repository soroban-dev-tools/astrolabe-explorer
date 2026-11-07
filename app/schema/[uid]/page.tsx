"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Schema } from "@astrolabe/sdk";
import { parseDefinition } from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import { Badge, Button, Card, Empty, Mono } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { ExplorerLink } from "@/components/explorer-link";
import { decodeContractError } from "@/components/toast";

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
      .catch((e) => !cancelled && setError(decodeContractError(e)));
    readClient
      .schemaAttestationCount(uid)
      .then((c) => !cancelled && setCount(c))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, [readClient, uid]);

  if (error)
    return <Card className="text-sm text-red-400">Failed: {error}</Card>;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{schema.name}</h1>
        <div className="flex items-center gap-3">
          <Badge tone={schema.revocable ? "green" : "muted"}>
            {schema.revocable ? "revocable" : "irrevocable"}
          </Badge>
          <Link href={`/issue?schema=${encodeURIComponent(uid)}`}>
            <Button>Issue Attestation</Button>
          </Link>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm text-muted">Schema uid</div>
          <div className="flex items-center gap-2">
            <Mono>{uid}</Mono>
            <CopyButton text={uid} label="UID" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted">Authority</div>
          <div className="flex items-center gap-2">
            <Mono>{schema.authority}</Mono>
            <CopyButton text={schema.authority} label="Authority" />
            <ExplorerLink type="account" value={schema.authority} />
          </div>
        </div>
        <div>
          <div className="text-sm text-muted">Attestations issued</div>
          <div className="font-mono text-fg">
            {count === null ? "—" : count.toString()}
          </div>
        </div>
      </Card>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Fields</h2>
        <Card>
          <ul className="divide-y divide-border/40 text-sm">
            {fields.map((f) => (
              <li key={f.name} className="flex justify-between py-1.5">
                <span className="font-mono text-fg">{f.name}</span>
                <span className="font-mono text-muted">{f.type}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <p className="text-sm text-muted">
        The per-schema list of attestations lives off chain in the indexer,
        which is out of scope for this release. Use{" "}
        <Link href="/">subject lookup</Link> to browse a specific address, or{" "}
        <Link href={`/issue?schema=${encodeURIComponent(uid)}`}>
          issue an attestation
        </Link>{" "}
        under this schema.
      </p>
    </div>
  );
}

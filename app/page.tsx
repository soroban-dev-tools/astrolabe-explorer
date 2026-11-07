"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Schema } from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import {
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Input,
  Mono,
} from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { decodeContractError } from "@/components/toast";

interface Row {
  uid: string;
  name: string;
  schema: Schema | null;
}

export default function HomePage() {
  const { readClient, config } = useWallet();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [subject, setSubject] = useState("");

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(config.seedSchemas);
    setError(null);
    Promise.all(
      entries.map(async ([name, uid]) => ({
        uid,
        name,
        schema: await readClient.getSchema(uid).catch(() => null),
      })),
    )
      .then((r) => !cancelled && setRows(r))
      .catch((e) => !cancelled && setError(decodeContractError(e)));
    return () => {
      cancelled = true;
    };
  }, [readClient, config.seedSchemas]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Schemas</h1>
        <p className="text-sm text-muted">
          The registry does not enumerate schemas on chain by design; a full
          list is the indexer&apos;s job. Below are the seed schemas registered
          on Testnet.
        </p>
      </section>

      <section className="space-y-3">
        {error && (
          <Card className="text-sm text-red-400">Failed to load: {error}</Card>
        )}
        {rows === null && !error && <Empty>Loading schemas…</Empty>}
        {rows?.length === 0 && <Empty>No schemas configured.</Empty>}
        {rows?.map((row) => (
          <Card key={row.uid} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/schema/${row.uid}`}
                className="font-medium text-fg hover:underline"
              >
                {row.schema?.name ?? row.name}
              </Link>
              {row.schema ? (
                <Badge tone={row.schema.revocable ? "green" : "muted"}>
                  {row.schema.revocable ? "revocable" : "irrevocable"}
                </Badge>
              ) : (
                <Badge tone="red">missing</Badge>
              )}
            </div>
            <div className="text-sm text-muted">
              {row.schema?.definition ?? "—"}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
              <div className="flex items-center gap-2">
                <Mono>{row.uid}</Mono>
                <CopyButton text={row.uid} label="UID" />
              </div>
              <Link
                href={`/schema/${row.uid}`}
                className="text-xs text-accent hover:underline"
              >
                View schema details →
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Look up a subject</h2>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (subject.trim())
              router.push(`/subject/${encodeURIComponent(subject.trim())}`);
          }}
        >
          <div className="flex-1">
            <Field label="Subject address (G…)">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="GABC…"
              />
            </Field>
          </div>
          <Button type="submit">View attestations</Button>
        </form>
      </section>
    </div>
  );
}

"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Attestation } from "@astrolabe/sdk";
import { bytesToHex } from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import { Badge, Button, Card, Empty, Mono, shorten } from "@/components/ui";

interface Item {
  uid: string;
  att: Attestation | null;
  valid: boolean;
}

export default function SubjectPage() {
  const params = useParams<{ address: string }>();
  const address = decodeURIComponent(params.address);
  const { readClient, writeClient, address: connectedAddress } = useWallet();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      const uids = await readClient.attestationsForSubject(address);
      const rows = await Promise.all(
        uids.map(async (uid) => ({
          uid,
          att: await readClient.getAttestation(uid).catch(() => null),
          valid: await readClient.isValid(uid).catch(() => false),
        })),
      );
      setItems(rows);
    } catch (e) {
      setError(String(e));
    }
  }, [readClient, address]);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = async (item: Item) => {
    if (!writeClient || !item.att) return;
    setBusy(item.uid);
    try {
      await writeClient.revoke(item.att.issuer, item.uid);
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  const connected = writeClient !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Subject</h1>
        <Mono>{address}</Mono>
      </div>

      {error && <Card className="text-sm text-red-400">{error}</Card>}
      {items === null && !error && <Empty>Loading attestations…</Empty>}
      {items?.length === 0 && (
        <Empty>No attestations indexed for this subject.</Empty>
      )}

      <div className="space-y-3">
        {items?.map((item) => {
          const canRevoke =
            connected &&
            item.att !== null &&
            !item.att.revoked &&
            item.att.issuer === connectedAddress;
          return (
            <Card key={item.uid} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Mono>{item.uid}</Mono>
                <Badge tone={item.valid ? "green" : "red"}>
                  {item.valid ? "valid" : "invalid"}
                </Badge>
              </div>
              {item.att && (
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">issuer</span>
                    <Link href={`/subject/${item.att.issuer}`}>
                      {shorten(item.att.issuer)}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">schema</span>
                    <Link
                      href={`/schema/${bytesToHex(new Uint8Array(item.att.schema_uid))}`}
                    >
                      {shorten(bytesToHex(new Uint8Array(item.att.schema_uid)))}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">revoked</span>
                    <span>{item.att.revoked ? "yes" : "no"}</span>
                  </div>
                </div>
              )}
              {canRevoke && (
                <div>
                  <Button
                    variant="danger"
                    disabled={busy === item.uid}
                    onClick={() => void revoke(item)}
                  >
                    {busy === item.uid ? "Revoking…" : "Revoke"}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

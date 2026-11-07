"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Attestation } from "@astrolabe/sdk";
import { bytesToHex } from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import { Badge, Button, Card, Empty, Mono, shorten } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { ExplorerLink } from "@/components/explorer-link";
import { useToast, decodeContractError } from "@/components/toast";
import { safeDecodeAttestationData, type DecodeResult } from "@/lib/decoder";

interface Item {
  uid: string;
  att: Attestation | null;
  valid: boolean;
  schemaName?: string;
  decoded: DecodeResult | null;
}

export default function SubjectPage() {
  const params = useParams<{ address: string }>();
  const address = decodeURIComponent(params.address);
  const { readClient, writeClient, address: connectedAddress } = useWallet();
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      const uids = await readClient.attestationsForSubject(address);
      const rows = await Promise.all(
        uids.map(async (uid) => {
          const att = await readClient.getAttestation(uid).catch(() => null);
          const valid = await readClient.isValid(uid).catch(() => false);
          let schemaName: string | undefined;
          let decoded: DecodeResult | null = null;

          if (att) {
            const schemaHex = bytesToHex(new Uint8Array(att.schema_uid));
            const schema = await readClient
              .getSchema(schemaHex)
              .catch(() => null);
            if (schema) {
              schemaName = schema.name;
            }
            decoded = safeDecodeAttestationData(schema?.definition, att.data);
          }

          return {
            uid,
            att,
            valid,
            schemaName,
            decoded,
          };
        }),
      );
      setItems(rows);
    } catch (e) {
      setError(decodeContractError(e));
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
      toast.success(
        `Attestation ${shorten(item.uid)} was revoked`,
        "Revocation Successful",
      );
      await load();
    } catch (e) {
      const msg = decodeContractError(e);
      setError(msg);
      toast.error(msg, "Revocation Failed");
    } finally {
      setBusy(null);
    }
  };

  const connected = writeClient !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Subject</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Mono>{address}</Mono>
          <CopyButton text={address} label="Address" />
          <ExplorerLink type="account" value={address}>
            stellar.expert
          </ExplorerLink>
        </div>
      </div>

      {error && <Card className="text-sm text-red-400">{error}</Card>}
      {items === null && !error && <Empty>Loading attestations…</Empty>}
      {items?.length === 0 && (
        <Empty>No attestations indexed for this subject.</Empty>
      )}

      <div className="space-y-4">
        {items?.map((item) => {
          const canRevoke =
            connected &&
            item.att !== null &&
            !item.att.revoked &&
            item.att.issuer === connectedAddress;

          const schemaHex = item.att
            ? bytesToHex(new Uint8Array(item.att.schema_uid))
            : "";

          return (
            <Card key={item.uid} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <Mono>{item.uid}</Mono>
                  <CopyButton text={item.uid} label="UID" />
                </div>
                <Badge tone={item.valid ? "green" : "red"}>
                  {item.valid ? "valid" : "invalid"}
                </Badge>
              </div>

              {item.att && (
                <div className="grid gap-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted">issuer</span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/subject/${item.att.issuer}`}>
                        {shorten(item.att.issuer)}
                      </Link>
                      <CopyButton text={item.att.issuer} label="Issuer" />
                      <ExplorerLink type="account" value={item.att.issuer} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted">schema</span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/schema/${schemaHex}`}>
                        {item.schemaName ?? shorten(schemaHex)}
                      </Link>
                      <CopyButton text={schemaHex} label="Schema" />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">revoked</span>
                    <span>{item.att.revoked ? "yes" : "no"}</span>
                  </div>

                  {item.att.expiration !== undefined &&
                    item.att.expiration !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted">expiration</span>
                        <span>
                          {new Date(
                            Number(item.att.expiration) * 1000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Decoded Attestation Data Payload */}
              {item.decoded && (
                <div className="mt-3 rounded border border-border/60 bg-bg p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Attestation Data
                  </div>
                  {item.decoded.fields && item.decoded.fields.length > 0 ? (
                    <dl className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                      {item.decoded.fields.map((f) => (
                        <div
                          key={f.name}
                          className="flex justify-between border-b border-border/30 py-0.5"
                        >
                          <dt className="text-muted">{f.name}:</dt>
                          <dd className="font-mono text-fg">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-muted">
                        Raw hex:
                      </div>
                      <Mono>{item.decoded.rawHex}</Mono>
                    </div>
                  )}
                </div>
              )}

              {canRevoke && (
                <div className="pt-1">
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

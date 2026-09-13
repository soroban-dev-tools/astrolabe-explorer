"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  encodeData,
  parseDefinition,
  type FieldValue,
  type SchemaField,
} from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import { Button, Card, Empty, Field, Input, Mono } from "@/components/ui";

export default function IssuePage() {
  const { readClient, writeClient, address, config } = useWallet();
  const schemaNames = useMemo(
    () => Object.entries(config.seedSchemas),
    [config.seedSchemas],
  );
  const [selected, setSelected] = useState(schemaNames[0]?.[1] ?? "");
  const [definition, setDefinition] = useState<string | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [subject, setSubject] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    readClient
      .getSchema(selected)
      .then((s) => {
        if (cancelled || !s) return;
        setDefinition(s.definition);
        try {
          setFields(parseDefinition(s.definition));
        } catch {
          setFields([]);
        }
      })
      .catch(() => !cancelled && setDefinition(null));
    return () => {
      cancelled = true;
    };
  }, [readClient, selected]);

  const submit = async () => {
    if (!writeClient || !definition) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const typed: Record<string, FieldValue> = {};
      for (const f of fields) {
        const raw = values[f.name] ?? "";
        typed[f.name] = coerce(f, raw);
      }
      const data = encodeData(definition, typed);
      const uid = await writeClient.attest({
        issuer: address!,
        schemaUid: selected,
        subject: subject.trim(),
        data,
      });
      setResult(uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!writeClient) {
    return (
      <Empty>Connect a wallet to issue an attestation on Testnet.</Empty>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Issue an attestation</h1>

      <Card className="space-y-4">
        <Field label="Schema">
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {schemaNames.map(([name, uid]) => (
              <option key={uid} value={uid}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subject address (G…)">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="GABC…"
          />
        </Field>

        {fields.map((f) => (
          <Field key={f.name} label={`${f.name} (${f.type})`}>
            {f.type === "bool" ? (
              <select
                className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm"
                value={values[f.name] ?? "false"}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <Input
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            )}
          </Field>
        ))}

        <Button disabled={busy || !subject.trim()} onClick={() => void submit()}>
          {busy ? "Signing…" : "Attest"}
        </Button>
      </Card>

      {error && <Card className="text-sm text-red-400">{error}</Card>}
      {result && (
        <Card className="space-y-2">
          <div className="text-sm text-muted">Attestation created</div>
          <Mono>{result}</Mono>
          <Link href={`/subject/${encodeURIComponent(subject.trim())}`}>
            View on the subject page
          </Link>
        </Card>
      )}
    </div>
  );
}

function coerce(field: SchemaField, raw: string): FieldValue {
  switch (field.type) {
    case "bool":
      return raw === "true";
    case "u32":
    case "i32":
      return Number(raw);
    case "u64":
    case "i64":
      return BigInt(raw || "0");
    case "bytes":
      return raw;
    default:
      return raw;
  }
}

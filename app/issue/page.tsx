"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  encodeData,
  parseDefinition,
  type FieldValue,
  type SchemaField,
} from "@astrolabe/sdk";
import { useWallet } from "@/lib/wallet";
import {
  Button,
  Card,
  Empty,
  Field,
  Input,
  Mono,
  shorten,
} from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { useToast, decodeContractError } from "@/components/toast";
import { coerceFieldValue } from "@/lib/coercion";

function IssueForm() {
  const { readClient, writeClient, address, config } = useWallet();
  const searchParams = useSearchParams();
  const toast = useToast();

  const schemaNames = useMemo(
    () => Object.entries(config.seedSchemas),
    [config.seedSchemas],
  );

  const initialSchema = searchParams.get("schema") || schemaNames[0]?.[1] || "";
  const [selected, setSelected] = useState(initialSchema);
  const [definition, setDefinition] = useState<string | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [subject, setSubject] = useState("");
  const [expiration, setExpiration] = useState("");
  const [refUid, setRefUid] = useState("");
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
      .catch((e) => {
        if (!cancelled) {
          setDefinition(null);
          setError(decodeContractError(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [readClient, selected]);

  const submit = async () => {
    if (!writeClient || !definition) return;
    setError(null);
    setResult(null);

    let expTimestamp: number | undefined;
    if (expiration.trim()) {
      const expDate = new Date(expiration);
      if (isNaN(expDate.getTime())) {
        const msg = "Invalid expiration date format.";
        setError(msg);
        toast.error(msg, "Validation Error");
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      expTimestamp = Math.floor(expDate.getTime() / 1000);
      if (expTimestamp <= now) {
        const msg = "Expiration date must be in the future.";
        setError(msg);
        toast.error(msg, "Validation Error");
        return;
      }
    }

    setBusy(true);
    try {
      const typed: Record<string, FieldValue> = {};
      for (const f of fields) {
        const raw = values[f.name] ?? "";
        typed[f.name] = coerceFieldValue(f, raw);
      }
      const data = encodeData(definition, typed);
      const uid = await writeClient.attest({
        issuer: address!,
        schemaUid: selected,
        subject: subject.trim(),
        data,
        expiration: expTimestamp,
        refUid: refUid.trim() ? refUid.trim() : undefined,
      });
      setResult(uid);
      toast.success(
        `Attestation created with UID ${shorten(uid)}`,
        "Attestation Issued",
      );
    } catch (e) {
      const msg = decodeContractError(e);
      setError(msg);
      toast.error(msg, "Attestation Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!writeClient) {
    return <Empty>Connect a wallet to issue an attestation on Testnet.</Empty>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Issue an attestation</h1>

      <Card className="space-y-4">
        <Field label="Schema">
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {schemaNames.map(([name, uid]) => (
              <option key={uid} value={uid}>
                {name}
              </option>
            ))}
            {/* If selected schema is a custom UID not in seedSchemas */}
            {!schemaNames.some(([, uid]) => uid === selected) && selected && (
              <option value={selected}>Custom: {shorten(selected)}</option>
            )}
          </select>
        </Field>

        <Field label="Subject address (G…)">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="GABC…"
          />
        </Field>

        <Field label="Expiration Date (Optional)">
          <div className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
            {expiration && (
              <Button
                variant="ghost"
                onClick={() => setExpiration("")}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <span className="text-xs text-muted">
            Leave blank for non-expiring attestations.
          </span>
        </Field>

        <Field label="Referenced Attestation UID (Optional)">
          <Input
            value={refUid}
            onChange={(e) => setRefUid(e.target.value)}
            placeholder="Optional 64-character hex UID"
          />
        </Field>

        {fields.map((f) => (
          <Field key={f.name} label={`${f.name} (${f.type})`}>
            {f.type === "bool" ? (
              <select
                className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
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

        <Button
          disabled={busy || !subject.trim()}
          onClick={() => void submit()}
        >
          {busy ? "Signing…" : "Attest"}
        </Button>
      </Card>

      {error && <Card className="text-sm text-red-400">{error}</Card>}

      {result && (
        <Card className="space-y-3 border-accent/40 bg-accent/5">
          <div className="font-semibold text-fg">
            Attestation successfully created!
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted">Attestation UID</div>
            <div className="flex items-center gap-2">
              <Mono>{result}</Mono>
              <CopyButton text={result} label="UID" />
            </div>
          </div>
          <div className="pt-2 text-sm">
            <Link
              href={`/subject/${encodeURIComponent(subject.trim())}`}
              className="font-medium text-accent hover:underline"
            >
              View on subject page →
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function IssuePage() {
  return (
    <Suspense fallback={<Empty>Loading issue form…</Empty>}>
      <IssueForm />
    </Suspense>
  );
}

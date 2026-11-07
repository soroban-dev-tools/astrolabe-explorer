// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { decodeData, bytesToHex, type FieldValue } from "@astrolabe/sdk";

export interface DecodedField {
  name: string;
  value: string;
  rawValue: FieldValue;
}

export interface DecodeResult {
  fields: DecodedField[] | null;
  rawHex: string;
  error?: string;
}

export function formatFieldValue(val: FieldValue): string {
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "bigint" || typeof val === "number") return val.toString();
  if (
    val instanceof Uint8Array ||
    (typeof Buffer !== "undefined" && Buffer.isBuffer(val))
  ) {
    return bytesToHex(new Uint8Array(val));
  }
  return String(val);
}

export function safeDecodeAttestationData(
  definition: string | undefined | null,
  data: Uint8Array | Buffer,
): DecodeResult {
  const bytes = new Uint8Array(data);
  const rawHex = bytesToHex(bytes);

  if (!definition) {
    return { fields: null, rawHex };
  }

  try {
    const decoded = decodeData(definition, bytes);
    const fields: DecodedField[] = Object.entries(decoded).map(
      ([name, rawValue]) => ({
        name,
        value: formatFieldValue(rawValue),
        rawValue,
      }),
    );
    return { fields, rawHex };
  } catch (err) {
    return {
      fields: null,
      rawHex,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import type { FieldValue, SchemaField } from "@astrolabe/sdk";

/**
 * Coerce a raw string form input into the typed value expected by the schema field definition.
 */
export function coerceFieldValue(field: SchemaField, raw: string): FieldValue {
  switch (field.type) {
    case "bool":
      return raw === "true";
    case "u32":
    case "i32":
      return Number(raw || "0");
    case "u64":
    case "i64":
      return BigInt(raw || "0");
    case "bytes":
      return raw;
    case "address":
    case "string":
    default:
      return raw;
  }
}

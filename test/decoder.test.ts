import { describe, it, expect } from "vitest";
import { encodeData } from "@astrolabe/sdk";
import { formatFieldValue, safeDecodeAttestationData } from "@/lib/decoder";

describe("Attestation Data Decoder", () => {
  it("formats various field value types into display strings", () => {
    expect(formatFieldValue(true)).toBe("true");
    expect(formatFieldValue(false)).toBe("false");
    expect(formatFieldValue(42)).toBe("42");
    expect(formatFieldValue(BigInt(1000000000))).toBe("1000000000");
    expect(formatFieldValue("Soroban")).toBe("Soroban");
    expect(formatFieldValue(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toBe("deadbeef");
  });

  it("decodes valid attestation data into structured fields", () => {
    const definition = "string name,u32 score,bool verified";
    const values = {
      name: "Stellar Developer",
      score: 95,
      verified: true,
    };
    const encoded = encodeData(definition, values);
    const result = safeDecodeAttestationData(definition, encoded);

    expect(result.fields).not.toBeNull();
    expect(result.fields).toHaveLength(3);
    expect(result.fields![0]).toEqual({
      name: "name",
      value: "Stellar Developer",
      rawValue: "Stellar Developer",
    });
    expect(result.fields![1]).toEqual({
      name: "score",
      value: "95",
      rawValue: 95,
    });
    expect(result.fields![2]).toEqual({
      name: "verified",
      value: "true",
      rawValue: true,
    });
    expect(result.rawHex).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it("falls back to raw hex when definition is missing or null", () => {
    const rawBytes = new Uint8Array([0x01, 0x02, 0x03]);
    const result = safeDecodeAttestationData(null, rawBytes);

    expect(result.fields).toBeNull();
    expect(result.rawHex).toBe("010203");
  });

  it("gracefully catches decode errors and returns raw hex with error message", () => {
    const definition = "string name,u32 score";
    const corruptedBytes = new Uint8Array([0xff, 0x00]); // truncated/invalid
    const result = safeDecodeAttestationData(definition, corruptedBytes);

    expect(result.fields).toBeNull();
    expect(result.rawHex).toBe("ff00");
    expect(result.error).toBeDefined();
  });
});

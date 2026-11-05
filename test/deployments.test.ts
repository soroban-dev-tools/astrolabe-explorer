import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveDeployments, rpcUrl } from "@/lib/deployments";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("deployments configuration resolution", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("resolves default vendored deployments when CONSTELLATION_DEPLOYMENTS is unset", () => {
    delete process.env.CONSTELLATION_DEPLOYMENTS;
    const resolved = resolveDeployments();
    expect(resolved.networkPassphrase).toBeDefined();
    expect(resolved.contracts.attestation).toBeDefined();
    expect(resolved.contracts.schema_registry).toBeDefined();
  });

  it("resolves custom deployments when CONSTELLATION_DEPLOYMENTS points to a valid file", () => {
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `test-deployments-${Date.now()}.json`);
    const mockDeployments = {
      networkPassphrase: "Custom Network ; Passphrase",
      contracts: {
        attestation: "C_CUSTOM_ATTESTATION",
        schema_registry: "C_CUSTOM_REGISTRY",
      },
      seedSchemas: {
        custom_seed: "abcdef123456",
      },
    };
    fs.writeFileSync(tmpFile, JSON.stringify(mockDeployments));

    try {
      process.env.CONSTELLATION_DEPLOYMENTS = tmpFile;
      const resolved = resolveDeployments();
      expect(resolved.networkPassphrase).toBe("Custom Network ; Passphrase");
      expect(resolved.contracts.attestation).toBe("C_CUSTOM_ATTESTATION");
      expect(resolved.contracts.schema_registry).toBe("C_CUSTOM_REGISTRY");
      expect(resolved.seedSchemas?.custom_seed).toBe("abcdef123456");
    } finally {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  });

  it("returns default Testnet RPC URL when NEXT_PUBLIC_SOROBAN_RPC_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;
    expect(rpcUrl()).toBe("https://soroban-testnet.stellar.org");
  });

  it("returns custom RPC URL when NEXT_PUBLIC_SOROBAN_RPC_URL is set", () => {
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL =
      "http://localhost:8000/soroban/rpc";
    expect(rpcUrl()).toBe("http://localhost:8000/soroban/rpc");
  });
});

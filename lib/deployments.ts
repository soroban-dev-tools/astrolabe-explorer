// Copyright 2026 The Astrolabe Authors. Apache-2.0.
//
// Server-only resolution of the deployment truth. By default the ids come from
// the SDK's vendored deployments. A contract developer can point the app at a
// local deployment by setting CONSTELLATION_DEPLOYMENTS to a JSON file path, as
// described in the cross-repository rules (docs/multi-repo.md section 5).

import { readFileSync } from "node:fs";
import { deployments as vendored } from "@astrolabe/sdk";

export interface ResolvedDeployments {
  networkPassphrase: string;
  contracts: { attestation: string; schema_registry: string };
  seedSchemas?: Record<string, string>;
}

export function resolveDeployments(): ResolvedDeployments {
  const override = process.env.CONSTELLATION_DEPLOYMENTS;
  if (override) {
    const raw = readFileSync(override, "utf-8");
    return JSON.parse(raw) as ResolvedDeployments;
  }
  return vendored as ResolvedDeployments;
}

export function rpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
}

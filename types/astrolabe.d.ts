// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import type { Uid } from "@astrolabe/sdk";

declare module "@astrolabe/sdk" {
  interface Astrolabe {
    /** Number of attestations ever issued under a schema. */
    schemaAttestationCount(schemaUid: Uid): Promise<bigint>;
  }
}

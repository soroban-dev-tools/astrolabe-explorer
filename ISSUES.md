# Project Issues & Roadmap — astrolabe-explorer

This document tracks completed grant milestones and the curated post-grant roadmap (~10%).

---

## Completed Milestones (v0.1.0)

- [x] **E1. Decode and display attestation data** — Implemented in `lib/decoder.ts` and `app/subject/[address]/page.tsx`. Renders decoded field tables with name-value pairs and raw hex fallback.
- [x] **E2. Copy-to-clipboard and stellar.expert links** — Implemented in `components/copy-button.tsx` and `components/explorer-link.tsx`. One-click clipboard copy and deep links to stellar.expert across all views.
- [x] **E3. Toasts for write results** — Implemented in `components/toast.tsx`. Accessible toast notification system with Soroban contract trap decoder (`decodeContractError`).
- [x] **E4. Expiration input on the issue form** — Implemented in `app/issue/page.tsx` and `lib/coercion.ts`. Date/time picker with future-date validation and ledger timestamp conversion.
- [x] **E5. Accessibility and responsive pass** — Focus rings, ARIA roles, responsive navigation, custom 404 page (`app/not-found.tsx`), and root error boundary (`app/error.tsx`).
- [x] **E6. Indexer-backed browse** — Implemented in `lib/indexer.ts` and `components/recent-attestations.tsx`. Paginated recent attestation listings by schema with graceful fallback.
- [x] **E7. Global Search** — Implemented in `lib/search.ts` and `components/search-box.tsx`. Input resolver for Stellar account addresses, contract IDs, schema UIDs, and fuzzy seed schema names.

---

## Post-Grant Roadmap (Future Work)

The remaining ~10% of planned capabilities for post-grant expansion:

### E8. Schema Registration UI

**Difficulty:** intermediate  
**Likely files:** `app/schema/new/page.tsx`, `lib/wallet.tsx`  
Allow connected authorities to register new immutable schemas directly through an interactive form builder instead of CLI scripts.

**Acceptance criteria**

- Form builder for field name and type definition pairs (`string`, `bool`, `u32`, `i32`, `u64`, `i64`, `bytes`, `address`).
- Toggle for revocability and optional resolver contract ID.
- Simulation and signing via connected Stellar Wallets Kit wallet.

### E9. Off-Chain Attestation Verification

**Difficulty:** intermediate  
**Likely files:** `app/verify/page.tsx`, `lib/verify.ts`  
Support importing and verifying off-chain signed attestations against registered schemas without requiring ledger transaction submission.

**Acceptance criteria**

- JSON drag-and-drop file import for off-chain attestation envelopes.
- Cryptographic signature verification against the declared issuer address.
- Schema conformity check using schema registry on chain.

### E10. Multi-Network Switcher (Mainnet / Testnet / Futurenet)

**Difficulty:** intermediate  
**Likely files:** `lib/wallet.tsx`, `components/header.tsx`, `lib/deployments.ts`  
Add network selector in the navigation header allowing users to toggle between Stellar Mainnet, Testnet, and custom RPC deployments.

**Acceptance criteria**

- Network dropdown in navigation header with status indicator.
- Automatically re-initializes SDK client and wallet network passphrase on network change.
- Dynamic persistence in browser local storage.

### E11. Export Attestations (CSV / JSON)

**Difficulty:** good first issue  
**Likely files:** `app/subject/[address]/page.tsx`, `components/export-button.tsx`  
Allow users to export a subject's attestation history or schema attestation list to CSV or JSON for offline analysis.

**Acceptance criteria**

- "Export" dropdown button on subject and schema pages.
- Downloads properly formatted CSV or JSON file containing decoded field data.

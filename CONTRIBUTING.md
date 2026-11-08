# Contributing to astrolabe-explorer

Welcome. This repository is the web app for Astrolabe, an open attestation registry
on Stellar. You do not need to have used Stellar before; this is a Next.js app that
talks to the chain through a typed SDK.

## What this repository is, and the other two

Astrolabe lets anyone define a schema, issue a signed claim about an address, and
verify or revoke it on chain. It ships as three repositories:

- **[astrolabe-contracts](https://github.com/soroban-dev-tools/astrolabe-contracts)**
  — the Rust/Soroban contracts and the deployment truth.
- **[astrolabe-sdk](https://github.com/soroban-dev-tools/astrolabe-sdk)** — the
  TypeScript client on npm.
- **astrolabe-explorer** (you are here) — this Next.js App Router app.

Dependencies point one way and never reverse:
**contracts → SDK → explorer**. This app depends on the published SDK. It talks to
Soroban only through the SDK and never imports contract bindings directly. If the
app needs something the SDK cannot do, the fix goes in the SDK and ships as a new
SDK prerelease.

## The domain in two minutes

- **Schema** — a named, typed, immutable description of an attestation's data.
- **Attestation** — one claim under a schema: issuer, subject, data, optional
  expiry, revocable or not.
- **uid** — a 32-byte hash shown as a hex string.
- **Wallet** — issuing and revoking need a signature from a connected wallet
  (Stellar Wallets Kit). Reads never do.
- **Indexer** — optional off-chain service enabling schema-wide attestation listings.

## Repository Map

```
app/
  layout.tsx                  root layout with global providers and metadata
  page.tsx                    schema directory and subject lookup
  schema/[uid]/page.tsx       schema details, field definitions, and recent attestations
  subject/[address]/page.tsx  subject attestations view with payload decoding and revoke
  issue/page.tsx              issuance form with dynamic fields and expiration picker
  not-found.tsx               custom accessible 404 page
  error.tsx                   root error boundary with recovery action
  globals.css                 theme tokens and Tailwind layers
components/
  ui.tsx                      accessible UI primitives (Button, Card, Badge, Input, Mono)
  header.tsx                  navigation bar with wallet connect and global search
  search-box.tsx              global search component for addresses and schema uids
  recent-attestations.tsx     paginated attestation listing with graceful indexer fallback
  copy-button.tsx             clipboard copy button with visual confirmation
  explorer-link.tsx           deep links to stellar.expert for accounts, txs, and contracts
  toast.tsx                   accessible toast notification provider and error decoder
  providers.tsx               wallet and toast context wrappers
lib/
  wallet.tsx                  Stellar Wallets Kit + Astrolabe client factory
  deployments.ts              server-side deployment and RPC resolution
  decoder.ts                  safe binary attestation data decoding
  coercion.ts                 type-safe form value coercion
  indexer.ts                  optional off-chain indexer read client
  search.ts                   search query routing and resolution
test/                         comprehensive Vitest test suite
```

## Getting Set Up

Prerequisites: Node 20+ and pnpm 11+ (`corepack enable` provides pnpm).

```bash
git clone https://github.com/soroban-dev-tools/astrolabe-explorer
cd astrolabe-explorer
pnpm install
pnpm dev
# open http://localhost:3000
```

The setup is proven when the home page lists the seed schemas fetched live from
Testnet. No wallet or deployment of your own is needed to read. To issue or revoke,
connect a Testnet wallet such as Freighter.

To develop against local contracts, set `CONSTELLATION_DEPLOYMENTS`; see
[`.env.example`](.env.example) and [`docs/multi-repo.md`](docs/multi-repo.md)
section 5.

## Development Workflow

Before submitting a pull request, verify that all checks pass locally:

```bash
# Format code
pnpm format

# Verify formatting compliance
pnpm format:check

# Run static typechecking
pnpm typecheck

# Run linter
pnpm lint

# Run unit and component test suite
pnpm test

# Build production bundle
pnpm build
```

## Pull Request Guidelines

1. **Conventional Commits**: Write commit messages using the standard format:
   `type(scope): imperative description` (e.g., `feat(ui): add search box`).
2. **Test Coverage**: Accompany new features and bug fixes with unit tests in `test/`.
3. **No Contract Bindings**: Always route contract interactions through `@astrolabe/sdk`.
4. **Accessible by Default**: Ensure interactive controls have focus indicators and ARIA labels.

## Code of Conduct

Participation in this project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By contributing, you agree to uphold its standards.

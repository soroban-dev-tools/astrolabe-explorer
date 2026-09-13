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

The registry does not enumerate attestations by schema on chain; that is the
indexer's job and is out of scope for this release. The app lists the seed schemas
and looks up a subject directly.

## Repository map

```
app/
  layout.tsx              root layout; resolves deployments server side
  page.tsx                schema list and subject lookup
  schema/[uid]/page.tsx   one schema, its fields and attestation count
  subject/[address]/page.tsx  a subject's attestations, with revoke
  issue/page.tsx          issue form
  globals.css             theme tokens and Tailwind layers
components/
  ui.tsx                  small styling primitives
  header.tsx              nav and connect button
  providers.tsx           wallet provider wrapper
lib/
  wallet.tsx              Stellar Wallets Kit + Astrolabe client factory
  deployments.ts          server-side deployment resolution
```

## Getting set up

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

## Where to start

Issues carry `good first issue`, `intermediate`, and `advanced` labels. The
unclaimed work below is ordered easiest to hardest and mirrors [`ISSUES.md`](ISSUES.md),
which has full acceptance criteria.

1. **E1 — decode and display attestation data** (`good first issue`). Use the SDK's
   `decodeData` to show fields.
2. **E2 — copy buttons and stellar.expert links** (`good first issue`).
3. **E3 — toasts for write results** (`good first issue`), surfacing the contract
   error code.
4. **E4 — expiration input on the issue form** (`intermediate`).
5. **E5 — accessibility and responsive pass** (`intermediate`).
6. **E7 — search** (`intermediate`), which leans on the indexer.
7. **E6 — indexer-backed browse** (`advanced`). The single largest piece; unlocks
   schema-wide listing the chain cannot provide.

To claim an issue, comment on it and a maintainer will assign it. Open a Discussion
first for anything `advanced`.

## Rules that matter here

A reviewer will send a pull request back if it breaks any of these.

1. **Go through the SDK only.** Never import contract bindings or call Soroban RPC
   directly. All chain access is via `@astrolabe/sdk`.
2. **Every page works with no wallet connected.** Reads must never require a wallet;
   only issue and revoke do.
3. **Never accept a secret key in a form.** Signing is the wallet's job. Do not add
   a field, prop, or code path that takes a secret key.
4. **Untrusted input stays untrusted.** Addresses and attestation data are user
   input; render them safely and never build a chain call from a value supplied by
   another page's link without validation.

## Code style

- **Framework:** Next.js App Router, React, TypeScript, Tailwind CSS.
- **Linter:** ESLint via `next lint` (`pnpm lint`).
- **Types:** `pnpm typecheck` must pass.
- **Build:** `pnpm build` must succeed.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org):
  `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- **Branches:** `type/short-description`, for example `feat/data-decode`.

The exact commands CI runs, which you should run locally first:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Pull request checklist

- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` succeeds.
- [ ] All chain access goes through `@astrolabe/sdk`; no direct bindings or RPC.
- [ ] The page you touched still works with no wallet connected.
- [ ] No secret-key input anywhere.
- [ ] Commits follow Conventional Commits.
- [ ] If this needs a change in `astrolabe-sdk`, link that pull request and state
      the dependency direction.

## Releases

The app is not versioned for consumers; it deploys from `main`, and tags are for
changelog purposes only. Maintainers handle deployment. Contributors must not edit
deployment configuration in a feature pull request. Cross-repository changes land in
dependency order: contracts, then SDK, then this app (see
[`docs/multi-repo.md`](docs/multi-repo.md)).

## Security

Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md),
never in a public issue. The sensitive surfaces here are the wallet path, the
deployments override, and rendering of untrusted attestation data. Astrolabe is
unaudited and Testnet only.

## Community

Design discussion happens in this repository's GitHub Discussions. Two merged pull
requests earn triage rights on request. Commit rights are granted per repository;
because this is an application repository, they are granted more readily than in the
protocol repository, once you have a track record of reviewed work. Small pull
requests get reviewed faster than large ones.

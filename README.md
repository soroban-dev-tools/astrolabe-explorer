# astrolabe-explorer

The web app for **Astrolabe**, an open attestation registry on Stellar's Soroban
platform. Browse schemas, look up a subject's attestations, and issue or revoke
attestations from a connected wallet, all on Testnet.

> **Status:** unaudited, Testnet only.

## The three repositories

Astrolabe ships as three repositories; dependencies point one way and never
reverse:

```
astrolabe-contracts  ->  astrolabe-sdk  ->  astrolabe-explorer
```

- **[astrolabe-contracts](https://github.com/soroban-dev-tools/astrolabe-contracts)**
  — the Soroban contracts and deployment truth.
- **[astrolabe-sdk](https://github.com/soroban-dev-tools/astrolabe-sdk)** — the
  TypeScript client.
- **astrolabe-explorer** (this repo) — this Next.js app.

The app talks to Soroban **only through `@astrolabe/sdk`**. It never imports
contract bindings directly. If the app needs something the SDK cannot do, the fix
goes in the SDK.

## What it does

- **Schemas** — lists the seed schemas registered on Testnet, with each schema's
  fields and attestation count.
- **Subject lookup** — shows the capped, recent attestations for an address, with a
  validity badge, and a revoke button when your connected wallet issued one.
- **Issue** — pick a schema, fill its fields, and attest to a subject from your
  wallet.

Every page works with no wallet connected; only issuing and revoking need one.

## Run it locally

Prerequisites: Node 20+ and pnpm 11+.

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

The reads work immediately against Testnet. To issue or revoke, connect a Testnet
wallet (for example Freighter) through the Connect button.

### Point at a local contract deployment

A contract developer can run the app against a local deployment by setting
`CONSTELLATION_DEPLOYMENTS` to a deployment JSON file, as described in
[`docs/multi-repo.md`](docs/multi-repo.md) section 5:

```bash
CONSTELLATION_DEPLOYMENTS=../astrolabe-contracts/deployments/local-testnet.json pnpm dev
```

See [`.env.example`](.env.example) for the supported variables.

## The SDK dependency

This app depends on `@astrolabe/sdk`. Once the SDK prerelease is published, install
it from npm as usual. For local development across both repositories, link them:

```bash
# in astrolabe-sdk
pnpm build && pnpm link --global
# in astrolabe-explorer
pnpm link --global @astrolabe/sdk
```

## Develop

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Deploy

The app is a standard Next.js App Router project and deploys to any Next host. Set
`CONSTELLATION_DEPLOYMENTS` only if you are not using the SDK's vendored ids. The
public deployment URL will be listed here once published.

## License

Apache-2.0. See [`LICENSE`](LICENSE).

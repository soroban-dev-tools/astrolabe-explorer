# Security Policy

## Reporting a vulnerability

Report vulnerabilities privately by email to **security@soroban-dev-tools.org**.
Do not open a public issue for a security problem.

We will acknowledge your report and keep you updated. Please allow reasonable time
for a fix before public disclosure.

## Scope

This repository is the web app. The sensitive surfaces here are:

- **The wallet path.** Signing goes through Stellar Wallets Kit. The app must never
  accept, request, store, or transmit a secret key. A form field or code path that
  takes a secret key is a vulnerability.
- **The deployments override.** `CONSTELLATION_DEPLOYMENTS` reads a JSON file server
  side for local development. Do not expose arbitrary file reads to the client or
  accept a deployments source from user input.
- **Injection through attestation data.** Attestation data and addresses are
  untrusted input rendered in the UI; report any stored-XSS or unsafe rendering.

On-chain behaviour belongs in `astrolabe-contracts`; client/encoding issues belong
in `astrolabe-sdk`.

## Status

Astrolabe is unaudited and Testnet only. Do not connect a Mainnet wallet or rely on
it to protect anything of value until the contracts repository's README states an
audit has completed.

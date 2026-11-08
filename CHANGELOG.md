# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Optional off-chain indexer client (`lib/indexer.ts`) with graceful fallback to on-chain lookups.
- Recent attestations paginated list component (`RecentAttestations`) for schema detail pages.
- Global navigation search box (`SearchBox`) resolving Stellar account addresses, contract IDs, schema UIDs, and fuzzy seed schema names.
- Accessible toast notification system (`ToastProvider`, `useToast`, `<Toaster />`) with contract error translation.
- Soroban contract error code decoder (`decodeContractError`) mapping contract traps #1–#9 to readable English explanations.
- Reusable `CopyButton` with visual clipboard confirmation and accessible ARIA attributes.
- Reusable `ExplorerLink` for deep-linking to stellar.expert across Testnet accounts, contracts, and transactions.
- Attestation payload decoder (`safeDecodeAttestationData`) mapping raw bytes to typed schema fields with raw hex fallback.
- Optional expiration date picker with future-date validation on attestation issuance form.
- Custom 404 page (`app/not-found.tsx`) and root error boundary (`app/error.tsx`).
- Prettier code formatter and comprehensive Vitest test suite with 57 unit and component tests.
- Contributor templates for bug reports, feature requests, and pull requests.
- Contributor Covenant Code of Conduct.

### Changed

- Improved keyboard focus ring styling across buttons, inputs, and form controls.
- Enhanced subject page with decoded field tables, formatted expiration timestamps, and issuer revoke controls.
- Updated CI workflow to enforce formatting check, lint, static typechecking, unit tests, and production build.

## [0.1.0] - 2026-11-03

### Added

- Initial Next.js application scaffold with Tailwind CSS.
- Schema browsing for seed schemas on Stellar Testnet.
- Direct subject lookup by Stellar address (`/subject/[address]`).
- Attestation issuance under registered schemas (`/issue`).
- Attestation revocation for connected issuing wallets.
- Integration with `@creit.tech/stellar-wallets-kit` supporting Freighter, xBull, Albedo, and Lobstr.

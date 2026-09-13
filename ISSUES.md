# Open Issues — astrolabe-explorer

Unclaimed work in the web app, ordered easiest to hardest. Difficulty labels:
`good first issue`, `intermediate`, `advanced`. This list is the source of truth
for the "Where to start" section of `CONTRIBUTING.md`.

The single largest unclaimed piece is **E6, the indexer-backed browse experience**,
which unlocks schema-wide and issuer-wide listing that the chain cannot provide.

---

## E1. Decode and display attestation data

**Difficulty:** good first issue
**Likely files:** `app/subject/[address]/page.tsx`, `lib/`

Attestations show metadata but not their decoded `data`. Fetch the schema for each
attestation and use `decodeData` from the SDK to render the fields.

**Acceptance criteria**
- Each attestation row shows its decoded fields with names and values.
- Decode failures degrade gracefully to a raw-bytes view.

## E2. Copy-to-clipboard and stellar.expert links

**Difficulty:** good first issue
**Likely files:** `components/ui.tsx`, pages

uids and addresses are shown truncated. Add copy buttons and links to
stellar.expert for addresses and transactions.

**Acceptance criteria**
- One-click copy for every uid and address.
- External links open the Testnet explorer.

## E3. Toasts for write results

**Difficulty:** good first issue
**Likely files:** `components/`, `app/issue/page.tsx`, `app/subject/[address]/page.tsx`

Attest and revoke report inline. Add a small toast system for success and error,
including the contract error code surfaced by the SDK.

**Acceptance criteria**
- Success and failure toasts for attest and revoke.
- The contract error code is shown on failure.

## E4. Expiration input on the issue form

**Difficulty:** intermediate
**Likely files:** `app/issue/page.tsx`

The issue form cannot set an expiry. Add an optional expiration (date/time picker)
that maps to a ledger timestamp and passes through to `attest`.

**Acceptance criteria**
- Optional expiry; empty means non-expiring.
- The resulting attestation reflects the expiry in its validity.

## E5. Accessibility and responsive pass

**Difficulty:** intermediate
**Likely files:** `components/`, `app/`

Audit for keyboard navigation, focus states, colour contrast, and mobile layout.
Every page must work with no wallet connected.

**Acceptance criteria**
- Keyboard-only flows work end to end.
- Meets WCAG AA contrast; no layout breakage down to 360px width.

## E6. Indexer-backed browse

**Difficulty:** advanced
**Likely files:** new service, `app/schema/[uid]/page.tsx`, `app/`

The chain does not enumerate attestations by schema or issuer. Build (or integrate)
the indexer read API so a schema page can list its recent attestations and issuers
can be browsed. This is the largest piece and pairs with the indexer work in the
project roadmap.

**Acceptance criteria**
- A schema page lists recent attestations from the indexer with pagination.
- The app still works, in a reduced form, when the indexer is unavailable.

## E7. Search

**Difficulty:** intermediate
**Likely files:** `app/`, indexer API

Add search over schemas and addresses. Depends on E6 for anything beyond the seed
schemas and a direct address lookup.

**Acceptance criteria**
- Search box resolves a schema by name and an address to its subject page.
- Empty and no-result states are handled.

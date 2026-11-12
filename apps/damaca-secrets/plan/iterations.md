# Product iterations

This file is the source of iteration status. Follow the [root workflow](../../../plan/workflow.md). Evidence belongs in the [delivery log](iteration-log.md).

## 01 — Google access and app foundation

- Status: `validated`.
- Paths: app scaffold, identity and access, root lockfile and inventory.
- Dependencies: Google and MongoDB for live identity acceptance.
- Acceptance: independent workspace, durable identity, verified Google account gate, role checks and admin review. Local checks cover the authorization rules. Live Google acceptance belongs to iteration 04.

## 02 — Personal encrypted vault

- Status: `validated`.
- Paths: app vault, browser cryptography, account UI, MongoDB repository and API.
- Dependencies: 01.
- Acceptance: authenticated encryption for all entry fields, isolated access, password and passkey unlock, recovery and atomic rekey, compact CRUD, search, generation, copy, locking, and conflict handling. Validate protocol and cryptography locally.

## 03 — Offline consultation

- Status: `pending`.
- Paths: app PWA shell and service worker, browser storage, vault UI and API.
- Dependencies: 02.
- Acceptance: opt-in encrypted snapshot, password unlock in airplane mode, configurable 24-hour validity, cleanup on logout and denial, online revalidation, and read-only offline use.

## 04 — Vercel preview and device acceptance

- Status: `pending`.
- Paths: app deployment configuration and acceptance evidence.
- Dependencies: 01–03, a stable HTTPS preview origin, dedicated OAuth credentials and MongoDB, and an Android device.
- Acceptance: verify end-to-end Google, permission, vault, passkey, and offline flows with synthetic accounts, narrow viewport and desktop, Android Chrome, and no plaintext leakage. Record actual results and gaps.

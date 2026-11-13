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

- Status: `validated`.
- Paths: app PWA shell and service worker, browser storage, vault UI and API.
- Dependencies: 02.
- Acceptance: opt-in encrypted snapshot, password unlock in airplane mode, configurable 24-hour validity, cleanup on logout and denial, online revalidation, and read-only offline use.

## 04 — Vercel preview and device acceptance

- Status: `blocked`.
- Paths: app deployment configuration and acceptance evidence.
- Dependencies: 01–03, dedicated Google OAuth credentials, a MongoDB URI restricted to the preview database, test administrators, and an Android device. The Vercel project and branch origin are configured. See [Preview setup](../README.md#preproducción).
- Acceptance: verify end-to-end Google, permission, vault, passkey, and offline flows with synthetic accounts, narrow viewport and desktop, Android Chrome, and no plaintext leakage. Record actual results and gaps.

## 05 — Local development startup

- Status: `validated`.
- Paths: app development script and server session lookup.
- Acceptance: the normal workspace dev command serves Google sign-in on a cold start without an external MongoDB module error or waiting on MongoDB for anonymous requests. Requests carrying a session still use Better Auth and MongoDB to validate identity.

## 06 — Compact controls

- Status: `validated`.
- Paths: app navigation, shared controls, and vault, access, and settings screens.
- Acceptance: reduce control height across the app, prefer recognizable icons with accessible action names, and keep meaningful text on workflow choices. Verify narrow mobile and desktop layouts.

## 07 — Password generation

- Status: `validated`.
- Paths: vault generator and credential form.
- Acceptance: every generated password has 24 valid characters and the form confirms generation while keeping the value masked.

# Product iterations

This file is the source of iteration status. Follow the [root workflow](../../../plan/workflow.md). Evidence belongs in the [delivery log](iteration-log.md).

## 01 — Google access and app foundation

- Status: `validated`.
- Paths: app scaffold, identity and access, root lockfile and inventory.
- Dependencies: Google and MongoDB for live identity acceptance.
- Acceptance: independent workspace, durable identity, verified Google account gate, role checks and admin review. Local checks cover the authorization rules. Live Google acceptance belongs to iteration 04. [Archived evidence](archive/2026-11-13/iteration-log.md#01--google-access-and-app-foundation).

## 02 — Personal encrypted vault

- Status: `validated`.
- Paths: app vault, browser cryptography, account UI, MongoDB repository and API.
- Dependencies: 01.
- Acceptance: authenticated encryption for all entry fields, isolated access, password and passkey unlock, recovery and atomic rekey, compact CRUD, search, generation, copy, locking, and conflict handling. Validate protocol and cryptography locally. [Archived evidence](archive/2026-11-13/iteration-log.md#02--personal-encrypted-vault).

## 03 — Offline consultation

- Status: `validated`.
- Paths: app PWA shell and service worker, browser storage, vault UI and API.
- Dependencies: 02.
- Acceptance: opt-in encrypted snapshot, password unlock in airplane mode, configurable 24-hour validity, cleanup on logout and denial, online revalidation, and read-only offline use. [Archived evidence](archive/2026-11-15/iteration-log.md#03--offline-consultation).

## 04 — Vercel preview and device acceptance

- Status: `validated`.
- Paths: app deployment configuration and acceptance evidence.
- Dependencies: 01–03, dedicated Google OAuth credentials, a MongoDB URI restricted to the preview database, test administrators, and an Android device. The Vercel project and branch origin are configured. See [deployments](../README.md#despliegues).
- Acceptance: verify end-to-end Google, permission, vault, passkey, and offline flows with synthetic accounts, narrow viewport and desktop, Android Chrome, and no plaintext leakage. Record actual results and gaps. [Archived evidence](archive/2026-11-15/iteration-log.md#04--vercel-preview-and-device-acceptance).

## 05 — Local development startup

- Status: `validated`.
- Paths: app development script and server session lookup.
- Acceptance: the normal workspace dev command serves Google sign-in on a cold start without an external MongoDB module error or waiting on MongoDB for anonymous requests. Requests carrying a session still use Better Auth and MongoDB to validate identity. [Archived evidence](archive/2026-11-15/iteration-log.md#05--local-development-startup).

## 06 — Compact controls

- Status: `validated`.
- Paths: app navigation, shared controls, and vault, access, and settings screens.
- Acceptance: reduce control height across the app, prefer recognizable icons with accessible action names, and keep meaningful text on workflow choices. Verify narrow mobile and desktop layouts. [Archived evidence](archive/2026-11-20/iteration-log.md#06--compact-controls).

## 07 — Password generation

- Status: `validated`.
- Paths: vault generator and credential form.
- Acceptance: every generated password has 24 valid characters and the form confirms generation while keeping the value masked. [Archived evidence](archive/2026-11-20/iteration-log.md#07--password-generation).

## 08 — Vault settings and editor actions

- Status: `validated`.
- Paths: vault editor, Settings security section, and shared icon buttons.
- Acceptance: security controls are reachable through Settings and require vault unlock. Save and cancel sit beside lock in the editor header. Icon actions have filled backgrounds, with green for save, red for cancel, and blue for generation. [Archived evidence](archive/2026-11-20/iteration-log.md#08--vault-settings-and-editor-actions).

## 09 — Vault header alignment

- Status: `validated`.
- Paths: vault heading and entry editor.
- Acceptance: lock sits immediately after the Vault title. Save and cancel stay flush with the right edge of the editor.

## 10 — Vault action colors

- Status: `validated`.
- Paths: shared icon button and vault actions.
- Acceptance: copy matches password generation in blue, show and hide use violet, edit uses amber, back stays neutral gray, and lock uses slate.

## 11 — Vault security documentation

- Status: `validated`.
- Paths: app README.
- Acceptance: document client-side encryption, MongoDB contents, key-unlock methods, security limits, and explanatory diagrams consistent with implementation. Validate local links, consistency, and `git diff --check`.

## 12 — Deployment README cleanup

- Status: `validated`.
- Paths: app README and planning records.
- Dependencies: preview acceptance in iteration 04.
- Acceptance: replace the completed first-preview checklist with current deployment links and preserve the observed acceptance evidence. Verify local links and `git diff --check`.

## 13 — Spanish and English interface

- Status: `validated`.
- Paths: Damaca Secrets UI, locale preference, offline shell, metadata, and app plans.
- Dependencies: existing settings, access flows, and offline shell.
- Acceptance: Spanish default, persistent English or Spanish selection, localized visible and accessible copy throughout the app, and offline read-only access in the selected language.
- Validation: incremental Biome, types, tests, build, manifests for both branches, and mobile, desktop, and offline browser checks.

## 14 — Automatic offline vault

- Status: `validated`.
- Paths: vault unlock and save flows, browser offline storage and settings, localized copy, and app plans.
- Dependencies: encrypted offline shell and server-issued lease from iteration 03.
- Acceptance: successful online unlock prepares the encrypted copy automatically, saves do not renew the lease, and a browser-level opt-out removes the copy.
- Validation: incremental Biome, types, storage regression tests, production build, and Chrome offline acceptance at narrow and desktop widths.

## 15 — Passkey prompt at vault entry

- Status: `validated`.
- Paths: main vault unlock flow, WebAuthn request, browser-local passkey preference, and app plans.
- Dependencies: existing WebAuthn PRF vault unlock and authenticated snapshot.
- Acceptance: try the known passkey once on online vault entry, retain manual unlock and password fallback, and cancel pending verification on dismissal, navigation, or locking.
- Validation: incremental Biome, types, passkey and storage regressions, production build, and Chrome virtual WebAuthn verification.
- Device acceptance pending: verify the visible biometric prompt in Chrome for Android (browser and installed app) and Safari desktop.

## 16 — Start a new vault

- Status: `validated`.
- Paths: vault reset, session proof, repository, browser offline storage and unlock UI.
- Acceptance: the verified owner can replace a locked vault after a new Google login and explicit confirmation. The reset is revision-bound and invalidates old offline copies on reconnect.

## 17 — Trusted contacts

- Status: `validated`.
- Paths: recovery configuration, requests, browser key storage, notifications and settings.
- Acceptance: two of three enrolled contacts can approve recovery for the same device and vault generation. Recovery preserves entries and rotates keys.
- Approved dependency: audited `shamir-secret-sharing@0.0.4` from Privy.
- Validation passed for cryptography, device storage, authenticated HTTP flow and the production build. Live Google, browser visual checks and delivery through a configured Resend account remain pending.

## 18 — Compact unlock and password reveal

- Status: `validated`.
- Paths: password fields, unlock and recovery UI, page headings, and app plans.
- Acceptance: one-second reveal, compact online and offline unlock, ordered recovery options online, and accessible visually hidden page headings.
- Validation: Biome, types, tests, build, and browser checks at 320 px and desktop.

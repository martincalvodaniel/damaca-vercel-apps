# Delivery log

Record observed evidence for completed iterations here. Do not record planned work as completed evidence.

## 01 — Google access and app foundation

- Initial Codex capacity: 95% of 5 hours and 45% of 7 days.
- Generated the independent workspace on port 3007. Configured Better Auth with durable MongoDB identity and sessions, Google-only account creation, verified identities, and live application grants. Administrators retain the starter's review and revocation flows.
- Passed scoped Biome, TypeScript, and 37 Bun tests. MongoDB integration passed against a disposable loopback database. Compiled HTTP checks passed for verified identities, administrator separation, requests, approval, and revocation using persistent fixture sessions.
- The default Turbopack build hit the host's internal port restriction. The scoped Webpack production build passed, and Chrome rendered sign-in at 320 and 1200 CSS pixels with no horizontal overflow. Real OAuth and Android acceptance are tracked in iteration 04.

## 02 — Personal encrypted vault

- Capacity near the start: 86% of 5 hours and 44% of 7 days. The initial push selected the wrong loaded SSH identity. Forcing the configured personal identity for this invocation published and verified iteration 01.
- Added browser AES-256-GCM encryption with owner and purpose binding, Argon2id password derivation, PRF and recovery wrappers, atomic versioned saves, key rotation, a nonce-based CSP, and the compact vault UI.
- Scoped Biome, TypeScript, 39 Bun tests, and the Webpack production build passed. The compiled HTTP suite passed with disposable MongoDB and verified per-user isolation, strict input, same-origin writes, a concurrent creation conflict, ciphertext persistence, and revocation. Chrome verified setup, entry creation, hidden passwords, recovery, lock and unlock, and no horizontal overflow at 320 and 1200 CSS pixels. The browser check verified the API response omitted the fixture's plaintext.
- Real Google and Android PRF checks still belong to iteration 04. The Vercel CLI found no `damaca-secrets` project in the configured team.

## 03 — Offline consultation

- Starting capacity: 75% of 5 hours and 42% of 7 days.
- Added opt-in IndexedDB storage for the encrypted password-unlock snapshot, a build-versioned neutral shell, and a runtime lease with a 24-hour default. Account changes, denied access, sign-out, and opt-out clear the snapshot.
- Passed scoped Biome, TypeScript, 42 Bun tests, and the Webpack production build. Chrome at 320 CSS pixels reopened the normal URL after stopping the server, unlocked read-only data, expired a shortened configurable lease, and removed the snapshot after online denial. Cache Storage contained only the neutral shell and build assets. The IndexedDB fixture contained neither plaintext nor passkey and recovery wrappers.

## 04 — Vercel preview and device acceptance

- Preparation capacity: 63% of 5 hours and 40% of 7 days.
- Created and verified the Vercel project in the configured team, linked to the monorepo with root `apps/damaca-secrets` and access to workspace sources outside that directory. Verified `damaca-secrets-int.vercel.app` is assigned to `int`, and set the Preview-only origin, database name, and generated session secret.
- Enabled Better Auth OAuth token encryption. The final Webpack production build, TypeScript, 42 unit tests, and compiled integration passed with synthetic data. Integration confirmed a Google authorization redirect with the expected callback, state, and PKCE.
- Chrome's virtual WebAuthn PRF authenticator registered and unlocked a vault on `localhost`. Chrome rejected the raw loopback IP as a relying-party domain. Physical Android and the real Google callback remain pending.
- Vercel reported zero deployments. The Google OAuth client, MongoDB URI restricted to the preview database, and administrator allowlist are needed before deploying the validated `int` SHA. The exact inputs, callback, and device acceptance steps are in [Preview setup](../README.md#preproducción).

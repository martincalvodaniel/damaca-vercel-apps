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

- On 2026-11-13, the owner reported successful installation from Preview (`int`) in Chrome on Android and real Google sign-in as an administrator. The owner then confirmed all four acceptance scenarios: request, approval and account isolation, vault synchronization and passkey unlock, airplane-mode consultation and revocation with local copy removal after reconnecting, and recovery with a new master password. The local ciphertext and viewport checks are recorded in iterations 01–03.

## 05 — Local development startup

- Starting capacity: 100% of 5 hours and 39% of 7 days.
- Reproduced HTTP 500 on the active local server and twice on a cold copy of the workspace. Bun running Turbopack failed to resolve the generated MongoDB external alias. Running Next.js dev with Node resolved the driver. Session lookup also skips Better Auth initialization when the session cookie is absent.
- The root dev command served Google sign-in with HTTP 200 from a cold Node and Turbopack start in 1.85 seconds with MongoDB deliberately unreachable. Scoped Biome, TypeScript, 42 Bun tests, the Webpack production build, and the compiled HTTP integration with disposable MongoDB passed.
- Publication remains pending because local `int` already includes the unrelated unpublished commit `44e6431`. The remote was verified at `cd939db` before preparing this fix.

## 06 — Compact controls

- Starting capacity: 87% of 5 hours and 37% of 7 days.
- Added shared, accessible icon buttons and compact controls across the vault, sign-in, settings, access administration, and offline screens. The mobile navigation now places icons beside their labels. The app instructions record the default preference for recognizable icon actions.
- Biome, TypeScript, 42 tests, the Webpack build, and the compiled HTTP integration passed. Chrome completed setup, create, show, lock, recovery, and unlock at 320px, plus unlock at 1200px. Measured 36px icon buttons, 44px two-line credential rows, and 49px mobile navigation. Both widths had no horizontal overflow.
- The commit remains local because publishing the current `int` would include the unrelated unpublished commit `44e6431`.

## 07 — Password generation

- Starting capacity: 77% of 5 hours and 35% of 7 days.
- Reproduced out-of-range alphabet indices that appended `undefined`. Mapped accepted random bytes into the alphabet while keeping unbiased sampling. The entry form now confirms generation and keeps the field masked.
- Passed a deterministic regression, 1,000 generated samples of exactly 24 characters, 43 tests, TypeScript, Biome, and the Webpack build. Chrome at 320px confirmed generation, masking, and saving the exact generated value. Desktop unlock passed at 1200px.
- Publication is pending because `int` still contains the unrelated local commit `44e6431`.

## 08 — Vault settings and editor actions

- Starting capacity: 71% of 5 hours and 35% of 7 days.
- Moved vault security and offline controls to Settings, where the user unlocks the vault before managing them. The entry editor puts save and cancel beside lock. Shared icon buttons have filled backgrounds and keep accessible action names.
- Biome, TypeScript, 43 tests, and the Webpack build passed. Chrome verified the editor header, cancel, generation and save at 320px, plus Settings unlock and access to password change and offline controls at 1200px.
- Publication remains pending because `int` includes the unrelated local commit `44e6431`.

## 09 — Vault header alignment

- Starting capacity: 67% of 5 hours and 34% of 7 days.
- Grouped the lock icon with the Vault heading. Save and cancel remain together at the far right of the entry editor.
- Biome, TypeScript, and the Webpack build passed. Chrome confirmed an 8px title-to-lock gap, right-aligned editor actions, no horizontal overflow, and working cancel and lock at 320px and 1200px.
- Publication remains pending because `int` includes the unrelated local commit `44e6431`.

## 10 — Vault action colors

- Starting capacity: 64% of 5 hours and 33% of 7 days.
- Copy uses the generator's blue, password visibility uses violet, edit uses amber, back stays neutral gray, and lock uses slate across the vault, Settings, and offline.
- Biome, TypeScript, and the Webpack build passed. Chrome checked matching copy and generator backgrounds, the same color in both eye states, and the vault flow at 320px and 1200px.
- Publication remains pending because `int` includes the unrelated local commit `44e6431`.

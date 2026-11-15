# Archived delivery evidence

## 03 — Offline consultation

- Starting capacity: 75% of 5 hours and 42% of 7 days.
- Added opt-in IndexedDB storage for the encrypted password-unlock snapshot, a build-versioned neutral shell, and a runtime lease with a 24-hour default. Account changes, denied access, sign-out, and opt-out clear the snapshot.
- Passed scoped Biome, TypeScript, 42 Bun tests, and the Webpack production build. Chrome at 320 CSS pixels reopened the normal URL after stopping the server, unlocked read-only data, expired a shortened configurable lease, and removed the snapshot after online denial. Cache Storage contained only the neutral shell and build assets. The IndexedDB fixture contained neither plaintext nor passkey and recovery wrappers.

## 04 — Vercel preview and device acceptance

- Preparation capacity: 63% of 5 hours and 40% of 7 days.
- Created and verified the Vercel project in the configured team, linked to the monorepo with root `apps/damaca-secrets` and access to workspace sources outside that directory. Verified `damaca-secrets-int.vercel.app` is assigned to `int`, and set the Preview-only origin, database name, and generated session secret.
- Enabled Better Auth OAuth token encryption. The final Webpack production build, TypeScript, 42 unit tests, and compiled integration passed with synthetic data. Integration confirmed a Google authorization redirect with the expected callback, state, and PKCE.
- Chrome's virtual WebAuthn PRF authenticator registered and unlocked a vault on `localhost`. Chrome rejected the raw loopback IP as a relying-party domain. Physical Android and the real Google callback remain pending.
- Vercel reported zero deployments. The Google OAuth client, MongoDB URI restricted to the preview database, and administrator allowlist are needed before deploying the validated `int` SHA.

- On 2026-11-13, the owner reported successful installation from Preview (`int`) in Chrome on Android and real Google sign-in as an administrator. The owner then confirmed all four acceptance scenarios: request, approval and account isolation, vault synchronization and passkey unlock, airplane-mode consultation and revocation with local copy removal after reconnecting, and recovery with a new master password. The local ciphertext and viewport checks are recorded in iterations 01–03.

## 05 — Local development startup

- Starting capacity: 100% of 5 hours and 39% of 7 days.
- Reproduced HTTP 500 on the active local server and twice on a cold copy of the workspace. Bun running Turbopack failed to resolve the generated MongoDB external alias. Running Next.js dev with Node resolved the driver. Session lookup also skips Better Auth initialization when the session cookie is absent.
- The root dev command served Google sign-in with HTTP 200 from a cold Node and Turbopack start in 1.85 seconds with MongoDB deliberately unreachable. Scoped Biome, TypeScript, 42 Bun tests, the Webpack production build, and the compiled HTTP integration with disposable MongoDB passed.
- Publication remains pending because local `int` already includes the unrelated unpublished commit `44e6431`. The remote was verified at `cd939db` before preparing this fix.

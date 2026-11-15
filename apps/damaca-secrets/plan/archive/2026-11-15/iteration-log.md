# Archived delivery evidence

## 03 — Offline consultation

- Starting capacity: 75% of 5 hours and 42% of 7 days.
- Added opt-in IndexedDB storage for the encrypted password-unlock snapshot, a build-versioned neutral shell, and a runtime lease with a 24-hour default. Account changes, denied access, sign-out, and opt-out clear the snapshot.
- Passed scoped Biome, TypeScript, 42 Bun tests, and the Webpack production build. Chrome at 320 CSS pixels reopened the normal URL after stopping the server, unlocked read-only data, expired a shortened configurable lease, and removed the snapshot after online denial. Cache Storage contained only the neutral shell and build assets. The IndexedDB fixture contained neither plaintext nor passkey and recovery wrappers.

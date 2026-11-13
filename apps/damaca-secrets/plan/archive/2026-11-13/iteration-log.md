# Archived delivery evidence

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

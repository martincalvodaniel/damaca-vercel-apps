# Delivery log

Record observed evidence for completed iterations here. See [archived evidence](archive/2026-11-13/iteration-log.md) for iterations 01 and 02 and [offline, preview, and startup evidence](archive/2026-11-15/iteration-log.md) for iterations 03 through 05. See [controls and generation evidence](archive/2026-11-20/iteration-log.md) for iterations 06 through 08.

## 18 — Compact unlock and password reveal

- Starting capacity was 61% of 5 hours and 76% of 7 days.
- Added one-second password reveal, compact unlock controls, ordered recovery options on both online unlock screens, and visually hidden page headings.
- Passed staged Biome, TypeScript, 52 Bun tests, the Webpack build and compiled integration with synthetic MongoDB. Integration exercised the existing contact and reset routes.
- Chrome at 320 and 1200 CSS px verified layout, option order, cancellation, timed reveal and restart, focus, keyboard unlock, password generation, virtual WebAuthn PRF, offline unlock, and code recovery in Settings. Real Google consent was outside the local browser run.

## 17 — Trusted contacts

- Added the approved audited Shamir dependency, browser-local device keys, encrypted shares, enrollment, approvals, and verified recovery. Reset and contact recovery use separate OAuth authorization scopes.
- Passed Biome, TypeScript, 52 tests, the Webpack production build and compiled HTTP integration on disposable MongoDB with synthetic identities. The HTTP flow confirmed invitation acceptance, cancellation, duplicate and outsider rejection, reconstruction, preservation of an entry and key rotation.
- Resend notices use optional runtime configuration. Live email delivery, real Google consent and visual browser acceptance were not exercised.

## 16 — Start a new vault

- Starting capacity was 94% of 5 hours and 81% of 7 days.
- Added Google session renewal, a revision-bound reset authorization, atomic replacement and offline generation invalidation.
- Passed scoped Biome, TypeScript, Bun tests, Webpack build, and HTTP integration against disposable MongoDB. The HTTP integration used synthetic sessions to check authorization and concurrent writes. Live Google consent and visual browser acceptance remain pending.

## 15 — Passkey prompt at vault entry

- Starting capacity: 58% of 5 hours and 66% of 7 days.
- Online vault entry offers the browser's remembered passkey once and keeps password and manual unlock available. The reference is scoped to the vault owner. Pending requests are aborted on manual selection, locking, and navigation.
- Passed staged Biome, TypeScript, 49 Bun tests, and the scoped Webpack build. A Chrome virtual authenticator exercised real PRF registration and automatic unlock without a gesture at 320 and 1200 CSS pixels. Simulated pending or dismissed requests verified cancellation, password fallback, manual replacement, route exit, and no retry. Also verified manual lock, settings, removing a passkey, and offline password-only reopening.
- Physical biometric prompts on Chrome for Android, including installed mode, and Safari desktop are pending device acceptance.

## 14 — Automatic offline vault

- Starting capacity: 73% of 5 hours and 69% of 7 days.
- A successful online unlock or vault creation prepares the encrypted read-only copy. Online saves update the copy without extending its server-issued lease. Settings now exposes the browser opt-out, copy readiness, and expiration in both languages.
- Passed scoped Biome, TypeScript, 47 Bun tests, the compiled HTTP integration against disposable MongoDB, and the scoped Webpack build. Tests cover stale writes after clearing or opting out, account mismatch, expiry, and revision ordering.
- Chrome at 320 and 1200 CSS pixels verified automatic preparation, reopening with the server stopped, keeping the original expiration after edits, browser opt-out and reactivation, and continued online unlock with IndexedDB unavailable. Desktop also revealed a stored password while offline and verified copy cleanup after the server denied the session and after choosing another account. Browser checks used a synthetic session and password unlock.

## 13 — Spanish and English interface

- Starting capacity on 2026-11-15 at approximately 15:49 CET: 89% of 5 hours and 71% of 7 days.
- Added the browser language selector, Spanish default, typed catalogs, translated forms and feedback, and locale-aware document metadata. The cached offline shell stays public and reads the browser preference.
- Passed Biome for the changed source and integration files, TypeScript, 45 Bun tests, compiled HTTP integration against disposable MongoDB, and Webpack builds for the default and int installation names. Checked served manifest links, names, and icon dimensions.
- Chrome at 320 and 1200 CSS pixels confirmed both languages, accessible labels and validation, persistence after reload and account switch, and read-only offline reopening and unlock after stopping the server. The checks used synthetic sessions. Physical Android installation and live Google consent were outside these local checks.

## 12 — Deployment README cleanup

- Starting capacity on 2026-11-13 at 21:50 CET: 100% of 5 hours and 24% of 7 days.
- Replaced the first-preview setup and acceptance checklist with the deployment links. Kept the owner-confirmed results in iteration 04 and archived evidence from iterations 01 and 02.
- Checked local link targets and anchors and ran `git diff --check`. No application checks were run for this documentation-only change.

## 11 — Vault security documentation

- Documented browser-side AES-GCM encryption, the MongoDB snapshot, password/passkey/recovery key wrapping, and security boundaries in the README; added Mermaid storage and unlock diagrams.
- Checked implementation details against `crypto.ts`, `use-vault.ts`, the API route, and Mongo repository. `git diff --check` passed. No application tests were run for this documentation-only change.

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

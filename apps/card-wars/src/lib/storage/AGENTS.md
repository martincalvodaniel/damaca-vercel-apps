# Local Storage Rules

- IndexedDB through `idb` is the source of truth. Only this directory imports `idb` or opens databases. Keep browser APIs behind client boundaries and out of render/build execution.
- Keep one shared connection, recover from failed opens, close on version changes, and expose blocked upgrades to the user. Never silently fall back to volatile storage after a failed write.
- Add stores/indexes and ordered, non-destructive migrations in `database.ts`. Increase the database version for every schema change; preserve existing user records. Never delete a database to repair an upgrade.
- Validate application inputs and persisted records with shared Zod schemas. Await transaction completion before reporting success. Do not await network or unrelated work inside a transaction.
- Keep domain repositories here; components and feature hooks call repository functions. Shared schemas/types must not import browser storage APIs.
- Test fresh installs, reopening, invalid values, failures and migrations with isolated databases. `fake-indexeddb` tests do not replace browser/offline validation.
- Browser data belongs to the current origin/profile/device. Installation does not create backup, encryption, authentication or cross-device sync. Require a concrete backup/import design before introducing irreplaceable product data.
- Card Wars backups are approved: use the versioned JSON contract in `src/schemas/game.ts`, preserve each `startedAt` UTC instant, and import transactionally without overwriting conflicting local records.

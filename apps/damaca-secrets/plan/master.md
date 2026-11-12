# Damaca Secrets

A personal password vault for approved Google accounts. Each user manages their own titles, usernames, passwords, URLs, and notes, with local search, password generation, and clipboard actions. The English interface uses compact mobile navigation and desktop navigation from the monorepo starter.

App administrators approve and revoke access. Vault data and wrapped keys are encrypted in the browser before storage. The trusted web deployment serves the client. A database or app administrator cannot decrypt another user's vault through their role. The master password, a compatible WebAuthn PRF passkey, or a personal recovery code unlocks the vault. The recovery code requires current Google access and is stored by the user.

Offline reading is optional per browser. A previously synchronized encrypted copy supports password unlock for 24 hours by default, configurable by deployment. Writes and passkeys require connectivity. Reconnection checks permission before renewing the copy. A disconnected browser applies its local expiration policy.

The first release targets isolated Vercel Preview and real Android Chrome verification. Sharing, import, export, TOTP, and autofill are outside the first release.

See [iterations](iterations.md), [delivery log](iteration-log.md), and [app rules](../AGENTS.md).

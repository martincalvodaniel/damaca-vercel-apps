# Damaca Secrets

A personal password vault for approved Google accounts. Each user manages their own titles, usernames, passwords, URLs, and notes, with local search, password generation, and clipboard actions. The interface defaults to Spanish, offers English, remembers the selection per browser, and uses compact mobile navigation and desktop navigation from the monorepo starter.

App administrators approve and revoke access. Vault data and wrapped keys are encrypted in the browser before storage. The trusted web deployment serves the client. A database or app administrator cannot decrypt another user's vault through their role. The master password, a compatible WebAuthn PRF passkey, or a personal recovery code unlocks the vault. The recovery code requires current Google access and is stored by the user.

A successful online vault unlock or creation automatically prepares a password-protected read-only copy for 24 hours by default, configurable by deployment. The browser can opt out in Settings and delete its copy. Online saves update an existing copy without extending its lease. Writes and passkeys require connectivity, and reconnecting checks current access. A disconnected browser applies its local expiration policy.

The first release passed owner acceptance on Vercel Preview (`int`) and Chrome on Android. See [iteration 04 evidence](archive/2026-11-15/iteration-log.md#04--vercel-preview-and-device-acceptance). Sharing, import, export, TOTP, and autofill are outside the first release.

Installation uses the Damaca Secrets manifest and the generated vault icon. The shared generator and Vercel avatar are tracked in [AGW-27](../../../plan/iterations.md#agw-27--iconos-de-damaca-secrets).

See [iterations](iterations.md), [delivery log](iteration-log.md), and [app rules](../AGENTS.md).

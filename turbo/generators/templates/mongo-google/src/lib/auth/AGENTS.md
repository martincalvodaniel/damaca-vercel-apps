# Authentication Rules

- `auth.ts` and `session.ts` are server-only. `auth-client.ts` is client-only. Pure helpers must remain usable in isolated tests without importing server configuration.
- The current Better Auth configuration has no database adapter: do not assume users, accounts, or sessions are persisted in MongoDB. Cookie cache and OAuth state settings are deliberate; changing them requires a documented security decision.
- `ALLOWED_EMAILS` defines administrators only; MongoDB `user_access` grants normal access. Keep deny-by-default authorization and verify `session.user.emailVerified` before resolving access. `getAuthorizedSession()` attaches the current server-derived role, `requireAuthorizedSession()` redirects anonymous identities to sign-in and verified non-members to `/auth/access`, and `requireAdminSession()` rejects normal users from administration.
- Resolve admin membership before a database lookup, and check normal-user membership per request. Revocation must affect existing cookies on the next server access; do not persist roles in cookies or cache grants across requests. Only environment configuration may grant administrator access.
- For API handlers and Server Actions, return an appropriate unauthorized result and authorize resource ownership before accessing data. Do not rely solely on a layout or cookie presence in the proxy.
- Keep post-login redirects internal through `getSafeCallbackUrl()`. Cover any change to accepted redirect formats with meaningful regression tests.
- Better Auth's catch-all route delegates protocol input validation to the library. Validate new application-owned contracts with shared Zod schemas.
- Read configuration through `src/config/env.ts`. Never log cookies, tokens, OAuth credentials, or actual allowed email addresses.
- Unit tests do not establish that a real Google OAuth flow works. Record manual or integration evidence separately when that flow changes.
- Google identity creation accepts verified emails even without an application grant, so they can request access. `getVerifiedSession()` / `requireVerifiedSession()` do not grant product access; restrict them to identity-scoped self-service. Never use them as the only authorization for administration or product data.
- Request submission must ignore any client-provided email and use the verified session email. Pending/rejected records do not grant access. Admin review must validate and condition on the exact pending UUID; reopening after rejection creates a new UUID.

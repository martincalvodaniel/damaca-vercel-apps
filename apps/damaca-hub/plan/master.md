# Damaca Hub

## Current state

Damaca Hub is the authenticated directory for the monorepo's web applications and the central place to manage per-application access. Any verified Google identity can use the catalog and request access. Administrators are configured through `ALLOWED_EMAILS`.

## Current scope

- Show the five existing applications with product and preproduction links where configured.
- Persist an editable application catalog and per-application access requests and grants in MongoDB.
- Let users request access and resubmit after rejection or revocation. Let administrators approve, reject, grant, and revoke access.
- Pocha Score and Card Wars use central Hub OIDC and live grants when configured. Other applications retain their current access rules.
- Provide central OpenID Connect for the two registered consumers using the shared package.

## Decisions

- Access is independent for each application and applies to its production and preproduction environments.
- Production links are visible to authenticated users. Preproduction links are visible to administrators and users authorized for that application.
- The production Hub is intended to authorize both environments of connected applications. The `int` Hub deployment must use isolated configuration and data.
- Persist Google identities, sessions, OAuth records and signing keys in MongoDB, with versioned independent Hub cookies. Do not share cookies or session secrets between applications.
- The current OIDC and authorization boundary is recorded in [access-integration.md](../docs/access-integration.md).
- Seed the existing five applications idempotently without overwriting administrator edits. Unknown domains remain unconfigured.
- Deny access on authorization or database failures; never infer permission from a failed read.

## Exclusions

- No integration of applications beyond Pocha Score and Card Wars; preserve existing grants.
- No permission migration or integration with app templates.
- No MongoDB/Vercel provisioning, deployment, or production promotion.

## Open questions

- Production and `int` domains are not known, so links remain unavailable until configured by an administrator.
- Google OAuth and MongoDB credentials/callbacks must be supplied in the app's local or deployment environment before live authentication and persistence can be verified.

## Shared consumer integration AGW-05

The current human request authorizes mandatory Google authentication and Hub authorization for Pocha Score and Card Wars through the central Hub OIDC provider. This supersedes the previous delivery's exclusion of consumer integration. Google is configured only in Hub; consumers use independent OIDC clients and sessions. Primary status and evidence live in [root AGW-05](../../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package) and [root delivery log](../../../plan/iteration-log.md#agw-05-google-identity-and-hub-access).

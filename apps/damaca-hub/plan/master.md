# Damaca Hub

## Current state

Damaca Hub is the authenticated directory for the monorepo's web applications and the central place to manage per-application access. Any verified Google identity can use the catalog and request access. Administrators are configured through `ALLOWED_EMAILS`.

## Current scope

- Show the five existing applications with product and preproduction links where configured.
- Persist an editable application catalog and per-application access requests and grants in MongoDB.
- Let users request access and resubmit after rejection or revocation. Let administrators approve, reject, grant, and revoke access.
- Keep applications that are not integrated clearly identified. Hub decisions do not change their current access controls in this delivery.
- Document a future OpenID Connect integration boundary without implementing SSO endpoints or changing any other application.

## Decisions

- Access is independent for each application and applies to its production and preproduction environments.
- Production links are visible to authenticated users. Preproduction links are visible to administrators and users authorized for that application.
- The production Hub is intended to authorize both environments of connected applications. The `int` Hub deployment must use isolated configuration and data.
- Preserve the starter's Google identity and cookie session strategy. Do not share cookies or session secrets between applications.
- The future OIDC and authorization boundary is recorded in [access-integration.md](../docs/access-integration.md); this delivery does not implement it.
- Seed the existing five applications idempotently without overwriting administrator edits. Unknown domains remain unconfigured.
- Deny access on authorization or database failures; never infer permission from a failed read.

## Exclusions

- No changes to the other applications, their auth flows, or existing grants.
- No SSO/OIDC endpoints, consumer clients, permission migration, or integration with the app templates.
- No MongoDB/Vercel provisioning, deployment, or production promotion.

## Open questions

- Production and `int` domains are not known, so links remain unavailable until configured by an administrator.
- Google OAuth and MongoDB credentials/callbacks must be supplied in the app's local or deployment environment before live authentication and persistence can be verified.

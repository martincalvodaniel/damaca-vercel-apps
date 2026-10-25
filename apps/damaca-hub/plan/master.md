# Damaca Hub

## Current state

Damaca Hub is the authenticated directory for the monorepo's web applications and the central place to manage per-application access. Any verified Google identity can use the catalog and request access. Administrators are configured through `ALLOWED_EMAILS`.

## Current scope

- Show the five existing applications with product and preproduction links where configured.
- Persist an editable application catalog and per-application access requests and grants in MongoDB.
- Let users request access and resubmit after rejection or revocation for private applications. Let administrators approve, reject, grant, and revoke access.
- Pocha Score and Card Wars are public links and do not use app grants or OIDC clients.
- Let administrators manage persistent OIDC clients for existing private applications from the Hub.
- Show each application's own local icon in the catalog and administration cards. Keep copies synchronized through the root icon generator and independent of application deployment URLs.

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

## Superseded consumer integration AGW-05

AGW-05 temporarily integrated Pocha Score and Card Wars with mandatory identity. The owner reversed that decision in AGW-08. The games are public; Hub Google login remains available for private catalog access and OIDC administration. See [root AGW-08](../../../plan/iterations.md#agw-08--public-games-and-hub-managed-oidc-clients).

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).

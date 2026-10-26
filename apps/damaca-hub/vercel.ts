import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand:
    "TURBO_TELEMETRY_DISABLED=1 turbo run build --filter @damaca/damaca-hub",
  bunVersion: "1.4.x",
  installCommand:
    '[ "$VERCEL_INSTALL_COMPLETED" = "1" ] || bunx bun@1.4.4 install --frozen-lockfile --filter @damaca/damaca-hub',
  regions: ["cdg1"],
  crons: [{ path: "/api/cron/refresh-int", schedule: "0 0 * * *" }],
  routes: [
    {
      src: "/((?!api/cron/refresh-int(?:/|$)|api/auth/(?:oauth2/(?:token|userinfo|introspect|revoke)|jwks|\\.well-known/(?:openid-configuration|oauth-authorization-server))(?:/|$)).*)",
      missing: [
        {
          type: "header",
          key: "x-vercel-ip-country",
          value: "ES",
        },
      ],
      mitigate: { action: "deny" },
    },
  ],
}

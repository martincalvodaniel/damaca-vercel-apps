import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand:
    "TURBO_TELEMETRY_DISABLED=1 turbo run build --filter @damaca/damaca-hub",
  bunVersion: "1.4.x",
  installCommand:
    '[ "$VERCEL_INSTALL_COMPLETED" = "1" ] || bunx bun@1.4.4 install --frozen-lockfile --filter @damaca/damaca-hub',
  regions: ["cdg1"],
  routes: [
    {
      src: "/(.*)",
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

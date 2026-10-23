import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand: "turbo run build --filter @damaca/dalis-tasks-events",
  bunVersion: "1.4.x",
  installCommand:
    '[ "$VERCEL_INSTALL_COMPLETED" = "1" ] || bun install --frozen-lockfile --filter @damaca/dalis-tasks-events',
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

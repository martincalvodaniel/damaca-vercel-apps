import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand: "turbo run build --filter apps/dalis-home-management",
  bunVersion: "1.x",
  installCommand:
    "bunx bun@1.4.4 install --frozen-lockfile --filter apps/dalis-home-management",
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

import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  bunVersion: "1.4.x",
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

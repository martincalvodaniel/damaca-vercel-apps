import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand: "turbo run build --filter @damaca/my-next-template",
  bunVersion: "1.x",
  installCommand: "bunx bun@1.4.4 install --frozen-lockfile",
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

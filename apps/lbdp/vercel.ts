import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand:
    "TURBO_TELEMETRY_DISABLED=1 turbo run build --filter @damaca/lbdp",
  bunVersion: "1.4.x",
  git: {
    deploymentEnabled: false,
  },
  installCommand:
    "npx --yes --package=bun@1.4.4 bun install --frozen-lockfile --filter @damaca/lbdp",
  regions: ["cdg1"],
}

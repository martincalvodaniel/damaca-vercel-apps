import type { VercelConfig } from "@vercel/config/v1"

export const config: VercelConfig = {
  buildCommand:
    "TURBO_TELEMETRY_DISABLED=1 turbo run build --filter @damaca/ebrias-patanes-del-jurado",
  bunVersion: "1.4.x",
  git: {
    deploymentEnabled: false,
  },
  installCommand:
    '[ "$VERCEL_INSTALL_COMPLETED" = "1" ] || bunx bun@1.4.4 install --frozen-lockfile --filter @damaca/ebrias-patanes-del-jurado',
  regions: ["cdg1"],
}

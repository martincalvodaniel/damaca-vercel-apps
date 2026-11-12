import { headers } from "next/headers"
import { themeBootstrapScript } from "@/config/theme"

export async function ThemeBootstrap() {
  const nonce = (await headers()).get("x-nonce") ?? undefined
  return <script nonce={nonce}>{themeBootstrapScript}</script>
}

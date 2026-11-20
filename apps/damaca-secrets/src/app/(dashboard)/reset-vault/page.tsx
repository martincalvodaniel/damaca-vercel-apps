import { ResetVaultScreen } from "@/features/vault/components/reset-vault-screen"

export default async function ResetVaultPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>
}) {
  return <ResetVaultScreen returned={(await searchParams).verified === "1"} />
}

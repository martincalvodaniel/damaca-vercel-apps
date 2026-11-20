import { ContactRecoveryScreen } from "@/features/recovery/contact-recovery-screen"

export default async function TrustedContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>
}) {
  return (
    <ContactRecoveryScreen returned={(await searchParams).verified === "1"} />
  )
}

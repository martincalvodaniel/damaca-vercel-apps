import { safeCallback } from "@damaca/identity/contract"
import { HubSignIn } from "@damaca/identity/sign-in"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const query = await searchParams
  return (
    <HubSignIn
      appName="Card Wars"
      callbackUrl={safeCallback(query.callbackUrl)}
      initialError={Boolean(query.error)}
    />
  )
}

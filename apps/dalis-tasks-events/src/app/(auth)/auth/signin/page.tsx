import { redirect } from "next/navigation"
import { SignInCard } from "@/features/auth/components/sign-in-card"
import { identity } from "@/lib/auth/auth"
import { getSafeCallbackUrl } from "@/lib/auth/callback-url"

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[]
    error?: string | string[]
    reauthenticate?: string | string[]
  }>
}

function getFirstValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function getErrorMessage(error: string | undefined): string | undefined {
  if (!error) {
    return undefined
  }

  return error === "AccessDenied"
    ? "Tu cuenta no tiene acceso a esta aplicación."
    : "No se ha podido iniciar sesión. Inténtalo de nuevo."
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const query = await searchParams
  const callbackUrl = getSafeCallbackUrl(getFirstValue(query.callbackUrl))
  const session = await identity.getSession()
  const reauthenticate = getFirstValue(query.reauthenticate) === "1"

  if (session) {
    const decision = await identity.getAccess()
    if (decision === "approved") redirect(callbackUrl)
    if (reauthenticate) {
      return (
        <SignInCard
          callbackUrl={callbackUrl}
          initialError={getErrorMessage(getFirstValue(query.error))}
        />
      )
    }
    redirect(`/auth/access?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return (
    <SignInCard
      callbackUrl={callbackUrl}
      initialError={getErrorMessage(getFirstValue(query.error))}
    />
  )
}

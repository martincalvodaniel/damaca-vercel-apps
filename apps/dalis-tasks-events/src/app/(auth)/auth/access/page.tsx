import { redirect } from "next/navigation"
import { HubAccessCheck } from "@/features/auth/components/hub-access-check"
import { identity } from "@/lib/auth/auth"
import { getSafeCallbackUrl } from "@/lib/auth/callback-url"

interface AccessPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const session = await identity.getSession()
  if (!session) redirect("/auth/signin")

  const query = await searchParams
  const callbackUrl = getSafeCallbackUrl(
    Array.isArray(query.callbackUrl) ? query.callbackUrl[0] : query.callbackUrl
  )
  return <HubAccessCheck callbackUrl={callbackUrl} />
}

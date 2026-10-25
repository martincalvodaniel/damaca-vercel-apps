import { redirect } from "next/navigation"
import { getAuthEnv } from "@/config/env"
import { HubAccessCheck } from "@/features/auth/components/hub-access-check"
import { identity } from "@/lib/auth/auth"

export default async function RefreshPage() {
  if (!(await identity.getSession())) redirect("/auth/signin")
  const { hubUrl } = getAuthEnv()
  return <HubAccessCheck callbackUrl="/workspace" hubUrl={hubUrl} />
}

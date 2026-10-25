import { redirect } from "next/navigation"
import { getIdentity } from "@/lib/auth/identity"

export async function GET() {
  const decision = await getIdentity().getAccess(true)
  if (decision === "approved") redirect("/")
  if (decision === "signed-out") redirect("/auth/signin")
  redirect("/auth/access")
}

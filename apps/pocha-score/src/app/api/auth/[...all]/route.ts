import { getIdentity } from "@/lib/auth/identity"

async function handler(request: Request) {
  try {
    return await getIdentity().auth.handler(request)
  } catch {
    return Response.json(
      { error: "Identity service unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}

export { handler as GET, handler as POST }

import { getIdentity } from "@/lib/auth/identity"

export async function GET() {
  try {
    return await getIdentity().accessResponse()
  } catch {
    return Response.json(
      { decision: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}

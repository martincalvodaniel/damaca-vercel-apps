import { countPendingAdmissions } from "@/lib/admission"
import { getAuthorizedUser } from "@/lib/session"

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" }
  if ((await getAuthorizedUser())?.role !== "admin") {
    return new Response(null, { status: 403, headers })
  }

  return Response.json({ count: await countPendingAdmissions() }, { headers })
}

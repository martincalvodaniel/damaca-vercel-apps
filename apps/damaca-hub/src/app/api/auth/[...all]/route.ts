import { getHubAuth } from "@/lib/auth/auth"
import { getDatabase } from "@/lib/db/client"

async function handler(request: Request) {
  try {
    await getDatabase()
    return await (await getHubAuth()).handler(request)
  } catch {
    return Response.json(
      { error: "Identity service unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}

export { handler as GET, handler as POST }

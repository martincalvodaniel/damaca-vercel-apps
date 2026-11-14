import { getAuth } from "@/lib/auth"

async function handler(request: Request) {
  try {
    const auth = await getAuth()
    return await auth.handler(request)
  } catch {
    return Response.json(
      { error: "Authentication unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}

export { handler as GET, handler as POST }

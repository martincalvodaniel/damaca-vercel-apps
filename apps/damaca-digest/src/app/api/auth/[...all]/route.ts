import { getAuth } from "@/lib/auth/auth"

async function handle(request: Request) {
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

export { handle as GET, handle as POST }

import { revealVersion } from "@/features/tapas/contest"
import { readContest } from "@/features/tapas/store"
import { getAuthorizedUser } from "@/lib/session"

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" }
  if (!(await getAuthorizedUser()))
    return new Response(null, { status: 403, headers })
  const { contest } = await readContest()
  return Response.json({ version: revealVersion(contest) }, { headers })
}

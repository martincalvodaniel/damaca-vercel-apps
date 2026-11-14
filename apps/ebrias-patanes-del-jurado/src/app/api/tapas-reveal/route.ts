import { revealVersion, settleReveal } from "@/features/tapas/contest"
import { readContest } from "@/features/tapas/store"
import { getAuthorizedUser } from "@/lib/session"

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" }
  if (!(await getAuthorizedUser()))
    return new Response(null, { status: 403, headers })
  const stored = await readContest()
  const serverNow = Date.now()
  const contest = settleReveal(stored.contest, serverNow)
  return Response.json(
    {
      version: revealVersion(contest),
      countdown: contest.countdown ?? null,
      serverNow,
    },
    { headers }
  )
}

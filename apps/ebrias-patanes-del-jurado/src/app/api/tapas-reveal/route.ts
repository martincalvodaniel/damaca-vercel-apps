import {
  publicCountdown,
  revealAnnouncement,
  revealVersion,
  settleReveal,
} from "@/features/tapas/contest"
import { readAwardAvatars, readContest } from "@/features/tapas/store"
import { getAuthorizedUser } from "@/lib/session"

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" }
  if (!(await getAuthorizedUser()))
    return new Response(null, { status: 403, headers })
  const stored = await readContest()
  const serverNow = Date.now()
  const contest = settleReveal(stored.contest, serverNow)
  const award = revealAnnouncement(stored.contest, serverNow)
  const avatars = award
    ? await readAwardAvatars(
        award.tapas.flatMap(({ authors }) => authors.map(({ id }) => id))
      )
    : new Map<string, string>()
  return Response.json(
    {
      version: revealVersion(contest),
      countdown: publicCountdown(stored.contest, serverNow),
      serverNow,
      announcement: award && {
        ...award,
        tapas: award.tapas.map((tapa) => ({
          ...tapa,
          authors: tapa.authors.map((author) => ({
            ...author,
            image: avatars.get(author.id) ?? null,
          })),
        })),
      },
    },
    { headers }
  )
}

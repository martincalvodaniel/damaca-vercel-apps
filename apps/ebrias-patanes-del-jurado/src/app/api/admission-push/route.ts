import { normalizeEmail } from "@/lib/admission"
import { pushDevices } from "@/lib/admission-push"
import { getAuthorizedUser } from "@/lib/session"

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response(null, { status: 403 })
  }
  const user = await getAuthorizedUser()
  if (user?.role !== "admin") return new Response(null, { status: 403 })
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
    return new Response(null, { status: 503 })
  }

  const data = await request.json().catch(() => null)
  const endpoint = data?.endpoint
  const keys = data?.keys
  if (
    typeof endpoint !== "string" ||
    endpoint.length > 2048 ||
    !/^https:\/\/(?:fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)\//u.test(
      endpoint
    ) ||
    typeof keys?.p256dh !== "string" ||
    !/^[\w-]{87}$/u.test(keys.p256dh) ||
    typeof keys?.auth !== "string" ||
    !/^[\w-]{22}$/u.test(keys.auth)
  ) {
    return new Response(null, { status: 400 })
  }

  await pushDevices().updateOne(
    { _id: endpoint },
    {
      $set: {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        email: normalizeEmail(user.email),
      },
    },
    { upsert: true }
  )
  return new Response(null, { status: 204 })
}

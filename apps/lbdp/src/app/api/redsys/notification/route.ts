import { getSandboxConfig, verifyNotification } from "@/lib/redsys"

export async function POST(request: Request) {
  const config = getSandboxConfig()
  if (!config) return new Response(null, { status: 404 })

  const mediaType = request.headers.get("content-type")?.split(";")[0]?.trim()
  if (mediaType !== "application/x-www-form-urlencoded") {
    return new Response(null, { status: 415 })
  }

  const body = await request.text()
  if (body.length > 8192) return new Response(null, { status: 413 })

  const result = verifyNotification(new URLSearchParams(body), config)
  if (!result) return new Response(null, { status: 400 })

  console.info("Redsys sandbox notification verified", result)
  return new Response(null, { status: 200 })
}

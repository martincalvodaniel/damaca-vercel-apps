import { getAuthBaseUrl } from "@/config/env"
import { getAccessRole } from "@/lib/auth/access"
import { getVerifiedSession } from "@/lib/auth/session"
import { readVault, writeVault } from "@/lib/db/vault"
import { VAULT_BODY_LIMIT, vaultWriteSchema } from "@/schemas/vault"

const headers = { "Cache-Control": "no-store" }

function failure(status: number) {
  return Response.json({ error: status }, { status, headers })
}

async function authorize() {
  const session = await getVerifiedSession()
  if (!session) return failure(401)
  if (!(await getAccessRole(session.user.email))) return failure(403)
  return session.user.id
}

async function parseBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) return null
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let length = 0
  let text = ""
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) return JSON.parse(text + decoder.decode())
      length += value.byteLength
      if (length > VAULT_BODY_LIMIT) {
        await reader.cancel()
        return failure(413)
      }
      text += decoder.decode(value, { stream: true })
    }
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }
}

export async function GET() {
  const owner = await authorize()
  if (typeof owner !== "string") return owner
  return Response.json(await readVault(owner), { headers })
}

export async function PUT(request: Request) {
  if (request.headers.get("origin") !== new URL(getAuthBaseUrl()).origin) {
    return failure(403)
  }
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return failure(415)
  }
  const owner = await authorize()
  if (typeof owner !== "string") return owner
  const body = await parseBody(request)
  if (body instanceof Response) return body
  const payload = vaultWriteSchema.safeParse(body)
  if (!payload.success) return failure(400)
  const { revision, encrypted } = payload.data
  if (!(await writeVault(owner, revision, encrypted))) return failure(409)
  return Response.json({ revision: revision + 1 }, { headers })
}

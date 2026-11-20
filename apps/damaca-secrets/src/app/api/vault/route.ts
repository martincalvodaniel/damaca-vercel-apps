import { cookies } from "next/headers"
import { z } from "zod"
import { getAuthBaseUrl, getOfflineVaultDuration } from "@/config/env"
import { getAccessRole } from "@/lib/auth/access"
import { getVerifiedSession } from "@/lib/auth/session"
import {
  readResetProof,
  resetCookie,
  resetDuration,
  signResetProof,
} from "@/lib/auth/vault-reset-proof"
import {
  cancelVaultResetIntent,
  readVault,
  replaceVault,
  setVaultResetIntent,
  writeVault,
} from "@/lib/db/vault"
import {
  VAULT_BODY_LIMIT,
  vaultResetSchema,
  vaultWriteSchema,
} from "@/schemas/vault"

const headers = { "Cache-Control": "no-store" }

function failure(status: number) {
  return Response.json({ error: status }, { status, headers })
}

async function authorize() {
  const session = await getVerifiedSession()
  if (!session) return failure(401)
  if (!(await getAccessRole(session.user.email))) return failure(403)
  return session
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

function issueLease() {
  const checkedAt = Date.now()
  return { checkedAt, expiresAt: checkedAt + getOfflineVaultDuration() }
}

export async function GET() {
  const session = await authorize()
  if (session instanceof Response) return session
  const owner = session.user.id
  return Response.json(
    { ...(await readVault(owner)), ...issueLease() },
    { headers }
  )
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
  const session = await authorize()
  if (session instanceof Response) return session
  const owner = session.user.id
  const body = await parseBody(request)
  if (body instanceof Response) return body
  const payload = vaultWriteSchema.safeParse(body)
  if (!payload.success) return failure(400)
  const { revision, encrypted } = payload.data
  const lease = issueLease()
  if (!(await writeVault(owner, revision, encrypted))) return failure(409)
  return Response.json({ revision: revision + 1, ...lease }, { headers })
}

const resetAction = z.enum([
  "start",
  "claim",
  "cancel",
  "start-contacts",
  "claim-contacts",
])

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(getAuthBaseUrl()).origin)
    return failure(403)
  const session = await authorize()
  if (session instanceof Response) return session
  const action = resetAction.safeParse(await parseBody(request))
  if (!action.success) return failure(400)
  const store = await cookies()
  const previous = readResetProof(store.get(resetCookie)?.value)
  if (action.data === "cancel") {
    if (previous?.owner === session.user.id)
      await cancelVaultResetIntent(session.user.id, previous.resetId)
    store.delete(resetCookie)
    return Response.json({}, { headers })
  }
  const purpose = action.data.endsWith("-contacts") ? "contacts" : "reset"
  const claiming = action.data.startsWith("claim")
  const owner = session.user.id
  const current = await readVault(owner)
  if (!current.encrypted) return failure(409)
  const activeSession = session.session.id
  const now = Date.now()
  if (claiming) {
    if (
      !previous ||
      previous.purpose !== purpose ||
      previous.owner !== owner ||
      previous.revision !== current.revision
    )
      return failure(403)
    if (previous.stage === "intent") {
      const started = previous.expires - resetDuration
      if (
        previous.session === activeSession ||
        new Date(session.session.createdAt).getTime() < started
      )
        return failure(403)
    } else if (previous.session !== activeSession) return failure(403)
  }
  const resetId = claiming && previous ? previous.resetId : crypto.randomUUID()
  if (
    !claiming &&
    !(await setVaultResetIntent(owner, current.revision, resetId))
  )
    return failure(409)
  const expires = claiming && previous ? previous.expires : now + resetDuration
  store.set(
    resetCookie,
    signResetProof({
      owner,
      resetId,
      session: activeSession,
      revision: current.revision,
      expires,
      purpose,
      stage: claiming ? "grant" : "intent",
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: new URL(getAuthBaseUrl()).protocol === "https:",
      expires: new Date(expires),
    }
  )
  return Response.json(
    { ownerId: owner, revision: current.revision },
    { headers }
  )
}

export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(getAuthBaseUrl()).origin)
    return failure(403)
  const session = await authorize()
  if (session instanceof Response) return session
  const body = await parseBody(request)
  if (body instanceof Response) return body
  const payload = vaultResetSchema.safeParse(body)
  if (!payload.success) return failure(400)
  const store = await cookies()
  const proof = readResetProof(store.get(resetCookie)?.value)
  const owner = session.user.id
  if (
    proof?.stage !== "grant" ||
    proof.purpose !== "reset" ||
    proof.owner !== owner ||
    proof.session !== session.session.id ||
    proof.revision !== payload.data.revision
  )
    return failure(403)
  if (
    !(await replaceVault(
      owner,
      proof.revision,
      proof.resetId,
      payload.data.encrypted
    ))
  )
    return failure(409)
  store.delete(resetCookie)
  return Response.json({ revision: proof.revision + 1 }, { headers })
}

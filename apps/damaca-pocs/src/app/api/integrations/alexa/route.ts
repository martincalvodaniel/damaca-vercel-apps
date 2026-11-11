import { SkillRequestSignatureVerifier } from "ask-sdk-express-adapter"
import {
  type AlexaEnvelope,
  alexaReply,
  handleAlexa,
  isAlexaRequest,
} from "@/lib/alexa"
import { getAuth } from "@/lib/auth"
import { saveCapture } from "@/lib/captures"

export const runtime = "nodejs"

const verifier = new SkillRequestSignatureVerifier()

export async function POST(request: Request) {
  const {
    ALEXA_SKILL_ID: skillId,
    ALEXA_USER_ID: userId,
    ALEXA_OWNER_EMAIL: ownerEmail,
  } = process.env
  if (!skillId || !userId || !ownerEmail)
    return new Response(null, { status: 503 })

  const body = await request.text()
  if (body.length > 65_536) return new Response(null, { status: 413 })

  let envelope: AlexaEnvelope
  try {
    await verifier.verify(body, Object.fromEntries(request.headers))
    envelope = JSON.parse(body)
  } catch {
    return new Response(null, { status: 400 })
  }

  const now = new Date()
  if (!isAlexaRequest(envelope, skillId, userId, now.getTime())) {
    return new Response(null, { status: 400 })
  }

  try {
    const result = await handleAlexa(envelope, now, async (input) => {
      const context = await getAuth().$context
      const owner = await context.internalAdapter.findUserByEmail(
        ownerEmail.trim().toLowerCase(),
        {
          includeAccounts: true,
        }
      )
      if (
        !owner?.user.emailVerified ||
        !owner.accounts.some((account) => account.providerId === "google")
      ) {
        throw new Error("Alexa owner is unavailable")
      }
      return saveCapture(owner.user.id, input)
    })
    return Response.json(result)
  } catch {
    return Response.json(
      alexaReply("No he podido guardar la entrada. Inténtalo de nuevo.")
    )
  }
}

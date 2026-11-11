import type { CaptureInput } from "./captures"
import { parseReminderDate } from "./reminder-date"

export type AlexaEnvelope = {
  context?: {
    System?: {
      application?: { applicationId?: string }
      user?: { userId?: string }
    }
  }
  session?: { attributes?: { reminder?: string; date?: string } }
  request?: {
    type?: string
    timestamp?: string
    requestId?: string
    intent?: { name?: string; slots?: Record<string, { value?: string }> }
  }
}

export function alexaReply(
  text: string,
  attributes?: { reminder?: string; date?: string }
) {
  return {
    version: "1.0",
    sessionAttributes: attributes,
    response: {
      outputSpeech: { type: "PlainText", text },
      shouldEndSession: !attributes,
      ...(attributes && {
        reprompt: { outputSpeech: { type: "PlainText", text } },
      }),
    },
  }
}

export function isAlexaRequest(
  envelope: AlexaEnvelope,
  skillId: string,
  userId: string,
  now: number
) {
  const system = envelope?.context?.System
  const timestamp = Date.parse(envelope?.request?.timestamp ?? "")
  return (
    system?.application?.applicationId === skillId &&
    system.user?.userId === userId &&
    Math.abs(now - timestamp) <= 150_000
  )
}

const commandPrompt =
  "Di, por ejemplo, añade arroz a la compra o crea un recordatorio para llamar al dentista."

export async function handleAlexa(
  envelope: AlexaEnvelope,
  now: Date,
  save: (capture: Extract<CaptureInput, { source: "alexa" }>) => Promise<string>
) {
  const request = envelope.request
  if (request?.type === "SessionEndedRequest")
    return { version: "1.0", sessionAttributes: undefined, response: {} }
  if (request?.type === "LaunchRequest") return alexaReply(commandPrompt, {})

  const intent = request?.intent
  const slot = (name: string) => intent?.slots?.[name]?.value?.trim() ?? ""
  const requestId = request?.requestId
  if (request?.type !== "IntentRequest" || !requestId)
    return alexaReply(commandPrompt, envelope.session?.attributes ?? {})
  const attributes = envelope.session?.attributes
  const reminder = attributes?.reminder
  const date = attributes?.date

  switch (intent?.name) {
    case "AMAZON.StopIntent":
    case "AMAZON.CancelIntent":
      return alexaReply("Hasta luego.")
    case "AddShoppingItem": {
      const text = slot("Item")
      if (!text || text.length > 300)
        return alexaReply(
          "Di añade seguido del artículo, por ejemplo añade arroz a la compra.",
          attributes ?? {}
        )
      await save({ source: "alexa", requestId, kind: "shopping", text })
      return alexaReply("Guardado en tu lista de la compra de Damaca.")
    }
    case "AddReminder": {
      const text = slot("Reminder")
      if (!text || text.length > 300)
        return alexaReply(
          "Dime qué quieres recordar con una frase breve.",
          attributes ?? {}
        )
      return alexaReply("¿Qué día? Di, por ejemplo, para mañana.", {
        reminder: text,
      })
    }
    case "SetReminderDate": {
      if (!reminder) return alexaReply(commandPrompt, {})
      const value = slot("Date")
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(value))
        return alexaReply("Dime un día concreto.", { reminder })
      return alexaReply(
        "¿A qué hora? Di, por ejemplo, a las nueve de la mañana.",
        { reminder, date: value }
      )
    }
    case "SetReminderTime": {
      if (!reminder) return alexaReply(commandPrompt, {})
      if (!date)
        return alexaReply("¿Qué día? Di, por ejemplo, para mañana.", {
          reminder,
        })
      const dueAt = parseReminderDate(date, slot("Time"), now)
      if (!dueAt) {
        return alexaReply(
          "Dime otra hora futura. También puedes cambiar el día.",
          { reminder, date }
        )
      }
      await save({
        source: "alexa",
        requestId,
        kind: "reminder",
        text: reminder,
        dueAt,
      })
      return alexaReply("Recordatorio guardado en Damaca.")
    }
    default:
      return alexaReply(commandPrompt, attributes ?? {})
  }
}

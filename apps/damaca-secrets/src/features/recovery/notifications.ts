import "server-only"

import { after } from "next/server"
import { getAuthBaseUrl, getRecoveryEmailEnv } from "@/config/env"

const subjects = {
  invite: "Damaca Secrets · Trusted contact invitation / Invitación",
  request:
    "Damaca Secrets · Vault recovery request / Solicitud de recuperación",
  cancel: "Damaca Secrets · Recovery cancelled / Recuperación cancelada",
} as const

export function notifyRecovery(
  event: keyof typeof subjects,
  identifier: string,
  recipients: readonly string[]
) {
  const settings = getRecoveryEmailEnv()
  if (!settings) return
  const url = new URL("/trusted-contacts", getAuthBaseUrl()).href
  after(async () => {
    const results = await Promise.allSettled(
      recipients.map(async (recipient, index) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(5000),
          headers: {
            Authorization: `Bearer ${settings.token}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `damaca-secrets/${event}/${identifier}/${index}`,
          },
          body: JSON.stringify({
            from: settings.from,
            to: [recipient],
            subject: subjects[event],
            text: `Consulta el estado en Secrets. Si no reconoces una solicitud de recuperación, puedes cancelarla desde ese mismo enlace.\n\nCheck the status in Secrets. If you do not recognize a recovery request, you can cancel it there.\n\n${url}`,
          }),
        })
        if (!response.ok) throw new Error("Recovery email delivery failed")
      })
    )
    if (results.some(({ status }) => status === "rejected")) {
      console.warn("One or more recovery email notifications failed")
    }
  })
}
